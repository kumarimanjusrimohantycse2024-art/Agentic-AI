// Fixed Groq endpoint: never route requests or credentials to another provider.
type Config = Record<string, string | undefined>;
type Message = {role: 'system' | 'user'; content: string};
export function groqConfigured(config: Config) {
  return Boolean(config.GROQ_API_KEY?.trim());
}
export class SemanticProviderError extends Error {}

export async function requestSemanticReview(config: Config, messages: Message[], send: typeof fetch = fetch) {
  const key = config.GROQ_API_KEY?.trim();
  if (!key) throw new SemanticProviderError('Groq key is not configured.');
  const response = await send('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: config.GROQ_MODEL?.trim() || 'openai/gpt-oss-20b',
      temperature: 0, max_completion_tokens: 4096,
      response_format: {type: 'json_object'}, messages,
    }),
  });
  // No automatic retries or paid fallback. Never expose provider response bodies.
  if (response.status === 429) throw new SemanticProviderError('Groq quota reached.');
  if (response.status === 401 || response.status === 403) throw new SemanticProviderError('Groq key or model access needs attention.');
  if (!response.ok) throw new SemanticProviderError('Groq service could not complete this review.');
  const payload = await response.json() as {choices?: {message?: {content?: string}; finish_reason?: string}[]};
  if (payload.choices?.[0]?.finish_reason !== 'stop') throw new SemanticProviderError('Groq returned an incomplete review.');
  return payload;
}
