# Tracehire — Agentic AI Talent Screening

An evidence-first recruiting workspace for the PS02 Autonomous Talent-Acquisition Screening Agent challenge. Supports a saved HR profile, resumable bulk intake, source-linked evidence reports, multi-dimensional shortlist recommendations, GitHub checks, candidate comparisons, pool gaps, and what-if analysis.

## Quick start

Requirements: Node.js 22.13+, npm. This project targets Cloudflare Workers with D1 and R2 using the included Vinext/React starter.

```bash
npm ci
npm run typecheck
npm test
npm run db:generate   # only after changing db/schema.ts
npm run dev
```

The deployed Site uses platform-owned **Sign in with ChatGPT**. The stable authenticated account ID scopes every API query and storage operation. Profiles and reviews persist after sign-out. The private hosted deployment initially permits only its owner; access for other HR users must be granted by the site owner. Each admitted account has its own workspace; shared organization memberships are not implemented.

Local requests without trusted authentication can explore the synthetic demo. Protected APIs return 401. The dispatch-owned `/signin-with-chatgpt` and `/signout-with-chatgpt` routes run on the hosted platform. Do not put the Worker behind an untrusted proxy that forwards spoofable identity headers. A standalone deployment needs an equivalent trusted authentication gateway.

## Configuration

Logical platform bindings are declared in `.openai/hosting.json`: `DB` (D1) and `BUCKET` (R2). Schema migrations are in `drizzle/` and must be applied before requests reach the Worker. Database initialization does not create tables at runtime.

Copy `.env.example` into your ignored local environment file if configuring local secrets. Use hosted runtime secret configuration for production:

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Server-only key from a Groq Free-plan account; enables semantic evidence review |
| `GROQ_MODEL` | Default `openai/gpt-oss-20b`, served by Groq; requires JSON object support |
| `GITHUB_TOKEN` | Optional GitHub token restricted to reading public resources; increases quota |

No credential is embedded in the client, source, or demo. Without an AI key the application **uses deterministic rules and labels this explicitly**. The UI and reports never simulate a language-model call. Groq account tier and GitHub quotas belong to the operator. The application calls only Groq for semantic review and has no paid-provider fallback. An old `OPENAI_API_KEY` does not activate AI. A Groq key from an upgraded paid account can still incur charges: keep the account on the Free plan.

### Activate free semantic review

1. Sign up at [Groq Console](https://console.groq.com/keys) and create a key in your own account. Stay on the **Free plan**; do not upgrade to Developer billing.
2. Save it in your hosting environment as the **secret** `GROQ_API_KEY`. Never paste it into chat, GitHub, or a browser-side variable. Set `GROQ_MODEL=openai/gpt-oss-20b` (or use the default), then redeploy for hosted environment changes to take effect.
3. Settings shows configuration status. Process a small synthetic application and inspect its agent trace to confirm an actual successful Groq assessment. Configuration alone does not prove that a key works.

Groq's [free quota](https://console.groq.com/docs/rate-limits) currently lists 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute and 200,000 tokens/day for this model (checked 2026-09-10). Your account limits are authoritative and may change. A 1,000-résumé intake does **not** promise 1,000 free semantic reviews per day: token quotas can be reached much earlier. Rate limits, invalid credentials, timeouts or invalid responses retain the evidence-rule report with an explicit trace; there are no automatic provider retries, key rotation or paid fallback. Re-screen later when quota is available. Hosting and storage have their own terms; this setup does not promise universally free hosting.

Résumé source lines are sent to Groq for semantic analysis. Review [Groq data controls](https://console.groq.com/docs/your-data); all customers can enable Zero Data Retention. Model interpretations still require HR review.

## HR workflow

1. Explore the clearly labeled synthetic demo, or sign in and open your own workspace.
2. Create/edit a requisition, explicit aliases, required versus preferred skills, minimum documented experience and salary limit.
3. Import PDF, DOCX, TXT, Markdown or ZIP; or paste a résumé and cover note as one application. Names initially come from filenames.
4. Start **Process queue** in Agent activity. Three bounded workers claim durable tasks. Closing the page stops new requests; uploaded tasks and completed results remain saved. Resume after returning; expired leases are reclaimable.
5. Inspect exact source lines, unsupported/missing evidence, explicit contradictions, GitHub links, processing trace and follow-up questions.
6. Compare two applicants and examine pool coverage. Change what-if requirements to recompute review order and see changed reasoning. Apply a scenario explicitly to save it.
7. Record a final HR decision with a note. Export CSV summaries, JSON evidence reports, or follow-up questions. No rejection email is sent.
8. If a skill definition or alias changes, use **Re-screen applicants**, then process the queue. What-if changes to requirement flags, salary and experience reuse existing evidence.

## All eight requested features

| Feature | Implementation |
| --- | --- |
| Evidence verification | Work actions and context establish same-document corroboration; original line citations retained |
| Unsupported claims | Keyword-only claims receive low evidence confidence and follow-up questions |
| Equivalent skills | Explicit configurable aliases; optional semantic review handles additional paraphrases |
| Contradictions | Explicit opposing statements cite both sides; timeline deficits are unsupported, not accusations |
| Missing evidence | Separate status for unaddressed requisition criteria |
| Comparison | Per-dimension statuses and trade-off narratives; no opaque combined fit score |
| Pool gaps | Supported count per criterion and explicit notice when nobody satisfies all requirements |
| What-if | Live recalculation of readiness, rank, remaining gaps and saved-versus-scenario differences |

Additional features: role-agnostic evidence-request checklists, downloadable interview briefs with source citations, explicit keyword-only shortlisting guidance, authenticated persistence, original-file retention, import deduplication, durable retries and leases, account-scoped data access, review audit trail, requisition conflict alerts, licensed external open-source contribution checks, PDF/DOCX parsing, protected API routes, safe CSV export, downloadable reports, responsive accessible controls, 12 synthetic applications and a repeatable 1,000-applicant evidence-engine test.

## GitHub priority and rejection recommendations

When enabled, applicants with verified external merged PRs in repositories with recognized licenses appear first, then complete requirements, supported required skills, and fewer gaps. This order is explicit and all weaknesses remain visible.

A public GitHub requirement is configurable. Missing or invalid GitHub evidence produces **Recommend reject**, never an automatic final rejection. Network failures, quota exhaustion and incomplete verification produce **unverified**, not an adverse conclusion. HR can accept private-work evidence or request clarification.

A proper repository check requires a non-fork, non-archived repository with code and a readable README. The lookup examines up to 100 recently updated repositories and checks READMEs for up to three eligible repositories. External contribution checks examine up to five merged PR results and confirm a recognized target license. Counts are bounded **verified results**, not lifetime totals. The applicant's ownership of a linked account is self-declared and must be confirmed separately. Code quality, authorship, plagiarism and contributor identity are not conclusively established by these checks.

## Keyword-only claims and generic job roles

A list containing every required keyword is not sufficient for shortlisting. Required criteria stay unsupported until a specific example corroborates them; missing criteria remain distinct. The report now provides an evidence-request checklist and an interview brief for every configured criterion, including non-engineering roles. Supported examples get ownership/depth questions, missing skills get neutral experience questions, and contradictions get clarification prompts with the original citations. These plans are deterministic and work without an API key.

Ask for context, the applicant's personal contribution, an outcome and a permitted way to check it. A numeric metric or public GitHub repository is not universally mandatory. Accept relevant redacted work, non-code artifacts and live walkthroughs. If a required skill remains unsupported, hold for clarification or record a reasoned HR decision; do not equate absent evidence with dishonesty. Job requirements and required/preferred flags remain configurable. The app remains a recruiting tool, not a general-purpose chat assistant.

## Dataset

`samples/applications/` contains 12 fictional résumé-plus-cover-note texts; `public/sample-applications.zip` makes them importable together. `lib/demo.ts` adds explicitly synthetic contribution fixtures for visual exploration. Importing the text samples runs actual checks and does **not** reproduce fake GitHub results. The default requisition deliberately has no complete match. Samples cover aliases, keyword stuffing, timeline gaps, leadership conflict, salary gaps, and missing cloud evidence.

## Validation

`npm test` covers evidence/ranking cases, including a 1,000-candidate batch, plus mocked Groq routing and failure handling. No live model call is tested without an operator-provided key. `npm run typecheck` checks TypeScript. Database validation is in `tests/database_test.py` (`python tests/database_test.py`). This is not a claim of 1,000 concurrent network/model/GitHub requests or a production load certification.

## Practical limits

- 1,000 application tasks per requisition; each file ≤5 MB, text ≤100,000 characters, PDF ≤40 pages. ZIP ≤25 MB and ≤100 MB extracted. Oversized archives and unreadable/scanned PDFs are rejected clearly; OCR is not included.
- Queue dispatch runs while the authenticated workspace is open. It is durable and resumable, not an always-on scheduled service.
- Same-document corroboration is **not independent proof**. A detailed fabricated project can still look supported; request a work sample, walkthrough or reference.
- Rule-based extraction is deliberately conservative, line-oriented and English-focused. PDF reading order, date formats and context can affect results. Experience is approximate year-based union of non-education intervals, not a certified employment-duration calculation. Multiple projects within education sections may need manual review.
- AI outputs are schema-validated with source line existence and coverage checks. Interpretations can still be wrong. Provider failures or invalid outputs retain the deterministic assessment and a visible trace note.
- GitHub is rate limited; quotas may prevent all 1,000 applications from being externally checked in one run. Unavailable checks remain unverified and can be rerun.
- This is a functional deployable application, not a guarantee of employment-law compliance, production security certification, or perfect hiring accuracy. Human review is built into final decisions.

## Project layout

- `app/workspace.tsx`, `app/globals.css`: responsive HR interface
- `app/api/`: authenticated workspace, intake, queue processing and report endpoints
- `lib/screening.ts`: pure evidence, ranking, comparison and what-if engine
- `lib/agents.ts`: bounded GitHub and optional semantic model agents
- `lib/server.ts`: authentication, ownership, prepared-query and storage helpers
- `lib/import-client.ts`: PDF/DOCX/TXT/ZIP parsing and safe exports
- `db/schema.ts`, `drizzle/`: D1 schema and versioned migrations
- `tests/`, `samples/`: tests and challenge dataset

The original starter's build and execution scripts are retained for the Sites runtime. App-generated résumé data, secrets and environment state are ignored by Git.
