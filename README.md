# TraceHire Agentic AI

TraceHire is an evidence-first recruiting workspace that helps HR teams review applications with transparent reasoning, source citations, and consistent decision support.

## Why this project matters

- Converts unstructured résumé data into structured, reviewable evidence.
- Highlights supported, unsupported, and contradictory claims instead of producing opaque scores.
- Supports reproducible hiring workflows with exportable reports and deterministic fallback behavior.

## Features

- Requisition management (required vs preferred skills, aliases, experience/salary constraints)
- Bulk intake from PDF, DOCX, TXT, Markdown, ZIP, and pasted application text
- Evidence-based screening with source-line citations and follow-up question generation
- Candidate comparison and pool-gap analysis
- What-if scenario analysis without mutating saved requisitions
- Optional semantic review via Groq (with deterministic fallback when unavailable)
- Optional GitHub public-profile checks with bounded, explicit verification rules
- Export support for CSV summaries and JSON evidence reports

## Tech stack

- **Runtime/UI:** React 19, Next 16, Vinext, TypeScript, Tailwind CSS
- **Data:** Cloudflare D1 + Drizzle ORM migrations
- **Storage:** Cloudflare R2
- **Validation/quality:** Node test runner, TypeScript typecheck, ESLint

## Project structure

- [`app/`](/app) – UI routes and API endpoints
- [`components/`](/components) – reusable UI components
- [`lib/`](/lib) – screening engine, server helpers, import/parsing logic
- [`db/schema.ts`](/db/schema.ts) – database schema
- [`drizzle/`](/drizzle) – versioned SQL migrations
- [`tests/`](/tests) – screening, semantic-provider, and database tests
- [`samples/`](/samples) – synthetic sample application dataset

## Prerequisites

- Node.js **22.13+**
- npm **10+**
- Python **3.10+** (only for `tests/database_test.py`)

## Installation

```bash
npm ci
```

## Configuration

1. Copy variables from [`.env.example`](/.env.example) into your local environment file.
2. Set `GROQ_API_KEY` only if you want semantic review.
3. Optional: set `GITHUB_TOKEN` for higher public GitHub API quota.
4. Keep all secrets server-side; never commit credentials.

Cloudflare binding names are defined in [`.openai/hosting.json`](/.openai/hosting.json):

- `DB` (D1)
- `BUCKET` (R2)

## Usage

Start local development:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run local worker preview against the built output:

```bash
npm run start
```

## Testing and validation

```bash
npm test
npm run typecheck
python tests/database_test.py
```

## CI

GitHub Actions runs install, typecheck, tests, database tests, and build on pull requests and pushes.

- Workflow: [`.github/workflows/npm-publish-github-packages.yml`](/.github/workflows/npm-publish-github-packages.yml)

## Troubleshooting

- **`npm test` fails before dependencies are installed:** run `npm ci` first.
- **Semantic review not active:** verify `GROQ_API_KEY` is set in the runtime environment.
- **Protected API returns 401 locally:** authenticated routes require trusted identity headers from hosted auth flow.
- **Schema mismatch errors:** apply migrations from [`drizzle/`](/drizzle) before running against a real D1 database.

## Contributing

1. Create a feature branch.
2. Keep changes focused and add/update tests when behavior changes.
3. Run local checks before opening a PR:
   - `npm test`
   - `npm run typecheck`
   - `python tests/database_test.py`

## License and project status

- **License:** No license file is currently present in this repository.
- **Status:** Active development / portfolio project.
