import test from 'node:test';
import assert from 'node:assert/strict';
import {groqConfigured, requestSemanticReview} from '../lib/semantic-provider';

test('an old paid-provider key cannot activate or receive semantic calls', async () => {
  const config = {OPENAI_API_KEY: 'unused-test-value'};
  assert.equal(groqConfigured(config), false);
  let calls = 0;
  await assert.rejects(requestSemanticReview(config, [], (async () => {calls++; throw Error();}) as typeof fetch), /not configured/);
  assert.equal(calls, 0);
});

test('semantic requests use Groq and preserve the messages', async () => {
  const messages = [{role: 'user' as const, content: 'Synthetic application'}];
  await requestSemanticReview({GROQ_API_KEY: 'test-only'}, messages, (async (url, options) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer test-only');
    const body = JSON.parse(options?.body as string);
    assert.equal(body.model, 'openai/gpt-oss-20b');
    assert.deepEqual(body.messages, messages);
    return Response.json({choices: [{message: {content: '{}'}, finish_reason: 'stop'}]});
  }) as typeof fetch);
});

test('quota errors do not retry or fall back and never expose provider bodies', async () => {
  let calls = 0;
  await assert.rejects(requestSemanticReview({GROQ_API_KEY: 'test-only', OPENAI_API_KEY: 'unused'}, [], (async () => {
    calls++; return new Response('private provider details', {status: 429});
  }) as typeof fetch), {message: 'Groq quota reached.'});
  assert.equal(calls, 1);
});

test('truncated semantic reviews are rejected', async () => {
  await assert.rejects(requestSemanticReview({GROQ_API_KEY: 'test-only'}, [], (async () =>
    Response.json({choices: [{message: {content: '{}'}, finish_reason: 'length'}]})
  ) as typeof fetch), /incomplete review/);
});
