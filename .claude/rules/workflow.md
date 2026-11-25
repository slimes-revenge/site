# Task workflow

1. **Start** — understand the task from the user. Write the acceptance criteria before writing code; if the task has none, propose them and get them confirmed. If the requirement is ambiguous, ask; do not guess.
2. **Branch** — before the first edit, switch to a branch for the task created from the base branch **`dev`** (production deploys from `main`). Without a given name use `wip-<short-topic>`.
3. **Implement** — the smallest change that satisfies the criteria. Follow the rules in `.claude/rules/` and the matching note in `docs/` (`AGENTS.md` → notes). Before writing Next.js code, read the guide for that API in `node_modules/next/dist/docs/`.
4. **Verify** — run the checks CI runs: `npx eslint .`, `npx prettier --check .`, `npx tsc --noEmit`, `npm run build`. A visible change is also checked in the browser (`npm run start` after the build, or `npm run dev`): light and dark mode, laptop and phone width (375 px), with a screenshot or a description in the report. A change to data loading is checked with both the live report and the sample fallback.
5. **Simplify** — KISS / DRY / YAGNI pass over the whole diff (`kiss-dry-yagni` rule). Re-run the affected checks.
6. **Review** — the change is reviewed by someone who did not write it (the user, or a separate subagent given the requirement, the criteria and the diff base). Fix or answer every finding. Merge only after approval.
7. **Document** — `docs/` notes, `AGENTS.md`, `README.md` (`documentation` rule).
8. **Report** — what changed, the checks run with their outcome, what is left, and every question to the user that is still unanswered (from `docs/questions.md`, asked again). Follow-ups go to `docs/plan.md`, not into code.

Problems noticed outside the task's scope are not fixed silently and not dropped: report them and add them to `docs/plan.md`.

## Definition of Done

- Every acceptance criterion is met and has a recorded check (a command and its result, or a browser check with a screenshot or description) that proves it.
- Lint, format check, type check and `npm run build` ran and passed in this session, with the commands named in the report.
- No new `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `as any` or rule added to `eslint.config.mjs` to get green.
- The report contract stays in step with the simulator: a change to `src/data/schema.ts` matches `docs/report-format.md` in `slimes-revenge/simulator`, and the sample still validates.
- KISS / DRY / YAGNI pass done.
- Documentation updated.

## Reporting

Keep three statements apart: **check written**, **check run**, **check passed**. "Verified" means a check ran and passed in this session. When a check was not run, say so and why. When a check failed, show the failing output.

## Git

- Never write code on `dev`, `main` or someone else's branch. Check `git branch --show-current` right before every commit and push; if it is not the task's branch, stop.
- Commit messages follow conventional commits (`fix:`, `feat:`, `feat!:` / `BREAKING CHANGE:`, `chore:`, `docs:`, `test:`, `ci:`), one logical change per commit.
- A pull request targets `dev`. Its description says what changes and why, how it was verified (commands and results), and what is not verified.
- Do not force-push shared branches and do not rewrite pushed history. Tags are not deleted without the user's yes.
- Pull requests are merged with **squash** (one commit per PR on `dev`).
- Work in the repository's main checkout on a task branch: no git worktrees, temporary clones or side checkouts. Uncommitted changes found there are shown to the user, not routed around.
- After a merge, delete the task branch locally. A squash-merged branch is not an ancestor of `dev`, so check by the pull request (`gh pr list --state merged --head <branch>`), then `git branch -D <branch>`. Remote branches are deleted only with the user's yes.
