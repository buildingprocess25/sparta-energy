# Audit Step Skeleton and Result Loading

Date: 2026-04-29
Status: Approved for implementation

## Summary

Add a consistent, full-page skeleton experience for all audit step navigation (Step 1, Step 2, Step 2 Detail, Step 3) and ensure Step 3 submission navigates directly to the result page, where loading is shown on the result route. The goal is to remove the "idle" feeling between steps and prevent the Step 3 button from re-enabling before the result route loads.

## Goals

- Show a full-page skeleton immediately on any navigation between steps (next/back, enter/exit Step 2 Detail).
- Ensure Step 3 submission navigates directly to the result route and does not re-enable the CTA before the route transition.
- Keep behavior consistent in live and demo flows.
- Avoid large refactors; preserve the existing query-param step flow.

## Non-Goals

- Converting steps into separate routes (no route refactor).
- Redesigning audit step UI layouts.
- Changing validation rules for steps.

## Current State

- Step components call `router.push` directly. The UI can appear idle while data loads.
- Step 3 sets `isPending` to false before navigating, so the CTA re-enables briefly.
- Loading skeletons exist for some routes only via `loading.tsx`.

## Proposed Architecture

### 1) Centralized navigation skeleton in `AuditStartClient`

Introduce a `pendingStep` state in `AuditStartClient` that renders a full-page skeleton for the target step during navigation.

- `pendingStep` values: `"step-1" | "step-2" | "step-2-detail" | "step-3"`.
- Optional `pendingArea` for Step 2 Detail to render area-specific skeleton copy.
- A `navigate` function triggers:
  1. `setPendingStep(target)`
  2. `router.push(url)`

When `pendingStep` is set, `AuditStartClient` renders a skeleton component instead of step content. Once the URL changes (via `useSearchParams`), `pendingStep` is cleared.

### 2) Full-page skeleton component

Add a shared full-page skeleton component, for example:

- `components/audit/step-skeleton.tsx`

It will accept `variant` for Step 1, Step 2, Step 2 Detail, and Step 3. Each variant includes:

- Sticky header skeleton
- Main content skeleton blocks aligned to each step layout
- Bottom CTA skeleton

This component will reuse the existing `Skeleton` UI primitive.

### 3) Step components use `onNavigate`

Replace direct `router.push` calls in step components with `onNavigate` from `AuditStartClient`.

- Step 1: "Lanjut" uses `onNavigate("step-2")`
- Step 2:
  - Area card click uses `onNavigate("step-2-detail", { areaId })`
  - Next CTA uses `onNavigate("step-3")`
- Step 2 Detail:
  - Back uses `onNavigate("step-2")`
  - Save uses `onNavigate("step-2")`
- Step 3:
  - Back uses `onNavigate("step-2")`
  - Submit uses live/demo submit and then `router.push` to result

### 4) Header back interception

The current `Header` uses a `Link` for back navigation. For steps, we will add an optional `onBack` prop to `Header` and render a button instead of a `Link` when provided. This allows step pages to use the central `onNavigate` without adding a custom header.

### 5) Step 3 submit flow

For live mode:

- When submit starts, set a local pending state to disable the CTA.
- Await `submitAudit`.
- On success, do not reset pending before navigation.
- Immediately `router.push("/audit/[id]")`.
- Loading is displayed by `app/audit/[id]/loading.tsx`.

For demo mode:

- After AI recommendation and `demoAuditResult` is stored, navigate directly to `/demo/result`.
- If needed, the navigation skeleton covers the transition even if `/demo/result` renders quickly.

## Data Flow

- `AuditStartClient` exposes `onNavigate` to step components.
- `onNavigate` sets `pendingStep` and navigates.
- Step components do not decide navigation directly; they call `onNavigate`.
- When URL updates, `AuditStartClient` clears `pendingStep` to show actual step UI.

## Error Handling

- Step 3 submit errors preserve existing inline error messaging and re-enable the CTA.
- Navigation skeleton should not trigger if validation prevents navigation.

## Testing Plan

- Step 1 -> Step 2: immediate full-page skeleton, then Step 2 content.
- Step 2 -> Step 2 Detail (area): immediate skeleton, then detail content.
- Step 2 Detail -> Step 2: immediate skeleton, then list.
- Step 2 -> Step 3: immediate skeleton, then Step 3 content.
- Step 3 submit (live): CTA never re-enables before redirect; result loading skeleton displays.
- Step 3 submit (demo): transition shows skeleton briefly, result renders with stored state.
- Browser back/forward: no regression in navigation.

## Files to Change (Planned)

- `app/audit/start/start-client.tsx` (central navigation + skeleton state)
- `components/audit/step1.tsx` (use `onNavigate`)
- `components/audit/step2.tsx` (use `onNavigate`, area card click)
- `components/audit/step2-detail.tsx` (use `onNavigate` for back/save)
- `components/audit/step3.tsx` (submit flow and back)
- `components/header.tsx` (optional `onBack` support)
- `components/audit/step-skeleton.tsx` (new)

## Open Questions

- None.
