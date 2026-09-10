import {fit, type Candidate, type Requisition} from './screening';

/** Role-agnostic reviewer guidance, computed from evidence, never keyword counts. */
export function reviewPlan(candidate: Candidate, job: Requisition) {
  const match = fit(candidate, job);
  const unresolved = match.dimensions.filter(d => d.required && d.status !== 'supported');
  const contradictions = candidate.assessment.flags.filter(f => f.type === 'contradiction');
  const title = unresolved.length ? 'Request evidence before shortlisting'
    : contradictions.length ? 'Clarify conflicting statements before shortlisting'
    : match.complete ? 'Proceed to human validation' : 'Review remaining job constraints';
  const explanation = unresolved.length
    ? `${unresolved.length} required criteria lack sufficient support. Matching words alone do not establish competence. This is an evidence gap, not proof that the applicant lacks the skill.`
    : 'Documented support can justify further review. Validate ownership and depth through a work sample or walkthrough before making a hiring decision.';
  const items = [...match.dimensions].sort((a, b) => Number(b.required) - Number(a.required)).map(d => ({
    criterion: d.name, required: d.required, status: d.status,
    action: d.status === 'supported' ? 'Validate the described work'
      : d.status === 'missing' ? 'Ask whether relevant experience exists'
      : d.status === 'partial' ? 'Clarify transferable experience and remaining gaps'
      : 'Request support for the stated claim',
    citations: d.evidence.length ? d.evidence : d.claims,
    question: d.status === 'supported'
      ? `Walk through your cited ${d.name} work. What did you personally do, which trade-off did you make, and how did you check the result?`
      : d.status === 'missing'
      ? `Do you have a relevant example involving ${d.name}? If so, describe your contribution and result; if not, explain what you would need to learn.`
      : `You mention ${d.name}${d.status === 'partial' ? ' or related experience' : ''}. Describe one concrete task, your own contribution, the result, and how a reviewer could check it.`,
    checklist: ['A specific work or project example and context', 'The applicant’s own actions and responsibilities', 'An outcome and how it was evaluated', 'A permitted work sample, redacted artifact, or live walkthrough'],
  }));
  return {title, explanation, items, constraints: match.tradeoffs,
    clarifications: contradictions.map(f => ({title: f.title, question: `Please reconcile these statements about ${f.title} and explain their dates or context.`, citations: f.citations})),
    policy: 'Quantified outcomes help but are not mandatory. Private work, non-code artifacts and live demonstrations can provide evidence. Never request confidential employer material. HR records the final decision with a job-related reason.'};
}

export function interviewBrief(candidate: Candidate, job: Requisition) {
  const plan = reviewPlan(candidate, job);
  return [`Interview evidence brief: ${candidate.name}`, `Role: ${job.title}`, plan.title, plan.explanation,
    ...plan.items.map((item, index) => `${index + 1}. ${item.criterion} (${item.required ? 'required' : 'preferred'}; ${item.status})\n${item.action}\nQuestion: ${item.question}\nCheck: ${item.checklist.join('; ')}${item.citations.length ? '\nSource: ' + item.citations.map(c => `line ${c.line}: ${c.quote}`).join('\n') : '\nNo supporting source citation available.'}`),
    ...plan.clarifications.map(c => `${c.question}\n${c.citations.map(s => `Line ${s.line}: ${s.quote}`).join('\n')}`),
    `Remaining constraints: ${plan.constraints.join('; ') || 'None recorded'}`, plan.policy,
  ].join('\n\n');
}
