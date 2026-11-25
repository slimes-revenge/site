# KISS, DRY, YAGNI

Applies to every file in the repository. Apply it while writing, then run it as a separate pass over the full diff before a task is finished and again before any commit. Do not finish or commit a change that fails the pass.

## KISS

Ship the smallest change that fixes the current case. Do not add a hook, context, store, service, wrapper component or abstraction for a single call site.

```tsx
// Bad — a component whose only job is to forward props
function WinRate({ value }: { value: number }) {
  return <Percent value={value} />;
}

// Good — use the component directly
<Percent value={cell.winRate} />;
```

- Prefer direct readable code over many small functions. A helper needs a domain meaning, not just to hide two lines.
- Server components by default; `"use client"` only for a component that needs state, effects or event handlers, and as low in the tree as possible.
- Data the page needs is read at build time and passed down as props. No client-side fetching, global store or data library for data the build already has.
- MUI components and `sx` before custom CSS; no second styling system.
- Do not introduce broad generic types when one concrete type is enough. Types of report data come from the zod schema (`z.infer`), not from a parallel hand-written copy.

## DRY

Extract shared logic only when the same behavior already exists in two production places. Do not extract for a hypothetical second page.

An abstraction (helper, shared component, hook, utility module) is allowed only when at least one is true:

- The same logic is used in 2+ production places.
- The logic is complex enough that naming it materially improves readability.
- It protects a boundary: the report contract with the simulator (`src/data/schema.ts`), a library contract (Next.js, MUI).
- It is required to test a non-trivial branch.

## YAGNI

Do not add placeholders, unused props, empty pages for planned features, feature flags nobody reads, environment variables nothing sets, or dependencies nothing imports. Planned pages are listed in `README.md`, not stubbed in code. An unsupported case fails explicitly (a thrown error or a visible message with the reason), not silently.

## The simplification pass

During a task the change usually touches only the code it needs. The pass looks wider:

1. Read the full diff against `dev` (`git diff dev...` plus uncommitted changes) plus the components and modules the diff touches.
2. Look for: new code that duplicates something that already exists; helpers with one caller; props, state, branches, types or dependencies nothing reads; code made obsolete by the change; neighbouring code in the touched flow that can now be simpler.
3. Make the reductions that stay inside the task's flow. Record larger cleanups outside the flow in `docs/plan.md` instead of doing them.
4. Re-run the checks the reductions affect. A simplification that was not re-verified is not done.

Expect the pass to remove 5–10% of new code. If it removes nothing, say what you checked.
