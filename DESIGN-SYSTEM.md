# Selantar — Brand Design & Visual Directive

> Design system document inspired by Factory.ai dark mode aesthetic.
> All UI decisions for Selantar MUST reference this document.
> Stack: Next.js 16 + Tailwind CSS v4 + shadcn/ui (new-york) + Framer Motion 12

---

## 1. Design Philosophy

**"Dark authority, surgical precision."**

Selantar is an autonomous B2B dispute mediator — the UI must communicate:
- **Trust** — institutional-grade, serious, no playful elements
- **Clarity** — evidence and decisions presented without ambiguity
- **Precision** — every pixel is deliberate, zero decoration for decoration's sake
- **Intelligence** — the interface should feel like it's thinking, not decorating

**Core principles derived from Factory.ai:**
1. Near-black backgrounds with warm neutral undertones (NOT blue-cold dark)
2. Single accent color used sparingly as a signal, not decoration
3. Monospaced elements for data, technical, and code contexts
4. Extreme whitespace — let content breathe, sections are generous
5. Flat cards with subtle 1px borders — no heavy shadows, no gradients on containers
6. Section labels as small uppercase badges with accent dots
7. Typography does the heavy lifting — no icons as primary communication

---

## 2. Color Palette (Dark Mode Only)

Selantar ships dark-only. No light mode toggle.

### 2.1 Base Neutrals (Warm)

Factory uses warm stone-toned neutrals. We adopt the same warmth.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.08 0.005 50)` | Page background — near-black with warm brown undertone |
| `--foreground` | `oklch(0.88 0.005 80)` | Primary text — warm off-white, NOT pure white |
| `--card` | `oklch(0.11 0.005 50)` | Card/panel background — barely visible lift |
| `--card-foreground` | `oklch(0.88 0.005 80)` | Same as foreground |
| `--muted` | `oklch(0.16 0.006 50)` | Muted surfaces, input backgrounds |
| `--muted-foreground` | `oklch(0.55 0.008 60)` | Secondary text, descriptions, timestamps |
| `--border` | `oklch(1 0 0 / 7%)` | Default border — white at 7% opacity |
| `--input` | `oklch(1 0 0 / 8%)` | Input field borders |

**Factory reference values extracted from CSS:**
```
--color-base-100: #1f1d1c  (darkest surface)
--color-base-200: #2e2c2b  (card-level surface)
--color-base-300: #3d3a39  (elevated surface)
--color-base-400: #4d4947  (borders/dividers)
--neutral-1000:   #1f1d1c  (background)
--neutral-900:    #2e2c2b
--neutral-800:    #3d3a39
--neutral-700:    #4d4947
--neutral-600:    #5c5855
--neutral-500:    #8a8380  (muted text)
--neutral-400:    #a49d9a
--neutral-300:    #b8b3b0  (secondary text)
--neutral-200:    #ccc9c7  (primary text)
--neutral-100:    #d6d3d2  (headings)
```

### 2.2 Accent — Burnt Orange

Factory uses `--accent-100: #ef6f2e` (orange) as its ONLY color accent. Used for:
- Section label dots (small circle before "VISION", "PRODUCT", "NEWS")
- Active tab indicators
- Badge "NEW" labels
- Code syntax highlight keywords (`droid` keyword highlighted orange)
- Progress bar fill
- Interactive state indicators

Selantar accent adaptation — we shift slightly toward amber for legal authority:

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `oklch(0.72 0.17 55)` | Primary accent — burnt amber |
| `--accent-foreground` | `oklch(0.10 0.005 50)` | Text on accent background |
| `--accent-muted` | `oklch(0.72 0.17 55 / 15%)` | Accent at 15% for subtle backgrounds |
| `--accent-dot` | `oklch(0.72 0.17 55)` | Section label dots |

**Factory accent scale:**
```
--color-accent-100: #ef6f2e  (primary — dots, badges, active states)
--color-accent-200: #ee6018  (hover/pressed)
--color-accent-300: #d15010  (dark pressed)
```

### 2.3 Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--destructive` | `oklch(0.62 0.22 25)` | Errors, rejected settlements |
| `--emerald` | `oklch(0.72 0.17 162)` | Success, approved verdicts, escrow funded |
| `--emerald-foreground` | `oklch(0.10 0.005 50)` | Text on emerald |
| `--ring` | `var(--accent)` | Focus ring — accent color |
| `--primary` | `var(--accent)` | Primary buttons use accent |
| `--primary-foreground` | `oklch(0.10 0.005 50)` | Dark text on primary |
| `--secondary` | `oklch(0.16 0.006 50)` | Secondary buttons — muted surface |
| `--secondary-foreground` | `oklch(0.88 0.005 80)` | Light text on secondary |

### 2.4 Special Surfaces

| Token | Value | Usage |
|-------|-------|-------|
| `--glass` | `oklch(1 0 0 / 3%)` | Glassmorphism panels |
| `--glass-border` | `oklch(1 0 0 / 7%)` | Glass panel borders |
| `--glass-highlight` | `oklch(1 0 0 / 5%)` | Glass inner highlight |
| `--popover` | `oklch(0.12 0.005 50)` | Dropdowns, tooltips |
| `--popover-foreground` | `oklch(0.88 0.005 80)` | Popover text |

---

## 3. Typography

### 3.1 Font Stack

Factory uses **Geist Sans** (body) and **Geist Mono** (code/technical). We do the same:

```tsx
// app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// CSS variables
// --font-sans: "Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif
// --font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace
```

### 3.2 Type Scale

Derived from Factory screenshots:

| Element | Size | Weight | Tracking | Line Height | Example |
|---------|------|--------|----------|-------------|---------|
| **Hero H1** | `text-6xl` to `text-7xl` (60-72px) | `font-normal` (400) | `tracking-tight` (-0.025em) | `leading-none` (1.0) | "Agent-Native Software Development" |
| **Section H2** | `text-4xl` to `text-5xl` (36-48px) | `font-normal` (400) | `tracking-tight` | `leading-tight` (1.25) | "Droids meet you wherever you work." |
| **Card Title** | `text-xl` to `text-2xl` (20-24px) | `font-medium` (500) | `tracking-normal` | `leading-snug` (1.375) | "Droids in the browser" |
| **Body** | `text-base` (16px) | `font-normal` (400) | `tracking-normal` | `leading-relaxed` (1.625) | Paragraph descriptions |
| **Body Small** | `text-sm` (14px) | `font-normal` (400) | `tracking-normal` | `leading-relaxed` | Secondary descriptions |
| **Label/Badge** | `text-xs` (12px) | `font-medium` (500) | `tracking-wider` (0.05em) | `leading-none` | "VISION", "PRODUCT", "NEWS" |
| **Nav Links** | `text-sm` (14px) | `font-normal` (400) | `tracking-wider` | `leading-none` | "PRICING", "COMPANY" |
| **Code/Mono** | `text-sm` (14px) | `font-normal` (400) | `tracking-normal` | `leading-relaxed` | `curl -fsSL ...`, contract data |
| **Button** | `text-sm` (14px) | `font-medium` (500) | `tracking-normal` | `leading-none` | "LEARN MORE", "CONTACT SALES" |

### 3.3 Typography Rules

1. **Headings are ALWAYS `font-normal` (400 weight)** — Factory never bolds headings. The large size IS the emphasis.
2. **ALL-CAPS for labels and navigation** — `uppercase tracking-wider text-xs font-medium`
3. **Body text color is muted** — descriptions use `text-muted-foreground`, NOT full white
4. **Headings use near-white** — `text-foreground` (oklch 0.88)
5. **Monospace for technical data** — contract addresses, amounts, transaction hashes, code blocks
6. **No text shadows, no text gradients** — Factory is completely flat typography
7. **Periods in headings are optional but deliberate** — "Droids meet you wherever you work**.**"

---

## 4. Layout & Spacing

### 4.1 Page Structure (from Factory screenshots)

```
┌─────────────────────────────────────────────────┐
│ NAVBAR — sticky, border-bottom 1px, bg-blur     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ● SECTION LABEL (uppercase, accent dot)        │
│                                                 │
│  Giant Heading Here                             │
│  That Spans Multiple Lines                      │
│                                                 │
│  Body text in muted color, max-w-lg,            │
│  never spanning the full width.                 │
│                                                 │
│                  [Illustration/Visual]           │
│                                                 │
│  ─────────── section divider ───────────        │
│                                                 │
│  ● NEXT SECTION                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.2 Spacing Tokens

| Usage | Value | Tailwind |
|-------|-------|----------|
| Section vertical padding | 96-128px | `py-24` to `py-32` |
| Between heading and body | 24px | `mt-6` |
| Between body and CTA | 32px | `mt-8` |
| Card internal padding | 24-32px | `p-6` to `p-8` |
| Card gap in grid | 16-24px | `gap-4` to `gap-6` |
| Navbar height | ~72px | `py-5 px-4 lg:px-9` |
| Max content width | 1440px | `max-w-7xl mx-auto` |
| Text max width | ~640px | `max-w-2xl` |

### 4.3 Container Rules

1. **Max page width: 1920px** — `max-w-[1920px] mx-auto`
2. **Content area: 1440px** — `max-w-7xl mx-auto px-4 lg:px-9`
3. **Text never full-width** — body text capped at `max-w-2xl`
4. **Two-column layouts** — text left (~40%), visual right (~60%), on `lg:` breakpoint
5. **Mobile stacks vertically** — no horizontal scroll, ever

---

## 5. Component Patterns

### 5.1 Section Label (Badge with Dot)

The most distinctive Factory pattern — every section starts with:

```tsx
<div className="flex items-center gap-2">
  <span className="size-2 rounded-full bg-accent" />
  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {label}
  </span>
</div>
```

Usage in Selantar:
- `● MEDIATION` — mediation chat page
- `● FORGE` — contract analysis page
- `● EVIDENCE` — evidence analysis panel
- `● SETTLEMENT` — settlement proposal section
- `● ON-CHAIN` — ERC-8004 status panel

### 5.2 Cards

Factory cards are FLAT — no shadow, 1px border, very subtle background lift:

```tsx
<div className="rounded-xl border border-border bg-card p-6">
  {/* content */}
</div>
```

**Hover state (optional):**
```tsx
<div className="rounded-xl border border-border bg-card p-6
  transition-colors hover:border-accent/20 hover:bg-muted/50">
```

**NO box-shadows on cards.** NO gradient backgrounds. NO rounded-3xl.

### 5.3 Buttons

Factory buttons are minimal, bordered:

**Primary (CTA):**
```tsx
<Button className="rounded-md border border-foreground bg-foreground
  text-background text-sm font-medium uppercase tracking-wider px-5 py-2.5
  hover:bg-foreground/90">
  Contact Sales
</Button>
```

**Secondary (Outline):**
```tsx
<Button variant="outline" className="rounded-md border border-border
  bg-transparent text-sm font-medium uppercase tracking-wider px-5 py-2.5
  hover:bg-muted">
  Log In
</Button>
```

**Link-style (with arrow):**
```tsx
<a className="group inline-flex items-center gap-1.5 text-sm font-medium
  uppercase tracking-wider text-foreground hover:text-accent transition-colors">
  Learn More
  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
</a>
```

### 5.4 Navbar

Factory navbar is sticky, has a blur backdrop, 1px bottom border:

```tsx
<header className="sticky inset-x-0 top-0 z-50 border-b border-border
  bg-background/80 backdrop-blur-lg px-4 lg:px-9">
  <div className="mx-auto flex max-w-7xl items-center justify-between py-5">
    {/* Logo left, nav center, CTAs right */}
  </div>
</header>
```

Nav links are **uppercase, tracking-wider, text-sm, font-normal**.

### 5.5 Code Blocks

Factory terminal-style code blocks:

```tsx
<div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm">
  <div className="flex items-center gap-2">
    <span className="text-muted-foreground">{">"}</span>
    <code className="text-foreground">{command}</code>
  </div>
</div>
```

Code syntax uses accent color for keywords:
```tsx
<span className="text-accent">droid</span>
```

### 5.6 Tab Navigation

Factory tabs use a horizontal list with small accent dot for active state:

```tsx
<div className="flex items-center gap-6">
  {tabs.map((tab, i) => (
    <button
      key={tab.id}
      className={cn(
        "text-xs font-medium uppercase tracking-wider transition-colors",
        active === i
          ? "text-accent"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {`${String(i + 1).padStart(2, "0")} ${tab.label}`}
    </button>
  ))}
</div>
```

### 5.7 Badge

Badges from Factory news section:

```tsx
// Standard badge
<span className="rounded-md border border-border px-2.5 py-1
  text-xs font-medium uppercase tracking-wider text-muted-foreground">
  Product
</span>

// Accent badge (NEW)
<span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1
  text-xs font-medium uppercase tracking-wider text-accent">
  New
</span>
```

---

## 6. Animation & Motion

### 6.1 Principles

Factory animations are **subtle and functional** — no bouncing, no playful spring physics:

1. **Scroll-triggered reveals** — sections fade in as they enter viewport
2. **Smooth scrolling** — `scroll-smooth` on html
3. **Hover transitions** — 150ms ease-out for color/border changes
4. **Tab content transitions** — cross-fade between tab panels
5. **Logo carousel** — infinite horizontal scroll (CSS only)
6. **NO particle effects, NO parallax, NO 3D transforms**

### 6.2 Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Color transitions | 150ms | `ease-out` — `cubic-bezier(0, 0, 0.2, 1)` |
| Layout transitions | 200ms | `ease-in-out` — `cubic-bezier(0.4, 0, 0.2, 1)` |
| Scroll reveals | 500ms | `ease-out` |
| Tab content switch | 300ms | `ease-in-out` |
| Hover transforms | 200ms | `ease-out` |

### 6.3 Framer Motion Defaults

```tsx
// Default transition for Selantar
const defaultTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

// Scroll reveal
const scrollReveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
};
```

---

## 7. Iconography

- **Library:** `lucide-react` (same as shadcn default)
- **Sizing:** NEVER on the icon component itself — use wrapper: `<span className="size-4"><ArrowRight /></span>`
- **Stroke:** Default (2px) — do not customize stroke-width
- **Color:** Inherit from parent text color
- **Usage:** Minimal — icons support text, never replace it
- **Arrow pattern:** `ArrowRight` (size-3.5) after CTA text with hover translate-x

---

## 8. Illustration Style

Factory uses **wireframe-style technical illustrations** — thin white/gray lines on dark background depicting abstract interfaces (browser windows, terminal frames, code editors).

Selantar equivalent:
- Thin-line SVG illustrations of: contract documents, scales of justice (abstract), flow diagrams, blockchain nodes
- Colors: `text-muted-foreground` for lines (oklch 0.55), `text-accent` for highlighted elements
- Style: Technical blueprint / architectural diagram feel
- **NO 3D renders, NO gradients in illustrations, NO photos**

---

## 9. Specific Selantar Adaptations

### 9.1 Mediation Chat

The chat interface should feel like a professional arbitration transcript:

```
┌─────────────────────────────────────┐
│ ● MEDIATION                         │
│                                     │
│ ┌─ Mediator Agent ────────────────┐ │
│ │ Analysis of clause 4.2...       │ │
│ │ [Evidence Card] [Risk Badge]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│        ┌─ Analyst Agent ─────────┐  │
│        │ Cross-reference with... │  │
│        └─────────────────────────┘  │
│                                     │
│ ┌─ Settlement Proposal ──────────┐  │
│ │ ● PROPOSED — 60/40 split       │  │
│ │ Client: 0.6 ETH  Dev: 0.4 ETH │  │
│ │ [Accept] [Counter] [Reject]    │  │
│ └─────────────────────────────────┘  │
│                                     │
│ ╔══════════════════════════════════╗ │
│ ║ Message input (monospace)       ║ │
│ ╚══════════════════════════════════╝ │
└─────────────────────────────────────┘
```

- Agent messages: `bg-card` with accent-colored agent name
- User messages: `bg-muted` aligned right
- Tool invocations: Bordered cards with state indicators (spinner -> check)
- Settlement proposals: Highlighted card with `border-accent/30`

### 9.2 Forge (Contract Analysis)

- Upload zone: Dashed border, `border-border`, icon + text centered
- Risk analysis results: Cards with severity badges (`bg-destructive/10 text-destructive` for high, `bg-accent/10 text-accent` for medium, `bg-emerald/10 text-emerald` for low)
- Streaming text: Monospace, character-by-character reveal
- Escrow setup: Form with clear labels, amounts in monospace `font-mono`

### 9.3 ERC-8004 Status Panel

- Transaction hashes: `font-mono text-xs text-muted-foreground` truncated with copy button
- Status steps: Vertical timeline with accent dots for completed, muted for pending
- On-chain confirmations: Subtle pulse animation on pending items

---

## 10. What NOT To Do

| Prohibited | Why | Do Instead |
|------------|-----|------------|
| Gradient backgrounds on cards | Factory is flat | Solid `bg-card` with 1px border |
| `rounded-full` on containers | Factory uses subtle radius | `rounded-xl` max |
| Bold headings (700+) | Factory headings are weight 400 | Large size IS the emphasis |
| Blue/purple accent colors | Legal tech = warm authority | Burnt amber/orange accent |
| Icon-heavy UI | Factory is text-first | Typography + spacing |
| Animated backgrounds | Factory is static backgrounds | Subtle scroll reveals only |
| Pure white text (#fff) | Harsh on dark bg | Warm off-white `oklch(0.88)` |
| Pure black background (#000) | Too cold | Warm dark `oklch(0.08 0.005 50)` |
| Multiple accent colors | Factory uses ONE accent | Single burnt amber throughout |
| Decorative dividers/ornaments | Factory uses whitespace | Large `py-24` section gaps |
| Drop shadows on cards | Factory cards are borderline invisible | 1px `border-border` only |
| Comic Sans, rounded, playful fonts | B2B legal mediator | Geist Sans/Mono only |

---

## 11. CSS Variables — Complete Token Map

Copy these into `globals.css` `:root`:

```css
:root {
  /* Base */
  --background: oklch(0.08 0.005 50);
  --foreground: oklch(0.88 0.005 80);

  /* Cards */
  --card: oklch(0.11 0.005 50);
  --card-foreground: oklch(0.88 0.005 80);

  /* Popover */
  --popover: oklch(0.12 0.005 50);
  --popover-foreground: oklch(0.88 0.005 80);

  /* Primary = Accent */
  --primary: oklch(0.72 0.17 55);
  --primary-foreground: oklch(0.08 0.005 50);

  /* Secondary */
  --secondary: oklch(0.16 0.006 50);
  --secondary-foreground: oklch(0.88 0.005 80);

  /* Muted */
  --muted: oklch(0.16 0.006 50);
  --muted-foreground: oklch(0.55 0.008 60);

  /* Accent */
  --accent: oklch(0.72 0.17 55);
  --accent-foreground: oklch(0.08 0.005 50);

  /* Destructive */
  --destructive: oklch(0.62 0.22 25);

  /* Borders */
  --border: oklch(1 0 0 / 7%);
  --input: oklch(1 0 0 / 8%);
  --ring: oklch(0.72 0.17 55);

  /* Radius */
  --radius: 0.625rem;

  /* Glass */
  --glass: oklch(1 0 0 / 3%);
  --glass-border: oklch(1 0 0 / 7%);
  --glass-highlight: oklch(1 0 0 / 5%);

  /* Semantic */
  --emerald: oklch(0.72 0.17 162);
  --emerald-foreground: oklch(0.08 0.005 50);

  /* Charts */
  --chart-1: oklch(0.72 0.17 55);
  --chart-2: oklch(0.65 0.14 70);
  --chart-3: oklch(0.55 0.10 90);
  --chart-4: oklch(0.48 0.08 110);
  --chart-5: oklch(0.42 0.06 130);

  /* Sidebar */
  --sidebar: oklch(0.09 0.005 50);
  --sidebar-foreground: oklch(0.88 0.005 80);
  --sidebar-primary: oklch(0.72 0.17 55);
  --sidebar-primary-foreground: oklch(0.08 0.005 50);
  --sidebar-accent: oklch(0.16 0.006 50);
  --sidebar-accent-foreground: oklch(0.88 0.005 80);
  --sidebar-border: oklch(1 0 0 / 7%);
  --sidebar-ring: oklch(0.72 0.17 55);
}
```

---

## 12. Quick Reference: Tailwind Class Combos

```tsx
// Section wrapper
"py-24 lg:py-32"

// Section label with dot
"flex items-center gap-2"
"size-2 rounded-full bg-accent"                            // dot
"text-xs font-medium uppercase tracking-wider text-muted-foreground"  // label

// Hero heading
"text-5xl lg:text-7xl font-normal tracking-tight leading-none text-foreground"

// Section heading
"text-3xl lg:text-5xl font-normal tracking-tight leading-tight text-foreground"

// Body text
"text-base leading-relaxed text-muted-foreground max-w-2xl"

// Card
"rounded-xl border border-border bg-card p-6"

// Code block
"rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm"

// Button primary
"rounded-md border border-foreground bg-foreground text-background text-sm font-medium uppercase tracking-wider px-5 py-2.5"

// Button outline
"rounded-md border border-border bg-transparent text-sm font-medium uppercase tracking-wider px-5 py-2.5"

// Navbar
"sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"

// Badge standard
"rounded-md border border-border px-2.5 py-1 text-xs font-medium uppercase tracking-wider"

// Badge accent
"rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-accent"

// Monospace data
"font-mono text-sm text-muted-foreground"

// Link with arrow
"group inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider hover:text-accent transition-colors"
```

---

## 13. Reference Screenshots

All screenshots in `.firecrawl/factory-screenshots/dark-*.png`:

| File | Section Captured |
|------|-----------------|
| `dark-01-hero-top.png` | Hero heading + navbar + illustration |
| `dark-02-trusted-by-logos.png` | Logo carousel + section transition |
| `dark-03-droids-workflow-tabs.png` | Tab navigation + content cards |
| `dark-04-droids-where-you-code.png` | IDE mockup + web browser panel |
| `dark-05-ai-work-with-you.png` | CLI code block + command line tab |
| `dark-06-security-enterprise.png` | Two-column info cards + illustration |
| `dark-07-news-updates.png` | Project manager tab + backlog view |
| `dark-08-cta-ready-to-build.png` | Enterprise section + security cards |
| `dark-09-footer.png` | News grid with badges + CTA section |
| `dark-10-extra-mid-1.png` | Web browser tab detail |
| `dark-11-extra-mid-2.png` | Command line tab detail |
| `dark-12-extra-mid-3.png` | Project manager tab detail |
