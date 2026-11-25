# Documentation and decisions

Context ends; project knowledge must not. Anything whose loss would force someone to re-investigate, or would lead to a wrong decision, goes into `docs/`. `docs/` is committed with the code it describes.

## Where things live

| What                                                                                                                                 | Where                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What the project is, layout, commands, gotchas, where the docs are                                                                   | `AGENTS.md` (written by hand)                                                                                                                                 |
| What the site shows, how to run it, the data source, the Vercel setup, the planned pages, for a person                               | `README.md`                                                                                                                                                   |
| Lasting knowledge about the site and its data                                                                                        | `docs/<topic>.md`, index in `docs/README.md`                                                                                                                  |
| Decisions a reader could take for a mistake                                                                                          | `docs/adr/NNNN-<title>.md`                                                                                                                                    |
| Where the work stands, findings outside the task's scope, follow-ups, questions for the user, input only an outside party can supply | the four session files `docs/now.md`, `docs/plan.md`, `docs/questions.md`, `docs/missing.md` — git-ignored (the repository is public), local to this checkout |
| Rules for agents                                                                                                                     | `.claude/rules/`                                                                                                                                              |
| Repeatable procedures for agents                                                                                                     | `.claude/skills/<name>/SKILL.md`                                                                                                                              |

Do not create other task-, plan- or status-files in `docs/`.

Write notes in English, short sentences.

## Knowledge notes (`docs/<topic>.md`)

Record:

- How a part of the site actually behaves when it is not obvious from one file: when data is fetched and cached, how the report maps onto the page, what the fallback does.
- Contracts with the simulator (the report format) and with libraries (Next.js rendering and caching, MUI theming): what they really do, quirks, limits.
- Results of investigations: what was checked, what was found, what was ruled out.
- Implementation details a future change must respect.

Do not record: a list of files opened or changed, a diary of steps, anything the code or `git log` already says plainly, secrets or personal data.

Update an existing note instead of creating a parallel one. A note describes the current state; delete statements that became false. Add every new note to `docs/README.md`. Describe what is merged into `dev`, not work in progress.

- **No history in notes.** Describe how it works now. Do not compare with how it worked before or write which PR changed it. That belongs in `git log` and ADRs.
- **Values by name.** Name the constant or the report field that holds a value; repeat the value only when the behaviour depends on it.
- **Secrets.** Never write a token, a deploy hook URL or a key.

```md
<!-- Bad: history -->

The report is now fetched at build time; before it was fetched in the browser.

<!-- Good: current behaviour -->

`loadReport()` downloads the report once per `next build`.
```

## Architecture decision records (`docs/adr/`)

Write an ADR when a decision is not obvious from the code and a future reader could take it for a mistake: an unusual structure, a rejected "obvious" alternative, a pinned package version, a constraint imposed by a tool or a host. Number sequentially, never reuse a number.

- **Only decisions that were actually made.** How a part of the site behaves is a knowledge note, not an ADR.
- **The title states the decision, not a comparison.** "The report is read at build time", not "Build time vs runtime"; the rejected options go under Alternatives.

```md
# NNNN. <Decision in a short phrase>

Status: accepted | superseded by NNNN
Date: YYYY-MM-DD

## Context

What forced the decision. Constraints, facts, numbers.

## Decision

What we do.

## Alternatives

What else was considered and why it was rejected.

## Consequences

What becomes easier, harder, or must not be changed without revisiting this ADR.
```

Before changing code that an ADR covers, read the ADR. If the change contradicts it, write a new ADR that supersedes it (set the old one's status to `superseded by NNNN`); do not edit the decision of an accepted ADR.

## Page notes (after every turn)

`docs/` describes how each page and each data source works (`docs/<topic>.md`, listed in `docs/README.md`).

- After every turn that changes the repository (code, config, a commit), bring the notes of the pages and data it touched up to date before the turn ends. A page without a note gets one now.
- A note says what the page is for, which report fields it reads and how, its states (live data, sample fallback, missing cells), and the edge cases a change must respect.
- A change with no effect on any page or data (formatting, CI, agent rules) says so in the report instead.

## Questions to the user

1. **Write first, then ask.** Before asking the user anything, write it in the same turn as its own item in `docs/questions.md`: date, the question in one sentence, the options, what waits on it. The work it concerns gets its own item in `docs/plan.md`.
2. **Every unanswered question**, whatever its weight, stays there and is asked again in the next report until it is answered. Then remove it and write the answer where it belongs (a note, an ADR, the item it unblocks).

## The session files

`docs/now.md` (where the work stands, rewritten after every finished step), `docs/plan.md` (the work that is left), `docs/questions.md` (every question waiting for the user), `docs/missing.md` (what only an outside party can supply: a Vercel project, a token, an account). Each opens with a `**Checked:** YYYY-MM-DD` line, updated even when nothing is new. They are git-ignored and never committed (the repository is public); committed files do not link to them. Knowledge that must outlive them goes into a note or an ADR.

Write the item in the same turn you notice it, before you answer. Mentioning it in the reply is not a record. A mistake of your own (a missed finding, a wrong claim, a broken build you let through) is recorded the same way.

While working on a task you notice things that are not part of it: a bug, a wrong doc, a rule the code breaks, a missing file. They are out of scope, so you do not fix them now, and they are not ignored either.

- `docs/plan.md` sections: **Open** (to do) and **Accepted** (debt kept on purpose, with the reason and when to revisit).
- One item per finding: where (`file:line`), what is wrong and what it causes, the proposed fix if you have one, and what it waits for.
- Remove an item when it is done or becomes a GitHub issue or PR (link it). The session files are not a status log or a history: what was merged is in git.

## Before finishing a task

Check whether the task changed something a note, an ADR, `AGENTS.md`, `README.md` or a rule states. Update them in the same change, and add follow-ups to `docs/plan.md` instead of fixing unrelated things.
