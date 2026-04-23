---
name: SPARTA Energy
colors:
  # ── Light Mode ────────────────────────────────────────────────────────────────
  background: "#ffffff"
  foreground: "#0d1411"
  card: "#ffffff"
  card-foreground: "#0d1411"
  popover: "#ffffff"
  popover-foreground: "#0d1411"

  primary: "#2c7a57"
  primary-foreground: "#f5fdf8"
  primary-dim: "#246648"
  primary-subtle: "#2c7a5726"

  secondary: "#f4f4f5"
  secondary-foreground: "#18181b"

  muted: "#f4f4f5"
  muted-foreground: "#71717a"

  accent: "#2c7a57"
  accent-foreground: "#f5fdf8"

  destructive: "#dc2626"
  destructive-foreground: "#ffffff"
  destructive-surface: "#dc26261a"

  border: "#e4e4e7"
  input: "#e4e4e7"
  ring: "#a1a1aa"

  # ── Dark Mode ─────────────────────────────────────────────────────────────────
  dark-background: "#192018"
  dark-foreground: "#fafafa"
  dark-card: "#1e2a1f"
  dark-card-foreground: "#fafafa"
  dark-primary: "#4caf80"
  dark-primary-foreground: "#f5fdf8"
  dark-secondary: "#27372a"
  dark-secondary-foreground: "#fafafa"
  dark-muted: "#243026"
  dark-muted-foreground: "#c8d9cc"
  dark-border: "#3d5240"
  dark-input: "#3d5240"

  # ── Status Semantic ───────────────────────────────────────────────────────────
  status-hemat: "#2c7a57"
  status-hemat-foreground: "#f5fdf8"
  status-boros: "#d85a53"
  status-boros-foreground: "#ffffff"

  # ── Data Visualisation (Charts) ───────────────────────────────────────────────
  chart-1: "#6ecfb5"
  chart-2: "#4db8a0"
  chart-3: "#2e9b84"
  chart-4: "#1a7d6a"
  chart-5: "#0f6456"

typography:
  display:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: "900"
    lineHeight: 36px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: "800"
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 28px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
  title-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: "600"
    lineHeight: 14px
    letterSpacing: 0.06em
  micro:
    fontFamily: Geist
    fontSize: 8px
    fontWeight: "600"
    lineHeight: 12px
    letterSpacing: 0.14em
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px

rounded:
  sm: 0.525rem
  DEFAULT: 0.7rem
  md: 0.7rem
  lg: 0.875rem
  xl: 1.225rem
  2xl: 1.575rem
  3xl: 1.925rem
  4xl: 2.275rem
  full: 9999px

spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  page-gutter: 16px
  page-max-width: 384px
  bottom-nav-height: 68px

elevation:
  card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
  card-hover: "0 4px 12px rgba(0,0,0,0.08)"
  status-hemat: "0 4px 24px rgba(44,122,87,0.20)"
  status-boros: "0 4px 24px rgba(216,90,83,0.20)"
  bottom-nav: "0 -12px 32px rgba(26,28,25,0.06)"
  tooltip: "0 4px 16px rgba(0,0,0,0.20)"

motion:
  duration-fast: 150ms
  duration-default: 200ms
  duration-slow: 300ms
  easing-default: cubic-bezier(0.4, 0, 0.2, 1)
  easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
  active-press: scale(0.97) translateY(1px)
  nav-tap: scale(0.90)

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.4xl}"
    height: 36px
    paddingX: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-dim}"
  button-outline:
    backgroundColor: "{colors.input}/30"
    borderColor: "{colors.border}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.4xl}"
  button-destructive:
    backgroundColor: "{colors.destructive-surface}"
    textColor: "{colors.destructive}"
    rounded: "{rounded.4xl}"
  button-lg:
    height: 40px
    paddingX: 16px
  button-full-cta:
    height: 44px
    rounded: "{rounded.full}"
    typography: "{typography.title-sm}"

  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    height: 20px
    paddingX: 8px
    typography: "{typography.micro}"
  badge-hemat:
    backgroundColor: "{colors.status-hemat}"
    textColor: "{colors.status-hemat-foreground}"
    rounded: "{rounded.full}"
  badge-boros:
    backgroundColor: "{colors.destructive-surface}"
    textColor: "{colors.status-boros}"
    rounded: "{rounded.full}"

  card-default:
    backgroundColor: "{colors.card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    elevation: "{elevation.card}"
  card-status-hemat:
    backgroundColor: "linear-gradient(to bottom-right, {colors.primary}, {colors.primary}/80)"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    elevation: "{elevation.status-hemat}"
  card-status-boros:
    backgroundColor: "linear-gradient(to bottom-right, #d85a53, #c54b45)"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    elevation: "{elevation.status-boros}"
  card-hero:
    backgroundColor: "linear-gradient(to bottom-right, {colors.primary}/16, transparent)"
    rounded: "{rounded.xl}"
  card-data-chip:
    backgroundColor: "{colors.muted}/30"
    rounded: "{rounded.xl}"
    paddingX: 12px
    paddingY: 8px

  input-field:
    backgroundColor: "{colors.background}"
    borderColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: 36px
    paddingX: 12px
    typography: "{typography.body-md}"
  input-with-icon:
    paddingLeft: 36px
  input-with-action:
    paddingRight: 36px

  bottom-nav:
    backgroundColor: "{colors.background}/80"
    backdropBlur: 12px
    borderTopColor: "{colors.border}/70"
    rounded-top: "{rounded.3xl}"
    elevation: "{elevation.bottom-nav}"
  nav-item-active:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.primary}"
    iconStroke: "2.5"
  nav-item-inactive:
    textColor: "{colors.muted-foreground}"
    iconStroke: "1.7"

  stat-label:
    typography: "{typography.micro}"
    letterSpacing: 0.14em
    textTransform: uppercase
    textColor: "{colors.muted-foreground}"
  stat-value:
    typography: "{typography.title-sm}"
    fontWeight: "700"
    textColor: "{colors.foreground}"
  stat-value-primary:
    fontWeight: "900"
    textColor: "{colors.primary}"
    fontSize: 14px
---

## Brand & Visual Identity

SPARTA Energy is a **mobile-first internal audit tool** for the energy management division of a retail chain. The product targets field auditors who visit stores and must quickly log, calculate, and visualise electricity consumption data on their smartphones.

The visual identity projects **technical authority and quiet precision**. The palette is anchored in a rich emerald green — chosen to signal sustainability, health, and energy efficiency — contrasted against a near-black dark-mode canvas. There is no playfulness here; every token exists to serve data legibility and operational speed.

## Colors

The palette is bimodal: a **light mode** for outdoor use where ambient light washes out screens, and a deep **dark mode** with a forest-green-tinted background for low-light environments.

- **Primary (Emerald):** `#2c7a57` light / `#4caf80` dark — Used exclusively for interactive elements (primary buttons, active nav states, positive data callouts). Never used for decorative fills.
- **Status-Hemat (green):** Inherits primary. Applied to the full-bleed status card when a store passes the energy baseline. Accompanied by a `shadow-primary/20` glow to provide tactile depth.
- **Status-Boros (coral red):** `#d85a53` — Applied to the status card when a store exceeds its baseline. Chosen to be readable on both light and dark surfaces without being alarming, as the goal is diagnosis, not panic.
- **Background (dark):** `oklch(0.205 0.012 167.2)` — A very dark, slightly green-tinted surface. It is not pure black; the green chroma ties the dark surface visually to the primary brand hue.
- **Chart gradients:** A five-step teal-to-dark-green monochrome ramp is used for all data visualisation (bar charts, pie charts). The monochromatic approach keeps energy breakdowns immediately understandable without requiring a legend for individual colours.
- **Muted foreground:** Used for labels, secondary metadata, and inactive icons. In dark mode it resolves to a warm sage green-white rather than cold grey, preserving the green identity signature.

## Typography

**Geist** (sans-serif) and **Geist Mono** are the only typefaces used. Geist was chosen for its optical precision at small sizes — critical for the data-dense tables and 8–11px micro-labels that appear throughout the audit result screens.

### Scale
- **Display / Black (`font-black`, tracking `-0.03em`):** Used only for the headline status verdict ("TOKO BOROS", "TOKO HEMAT") on the result card. Maximum weight, maximum contrast.
- **Headline (`font-extrabold`/`font-bold`, tight tracking):** Section headings and primary numerical values (e.g., `1,240 kWh`).
- **Title (`font-semibold`):** Card titles, navigation labels, button text, form field labels.
- **Body / Label (`font-medium`, `font-normal`):** Descriptive text, metadata, secondary data rows.
- **Micro (`font-semibold`, `tracking-[0.14em]`, `uppercase`):** Used for unit markers ("KWH/M²"), column headers in data chips, and navigation tab labels. The wide tracking and caps treatment creates a structured "instrument panel" feel.

Do not use any font weight below `font-medium` for numerical data — legibility must be preserved at all `10px`–`11px` display sizes.

## Layout & Spacing

The application is single-column, **mobile-first at `max-w-sm` (384px)**. On wider screens the column remains centred and does not widen. This is a deliberate choice: the product is a field tool, not a desktop dashboard.

- **Page gutter:** `16px` horizontal padding on all screens.
- **8px base grid:** All spacing increments are multiples of 8px. `gap-2` (8px) is the default intra-component gap; `gap-4` (16px) separates related card sections; `space-y-4` (16px) is the default section separator.
- **Bottom navigation clearance:** All scrollable pages include `pb-32` (128px) padding at the bottom to keep the last card clear of the persistent bottom navigation bar.
- **Fixed bottom nav:** The navigation floats at `z-40` with a frosted glass backdrop (`bg-background/80`, `backdrop-blur-md`), anchored to the safe area bottom.

## Shape & Radius

The shape language uses **heavily rounded corners** throughout. The base `--radius` is `0.875rem` (14px), and the scale extends to `rounded-4xl` (`2.275rem ≈ 36px`) for buttons and badges.

- **Buttons & Badges:** `rounded-4xl` (≈36px) — pill-adjacent, friendly but not circular.
- **Large CTA buttons (full-width):** `rounded-full` — used for prominent single-action flows (e.g., "Mulai Audit Baru", "Simpan Area").
- **Cards:** `rounded-xl` (`1.225rem` ≈ 20px) — visually contained, soft, premium.
- **Data chips (inline metric tiles):** `rounded-xl` — consistent with card family.
- **Input fields:** `rounded-md` (`0.7rem` ≈ 11px) — smaller radius to ground form elements as "functional" vs the more expressive card/button shapes.
- **Tooltip overlays:** `rounded-xl` with a dark semi-transparent fill.

## Elevation & Depth

Depth is communicated through **tonal shifts and directional gradients**, not heavy drop shadows.

- **Cards at rest:** A single, barely-visible `box-shadow` (`0 1px 3px rgba(0,0,0,0.06)`). In dark mode, cards are visually distinguished from the background by their slightly lighter `oklch(0.24 0.014 167.4)` fill.
- **Status cards:** A coloured ambient glow (`shadow-primary/20` or `shadow-[#d85a53]/20`) gives the full-bleed hero card a sense of emitting its own light — reinforcing the "verdict" metaphor.
- **Bottom navigation:** An upward-facing shadow (`0 -12px 32px rgba(26,28,25,0.06)`) lifts the nav off the content beneath it without obscuring the scroll area.
- **Hero card gradient:** `bg-linear-to-br from-primary/16 via-background to-background` — a subtle tint that bleeds into the page background, suggesting the card floats just above the surface.

## Motion & Interaction

All transitions use `duration-150` (150ms) or `duration-200` (200ms) with `ease-in-out`. Animation is used sparingly and purposefully:

- **Buttons:** `active:translate-y-px` — a 1px downward press gives physical "click" feedback.
- **Navigation tabs:** `active:scale-90` — a quick scale-down on tap simulates a touch press on physical glass.
- **Input icons (show/hide password):** `transition-colors` on the toggle button icon, not the icon itself — avoids layout shifts.
- **Infinite scroll loader:** A single `animate-pulse` text indicator. No spinners, no skeleton loaders — the app is fast and the loading state should feel transient.
- **Hover states:** Only on non-mobile breakpoints. On touch devices, hover styles are suppressed to avoid stuck-hover states.

## Component Patterns

### Status Card (Result Screen)
The most visually prominent component in the app. A full-width card with a directional gradient fill (`from-primary to-primary/80` or `from-[#d85a53] to-[#c54b45]`), white foreground text, and a large decorative icon rendered at `size-36 opacity-15` as a background watermark. The two key metrics (Aktual vs Baseline) are displayed in a 2-column grid divided by a `border-white/20` separator.

### Data Chips
Small tiled containers (`rounded-xl bg-muted/30 px-3 py-2`) used to group related pairs of data within cards. The label is `8px uppercase tracked`, the value is `10px–11px semibold`. This pattern appears on audit history cards and within the result breakdown grid.

### Equipment Row
List item with a segmented layout: name and detail on the left (text stack), edit/chevron icon on the right. When selected/configured, the icon switches to a green-tinted edit icon (`bg-primary/5 text-primary`), providing visual confirmation that the item has been saved.

### Bottom Navigation
4-item fixed tab bar. Active item receives a `bg-primary/15` tinted pill background and a heavier icon stroke weight (`2.5` vs `1.7`). Label text is `8px uppercase tracking-wider font-semibold`. The entire nav has `rounded-t-3xl` on the top edge to integrate with the page shape language.

### Form Inputs with Icons
Inputs use relative positioning with an `absolute`-positioned icon at `left-3 top-1/2 -translate-y-1/2`. The input receives `pl-9` to prevent text overlap. For the password field, a secondary toggle button is added to the right with `right-3`, giving the input `px-9`. The icon inherits `text-muted-foreground`; the toggle transitions to `text-foreground` on hover.

### Charts
All charts use the `ChartContainer` wrapper from shadcn/ui. Bar charts render with `radius={[4, 4, 0, 0]}` (top-rounded bars). The baseline reference line is `stroke="var(--muted-foreground)"` with `strokeDasharray="4 3"`. Pie charts use the teal monochrome `chart-*` token ramp. Tooltips use the standard `ChartTooltipContent` component — no custom tooltip markup.

## Dark Mode

Dark mode is the primary visual experience for field use. The dark surface uses a green-tinted near-black (`oklch(0.205 0.012 167.2)`) rather than a neutral grey, ensuring the brand color remains subtly present even in the background. Cards are a single tonal step lighter (`oklch(0.24 0.014 167.4)`). The primary color brightens in dark mode (`oklch(0.62 0.12 166.9)`) to maintain adequate contrast against the dark surface without oversaturating.

All borders in dark mode are rendered at `28%` opacity (`oklch(0.58 0.01 167.6 / 28%)`) — visible enough to define structure, subtle enough not to create a cage-like "grid" feel. Chart colors do not change between modes; the teal gradient reads well on both light and dark surfaces.

## Iconography

Icons are sourced exclusively from **@tabler/icons-react**. All icons default to `size-4` (16px) inline, `size-5` (20px) in navigation, and `size-8`–`size-36` for decorative uses. The `stroke` width varies between `1.7` (inactive) and `2.5` (active/highlighted). Icons used in buttons carry the `data-icon="inline-start"` or `data-icon="inline-end"` attribute which auto-adjusts button padding via CSS attribute selectors.
