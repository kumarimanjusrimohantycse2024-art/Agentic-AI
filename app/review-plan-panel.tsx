'use client';
import {reviewPlan, interviewBrief} from '@/lib/review-plan';
import {type Candidate, type Requisition} from '@/lib/screening';
import {downloadText} from '@/lib/import-client';

export function ReviewPlanPanel({candidate, job}: {candidate: Candidate; job: Requisition}) {
  const plan = reviewPlan(candidate, job);
  return <section aria-label="Evidence and interview plan">
    <h3 className="subsection">{plan.title}</h3>
    <p>{plan.explanation}</p>
    <p className="muted smaller">{plan.policy}</p>
    {plan.items.map(item => <details className="evidence-card" key={item.criterion}>
      <summary><b>{item.criterion}</b> · {item.required ? 'Required' : 'Preferred'} · {item.status}</summary>
      <p><b>{item.action}</b></p><p>{item.question}</p>
      <ul>{item.checklist.map(check => <li key={check}>{check}</li>)}</ul>
    </details>)}
    {plan.clarifications.map((item, i) => <p key={i} className="warning-line">{item.question}</p>)}
    <button className="button" onClick={() => downloadText('interview-evidence-brief.txt', interviewBrief(candidate, job), 'text/plain')}>Download interview brief</button>
  </section>;
}
