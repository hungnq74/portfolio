# Landing Page Timeline Guide

Replace the placeholders in `src/components/HorizontalTimeline.tsx` with facts you can verify. Keep each milestone short: one date or range, one headline, and one sentence of proof.

## What To Fill

For each timeline node, provide:

- `year`: The exact year or date range, for example `2021`, `2022-2023`, or `2024 ->`.
- `headline`: A short factual label, ideally 2-4 words.
- `description`: One sentence explaining what happened and why it matters.
- `proof`: Notes for yourself, such as a resume entry, offer letter, launch page, analytics screenshot, GitHub repo, press mention, or product link. This does not appear on the page.

## Current Slots

### 1. Origin Moment

- Date or range:
- School, role, project, or first serious builder moment:
- What changed:
- Proof:

Suggested page copy:

```ts
{
  year: "[YEAR]",
  headline: "[Origin Moment]",
  description: "[What changed for you here? Add the school, role, project, or first serious builder moment that belongs in this slot.]",
}
```

### 2. First Product Role

- Date or range:
- Company:
- Title:
- Scope or responsibility:
- Verified metric, if any:
- Proof:

Suggested page copy:

```ts
{
  year: "[YEAR]",
  headline: "[First Product Role]",
  description: "[Company, title, and scope. Include only metrics you can verify, such as users, revenue, launches, or team size.]",
}
```

### 3. Shipping Proof

- Date or range:
- Products, launches, or experiments:
- Count, only if verified:
- Outcome or lesson:
- Proof:

Suggested page copy:

```ts
{
  year: "[YEAR]",
  headline: "[Shipping Proof]",
  description: "[Summarize the products, experiments, or launches that prove momentum. Add the count only after you confirm it.]",
}
```

### 4. Current Chapter

- Date or range:
- Current company, product, or direction:
- Role:
- What is live now:
- Proof:

Suggested page copy:

```ts
{
  year: "[YEAR ->]",
  headline: "[Current Chapter]",
  description: "[Current company, product, or direction. Make it specific, factual, and current.]",
}
```

## Writing Rules

- Do not include ages unless the date of birth and event date are both intended to be public.
- Do not include company funding stage unless you can verify it publicly or from your own records.
- Use measured claims over broad claims. Prefer `launched 3 tools` to `built many products`.
- Keep metrics narrow and sourced. Prefer `reached 12K signups by March 2024` to `grew fast`.
- If a fact is uncertain, leave the placeholder in place until it is confirmed.
