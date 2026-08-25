# Phase 4.9 Fix 2 — Print / Save Combined PDF (Exact)

Adds a second combined-document output path that reuses the same HTML/CSS pagination model as the working Live Preview / Exact Print flow.

## Modes
- Generate Combined Engine PDF — direct scalable PDF bytes.
- Print / Save Combined PDF (Exact) — browser Print/Save PDF using preplanned physical pages.

## Exact Combined architecture
Selected DocumentGroups are resolved independently through TemplateEngine. Each RenderModel is rendered into an offscreen, unscaled measurement host. `buildPaginatedPreviewPlan()` creates the physical pages using the same planner used by Live Preview. Those planned pages are then printed directly; the browser is not given one continuous invoice body to repaginate.

Each invoice's final planned page is forced to `break-after: page` unless it is the final selected invoice. Therefore an invoice can never begin in leftover space from the preceding invoice.

## Page-size guard
Browser `@page` is global for this Exact mode. Selected invoices must therefore share the same physical page dimensions. Mixed page-size selections are rejected with a controlled message and should use Combined Engine PDF, which supports mixed page sizes.

## Non-regression
Single Live Preview, single Exact Print, and Combined Engine PDF remain separate and unchanged.
