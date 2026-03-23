# CLAUDE.md

> Project-specific instructions for Claude Code sessions.

## Key Documentation

**Comprehensive project documentation:** `project_prompt.md` in this directory.
Read it first — it contains the complete architecture, API contracts, field naming rules, and development guidelines for this frontend.

## Testing

**Do not run `npm test`, `jest`, or any test framework on this project.**

This project has no test suite. Running tests causes Jest worker crashes on Windows CI runners (`ChildProcessWorker` spawn failures). Claude Code should not attempt to validate code by running tests.

- Use `npm run build` (type-check + build) to verify code correctness instead.
- Use `npx tsc --noEmit` for fast type-checking without building.

## Development

- `npm run dev` — Start Next.js dev server on http://localhost:3000
- `npm run build` — Production build
- `npm run lint` — ESLint

## Backend

- Backend runs separately at `http://127.0.0.1:8000`
- API base: `http://127.0.0.1:8000/api`
- Frontend reads `NEXT_PUBLIC_API_URL` from `.env.local` (defaults to `http://127.0.0.1:8000/api`)
