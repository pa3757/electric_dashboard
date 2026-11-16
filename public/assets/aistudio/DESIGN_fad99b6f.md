---
name: GridPulse
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#584237'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#a73a00'
  on-secondary: '#ffffff'
  secondary-container: '#fd651e'
  on-secondary-container: '#571a00'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#d78900'
  on-tertiary-container: '#492c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-large:
    fontFamily: JetBrains Mono
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  metric-large-mobile:
    fontFamily: JetBrains Mono
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  metric-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

### Target Audience & Personality
The design system targets novice energy traders, renewable energy operators, commercial facility managers, and everyday consumers seeking transparency into real-time electricity wholesale and spot markets (SMP, REC). 

The emotional tone balances institutional financial clarity with dynamic, approachable vitality:
- **Clarity over Complexity:** Translates dense volumetric and tariff metrics into immediately digestible visual signals.
- **Electric & Proactive:** Conveys the real-time, kinetic pulse of power generation and dynamic pricing without inducing market anxiety.
- **Trustworthy & Modern:** Emulates top-tier modern fintech standards—lucid surfaces, crisp numeric tabular alignments, and disciplined information hierarchy.

### Design Aesthetic
The system adopts a **Refined Modern Fintech & Clean SaaS** aesthetic:
- Luminous white canvas layered over subtle slate-gray foundation planes.
- Tactile, floating card containers with diffuse ambient shadowing rather than hard delineation borders.
- Highly deliberate energetic accents (vibrant electric orange and warning amber) reserved strictly for critical price swings, peak load status, and actionable controls.
- Generous internal padding and strict tabular typography for immediate data absorption.

## Colors

### Palette Strategy
The color architecture establishes an airy, high-contrast working environment optimized for day-long analytical scanning.

- **Primary (`#F97316` / Energy Orange):** Symbolizes dynamic current, current-hour pricing, and key interactive focal points.
- **Secondary (`#EA580C` / Deep Kinetic Ember):** Used for pressed/active interaction states, peak-hour alert highlights, and high-intensity threshold lines in data charts.
- **Tertiary (`#F59E0B` / Amber Surge):** Serves transitional and alert states—shoulder hours, moderate market volatility, and forecast variance bands.
- **Neutral Core (`#0F172A` / Midnight Slate):** Anchor for high-hierarchy values, primary headlines, and dominant price points.

### Background & Surface Hierarchy
- **Canvas Base:** `#F8FAFC` (Slate 50) provides soft contrast against pure white cards, reducing eye strain.
- **Surface Elevation 0 (Card/Module):** `#FFFFFF` (Pure White).
- **Surface Elevation 1 (Nested Row / Inset Metric):** `#F1F5F9` (Slate 100).
- **Subtle Dividers:** `#E2E8F0` (Slate 200) applied at 1px thickness when boundary separation is functionally required.

### Functional Typography Roles
- **Headings & Primary Metrics:** `#0F172A` (Slate 900)
- **Body & Secondary Values:** `#334155` (Slate 700)
- **Labels, Captions & Timestamps:** `#64748B` (Slate 500)
- **Disabled / Neutral State:** `#94A3B8` (Slate 400)

## Typography

### Structural Pairings
- **Display & Interface Body (Plus Jakarta Sans):** Selected for its geometric structure, gentle curves, and exceptional readability at smaller weights. It softens data density, making dynamic market trends accessible rather than overwhelming.
- **Telemetry & Financial Data (JetBrains Mono):** Applied deliberately to numerical readouts (SMP/kWh, REC prices, generation percentages, timestamps). The monospace alignment eliminates jitter during live market ticker updates and ensures visual parity across multi-row data tables.

### Rules of Application
- Numerical figures must always utilize tabular figures (`font-variant-numeric: tabular-nums`).
- Currency denominations (e.g., `원/kWh`) should be set in `label-mono` or `body-sm` at Slate 500 (`#64748B`), anchored to the baseline of the main metric.
- Upward and downward price shift percentages must pair their signed icons directly with `label-mono` weight 600.

## Layout & Spacing

### Layout Architecture
- **Desktop Grid:** 12-column fluid grid system bounded by a maximum container width of `1440px`. Gutters scale at `1.5rem` (24px) with edge margins set to `2rem` (32px).
- **Tablet Grid (768px – 1024px):** 8-column layout with `1rem` (16px) gutters and `1.5rem` (24px) margins. Market cards reorder from horizontal spreads into paired vertical clusters.
- **Mobile Grid (< 768px):** 4-column single-stream scroll stack. Gutter drops to `0.75rem` (12px), canvas margin drops to `1rem` (16px). Key overview metrics (Real-time SMP, Today's Peak, Settlement Average) collapse into a horizontal touch-swipe ribbon.

### Spacing Cadence
- Spacing follows a strict 4px/8px incremental base.
- Data cards feature internal padding governed by `space-lg` (24px) on desktop and `space-md` (16px) on mobile viewports.
- Related data clusters within modules (such as peak time and price differential badges) maintain a tight `space-xs` (4px) or `space-sm` (8px) gap.

## Elevation & Depth

### Ambient Depth Philosophy
Visual hierarchy is defined by soft, multi-layered ambient drop shadows that emulate daylight falling on elevated surfaces, avoiding stark borders or heavy drop shadows.

- **Level 0 (Base Canvas):** Flat `#F8FAFC`, non-elevated.
- **Level 1 (Core Dashboard Cards):**
  - Background: `#FFFFFF`
  - Border: 1px solid `rgba(226, 232, 240, 0.8)` (`Slate 200` at 80% opacity)
  - Shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 16px -2px rgba(15, 23, 42, 0.03)`
- **Level 2 (Hovered Cards & Interactive Controls):**
  - Background: `#FFFFFF`
  - Border: 1px solid `rgba(249, 115, 22, 0.3)`
  - Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 12px 24px -4px rgba(249, 115, 22, 0.08)`
- **Level 3 (Modals, Overlays, Floating Live Bar):**
  - Background: `rgba(255, 255, 255, 0.94)` with `backdrop-filter: blur(12px)`
  - Border: 1px solid `rgba(255, 255, 255, 0.6)`
  - Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`

### Energy Aura (Accent Elevation)
When indicating live energy alerts or real-time trading spikes, use a soft colored glow:
- `box-shadow: 0 0 20px -3px rgba(249, 115, 22, 0.25)`

## Shapes

### Shape Language
The design system adopts **Level 2 (Rounded)** curvature to express modern, friendly fintech precision without feeling overly playful or toy-like.

- **Base Elements (`0.5rem` / 8px):** Input fields, inline buttons, dropdown triggers, and data table cell highlights.
- **Card Containers (`rounded-lg` / `1rem` / 16px):** Primary metric tiles, chart containers, market breakdown modules.
- **Hero Highlights & Modals (`rounded-xl` / `1.5rem` / 24px):** Top-level hero summary banner and market advisory overlays.
- **Full Pill (`rounded-full` / 9999px):** Status chips, live energy transmission indicators, filter pills, and toggle switches.

## Components

### 1. Buttons
- **Primary:** Solid background `#F97316`, label `#FFFFFF` in `label-ui`. Border-radius `0.5rem`. Smooth transition on hover to `#EA580C`. Focused state adds `0 0 0 3px rgba(249, 115, 22, 0.25)`.
- **Secondary:** Surface `#FFFFFF` with 1px border `rgba(226, 232, 240, 1)`, text `#334155`. Hover shifts background to `#F8FAFC` and border to `#CBD5E1`.
- **Ghost / Tertiary:** Transparent background, text `#64748B`, hover text `#0F172A`, hover background `#F1F5F9`.

### 2. Price & Metric Cards
- White `#FFFFFF` surface, `1rem` border radius, subtle Level 1 ambient shadow.
- Header contains category title (`label-ui` in `#64748B`) paired with a live status dot or contextual icon.
- Central value rendered in `metric-large` (`JetBrains Mono`, `#0F172A`), suffixed by a muted unit label (`#64748B`).
- Footer displays day-over-day delta pill: a dynamic container with green/red or orange accent indicating % change.

### 3. Chips & Market Status Indicators
- **Real-Time Active Pill:** `rounded-full` with background `rgba(249, 115, 22, 0.1)`, text `#EA580C`, with a pulsating 6px dot `#F97316`.
- **Off-Peak / Normal Status:** Background `rgba(100, 116, 139, 0.1)`, text `#334155`.
- **Peak Alert / Critical Load:** Background `rgba(239, 68, 68, 0.1)`, text `#DC2626`.

### 4. Form Inputs & Date/Time Selectors
- Background `#FFFFFF`, height `42px`, padding `0 14px`, border-radius `0.5rem`, border `1px solid #E2E8F0`.
- Text in `body-md` (`#0F172A`), placeholder `#94A3B8`.
- Focus state: border-color `#F97316`, shadow ring `0 0 0 3px rgba(249, 115, 22, 0.15)`.

### 5. Checkboxes & Radio Controls
- Checkbox: `18px x 18px`, `4px` border radius. Inactive: border `1.5px solid #CBD5E1`. Active: solid `#F97316` fill with sharp white check vector.
- Radio: `18px x 18px`, fully circular. Active state shows an outer ring of `#F97316` and an inner circle dot of `#F97316` offset by 2px white space.

### 6. Data Tables (Hourly SMP / REC Settlement)
- Clean, borderless rows separated by `1px solid #F1F5F9`.
- Header row set in `label-mono`, uppercase, text `#64748B`, background `#F8FAFC`, with bottom border `1px solid #E2E8F0`.
- Row height: 48px with alternating subtle hover highlights (`#F8FAFC`). Numeric values strictly right-aligned using `JetBrains Mono`.

### 7. Domain-Specific: Real-Time Grid Sparkline & Trend Gauge
- Smooth spline curves with `#F97316` stroke (2px) and an anchor gradient fill transitioning from `rgba(249, 115, 22, 0.2)` to `rgba(249, 115, 22, 0.0)`.
- Interactive crosshairs display a floating tooltip chip with monospace current timestamp and exact pricing down to 2 decimal places.