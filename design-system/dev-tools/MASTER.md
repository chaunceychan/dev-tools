# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** dev-tools
**Generated:** 2026-07-06 11:24:05
**Category:** Developer Tool / IDE

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#3B82F6` | `--color-primary` |
| Primary (dark) | `#60A5FA` | `--color-primary-dark` |
| Secondary | `#334155` | `--color-secondary` |
| Success/CTA | `#22C55E` | `--color-success` |
| Background (light) | `#F8FAFC` | `--color-background` |
| Background (dark) | `#0F172A` | `--color-background-dark` |
| Text (light) | `#0F172A` | `--color-text` |
| Text (dark) | `#F8FAFC` | `--color-text-dark` |

**Color Notes:** Blue primary action + green success, light/dark themes driven by CSS variables (see `frontend/src/styles/globals.css`).

### Typography

- **Heading Font:** System UI font stack
- **Body Font:** System UI font stack
- **Mono Font:** JetBrains Mono / Fira Code / Cascadia Code / Consolas (code output)
- **Mood:** friendly, modern, clean, approachable, professional
- **Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif`

**CSS Import:** none — uses the OS native UI font for a native desktop-app feel.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #3B82F6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: #2563EB;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0F172A;
  border: 1px solid #E2E8F0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #0F172A;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #3B82F6;
  outline: none;
  box-shadow: 0 0 0 3px #3B82F620;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Clean & Professional (developer utility)

**Keywords:** Minimal, functional, calm, dense, neutral surfaces, blue accent, light/dark/system

**Best For:** Developer desktop utilities, internal tools, technical productivity apps

**Key Effects:** Subtle elevation (shadow/border), 150-300ms color transitions on theme/hover, persistent sidebar navigation, monospace for code output, consistent SVG iconography

### Layout Pattern

**Pattern Name:** Sidebar + Content (App Shell)

- **Structure:** Collapsible left sidebar (tool list grouped by category) + scrollable content area + bottom status bar.
- **Navigation:** Persistent sidebar; current tool highlighted with the primary accent. Fully keyboard accessible (buttons, visible focus ring).
- **Theme:** Light / Dark / System via the theme toggle; respects `prefers-color-scheme` and `prefers-reduced-motion`.
- **Content width:** Centered `max-w-5xl` container for readability on wide screens.

---

## Anti-Patterns (Do NOT Use)

- ❌ Flat design without depth
- ❌ Text-heavy pages

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
