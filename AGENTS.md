# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

This is a **static marketing landing page** for **EH CONNECT**, a fiber internet service provider (ISP) serving Liloan and Consolacion, Cebu, Philippines. It is a plain HTML/CSS/JS site with **no build system, no package manager, no framework, and no backend** — the files are served as-is.

- Domain referenced throughout: `https://ehconnection.com`
- External portal link (every portal CTA points here): `https://billing.ehconnection.com/portal/login`
- Facebook: `https://facebook.com/e.hinternetconnection` · Messenger: `https://m.me/e.hinternetconnection`
- Contact: `0933 195 3428` · `support@ehconnection.com` · Purok Sunflower, Poblacion, Liloan
- Language of code, comments, and content: **English**

## Design direction

The site was redesigned (Sept 2026) from a dark neon-glassmorphism theme to a **light professional theme** with dark accent sections. Do not reintroduce neon glows, glassmorphism, particle canvases, or 3D card tilt — all of it was deliberately removed.

### Color palette (CSS custom properties in `:root`)

| Variable | Value | Usage |
|---|---|---|
| `--color-primary` | `#1668E3` | CTA buttons, accents, section eyebrows (5.1:1 both directions) |
| `--color-primary-hover` | `#1155C4` | Hover state; also used where text sits on `--color-primary-soft` |
| `--color-primary-deep` | `#0D47AB` | Gradient ends, `.brand-mark` |
| `--color-primary-soft` | `#E8F1FE` | Tinted icon tiles, speed pills |
| `--color-navy` | `#0A1A33` | Headings, dark section backgrounds, footer |
| `--color-body` | `#55637A` | Body copy (6.1:1 on white) |
| `--color-border` | `#E2E8F2` | Card and input borders |
| `--color-accent-cyan` | `#7FD4FF` | Accent on dark sections only (10.6:1 on navy) |

**Contrast rule:** every text pair must clear 4.5:1 (3:1 for ≥24px or ≥18.66px bold). `--color-body-light` (`#7A8699`) only clears 3.7:1 — do not use it for body text. Prefer `--color-body`.

### Typography

- **Poppins** 600/700/800 — headings, prices, step numbers (display)
- **Inter** 400/500/600 — body copy
- **Caveat** 500/600 — the handwritten script label over the hero photo only

### Layout

- Light base (`#FFFFFF`), with three dark sections: `#coverage`, `#support`, `.footer`
- Hero photo **bleeds off the right viewport edge** on screens ≥1025px (via negative `margin-right`); re-add those rules if you change the hero grid
- Section padding: `6rem` desktop → `4.5rem` ≤1024px → `3.5rem` ≤768px
- Cards: white, 1px `--color-border`, `--radius-lg` (18px), soft two-layer shadow

## Project structure

```
index.html          Main one-page landing page
apply.html          "Apply Now" page with the application form
css/style.css       All styles for both pages (light design system, ~2800 lines)
js/main.js          All client-side behavior (~300 lines)
images/             Brand logo, favicons, PWA manifest, stock photos
                    logo-brand.{png,webp}       — navbar brand lockup (navy/blue)
                    logo-brand-light.{png,webp} — footer brand lockup (white/cyan)
                    hero-home-dusk.{jpg,webp}  — hero (preloaded)
                    coverage-texture.{jpg,webp} — dark coverage backdrop
                    technician.jpg              — Get Connected
                    fiber-optic.{jpg,webp}      — Support section backdrop
                    logo.png                    — favicon/manifest/OG only, NOT in the navbar
```

**Brand logo.** The navbar and footer render `images/logo-brand*.{png,webp}` — a 300×60
horizontal lockup ("iGREY / E.H INTERNET CONNECTION") recolored to the page palette, with the
white paper knocked out to transparency. Two variants are required: `logo-brand` (navy +
primary blue) for the light navbar, `logo-brand-light` (white + accent-cyan) for the dark
footer, because the navy variant disappears on `--color-navy`. Recolor with the
`alpha = 1 - min(r,g,b)/255` ink-coverage formula, not a hue filter — a hue filter cannot
recolor the desaturated black text, and near-black antialiasing classifies into the blue hue
range under HSV, so match red with `r > g*1.7 and r > b*1.7` and blue with `b > r*1.25`.

There is no HTML wordmark next to the logo — the lockup carries its own. Do not re-add one.

**Brand-name strings are intentionally inconsistent.** The logo says "E.H INTERNET
CONNECTION"; ~22 other strings across both pages still say "EH CONNECT" (page titles, meta
descriptions, footer copyright, apply-page heading and success copy, alt text, the portal
mockup). This was a deliberate decision — the logo was swapped without a rename. Treat it as
known, not as a bug to fix on sight.

`logo.png` is a full dark square badge and is unreadable at navbar size. Keep it for favicon,
manifest, and OG image only.

### Sections and anchors

Page order: `#home` → `#plans` → `#coverage` → `#portal` → `#about` → `#testimonials` → `#faq` → `#support` → footer.

Navbar order is **Home / Plans / Coverage / Support / About / FAQ** — note this does *not* match page order (`#support` and `#about` come after `#faq`). This is intentional. If you reorder sections, keep the scroll spy working (it derives the active link from `section[id]` offsets).

The `#contact` section was removed in the redesign; contact details now live in the footer's "Get in Touch" column. Don't re-add a dead nav link to it. The `#faq` section was also dropped by mistake and restored — **it is live content mirrored from the production site, keep it.**

## Build, run, and test commands

Nothing to build or install. Serve the files with any static server:

```bash
python3 -m http.server 8000        # or: npx serve .
```

### Docker

nginx container (`Dockerfile`, `docker-compose.yml`, `nginx.conf`). Files are served from `/usr/share/nginx/html` at the **root path**. `nginx.conf` 301-redirects legacy `/EH` → `/`.

```bash
docker compose up -d --build      # serves on http://localhost:8129
docker compose down               # stop
```

**Asset paths are root-relative** (`/css/style.css`, `/images/logo.png`) — there is **no `/EH/` prefix**. Older versions of this file wrongly documented an `/EH/` prefix; that was removed when the site moved to root.

**Testing:** manual only — open the pages in a browser. There are no automated tests, linters, or CI. If you add them, `npx playwright` works and `cwebp` is available for image optimization.

## Code organization

### `index.html`

Sections in order: `#home` (hero), `#plans`, `#coverage` (dark), `#portal`, `#about` (Get Connected), `#testimonials`, `#faq`, `#support` (dark), footer. Navbar anchors must match a section `id` for the scroll spy.

Reusable patterns: `.section-eyebrow` + `.section-title` + `.section-subtitle` inside `.section-header`; `.card` for surfaces; `.icon-tile` (and `--sm` / `--circle` / `--glass` modifiers) for icons; `.on-dark` for dark-section typography.

The **Customer Portal device mockups** (laptop + phone) are built entirely from divs in `index.html` and wrapped in `aria-hidden="true"` — they are decorative, not content.

The **FAQ** is a native `<details>`/`<summary>` accordion — no JS. Each item carries `name="faq"`, which makes the group mutually exclusive in browsers that support it. The chevron is `aria-hidden` and rotates via CSS on `[open]`; `summary::marker` is neutralised because the chevron replaces the native triangle. Single-column on purpose: an expanding `<details>` in a two-up grid shifts its sibling column.

### `apply.html`

Same navbar/footer markup as `index.html` (links prefixed with `/index.html`). Form uses `.form-error` spans carrying `data-required` / `data-email` / `data-tel` messages that JS overwrites. Submission is **simulated client-side only** — no network request (see Security).

### `js/main.js`

One `DOMContentLoaded` listener, numbered banner-commented sections:

1. Navbar scroll effect · 2. Mobile menu toggle · 3. Scroll spy · 4. IntersectionObserver reveals · 5. Smooth scroll · 6. **Plans Monthly/Compare toggle** (roving `role="tab"`, arrow/Home/End keys) · 7. **Coverage address checker** · 8. Form validation (apply page) · 9. Apply form submit

Uses `'use strict'`, arrow functions, passive scroll listeners.

Scroll reveals use `.animate-on-scroll`, `.animate-on-scroll-left`, `.animate-on-scroll-right`, `.stagger-children` (the `.stagger-children > *` children get `transition-delay`). Adding `.is-visible` triggers them. JS adds `is-visible` to everything immediately when `prefers-reduced-motion` is set or `IntersectionObserver` is unavailable.

**Coverage address checker:** matches input against the `SERVICE_AREAS` array in `main.js` (case-insensitive, punctuation-normalized, bidirectional substring). Result renders into `#coverageResult`, a `role="status" aria-live="polite"` element. Reflected input is HTML-escaped before insertion. It sends no data anywhere.

### `css/style.css`

Order: tokens → reset/base → layout/typography → buttons → cards → scroll reveal → navbar → hero → plans → **faq** → coverage → portal → steps → testimonials → support → footer → floating button → apply page → responsive → reduced motion.

Only three keyframes remain: `mapPulse` (coverage map nodes), `floatBadge` (steps badge), `streak` (support light streaks). Don't add more without a reason — the design is deliberately calm.

## Code style guidelines

- **HTML:** 2-space indent, banner comments (`<!-- ===...=== NAVBAR ===...=== -->`), ARIA on nav/sections and all icon-only controls
- **CSS:** 2-space indent, design tokens via custom properties — reuse existing variables, never hardcode a hex in a component
- **JS:** 2-space indent, `'use strict'`, arrow functions, passive scroll listeners, banner comments matching the numbered style
- External links get `target="_blank" rel="noopener noreferrer"`
- Images need explicit `width`/`height` (prevents CLS), `loading="lazy"` except the hero, and a `<picture>` with a WebP source + JPEG fallback when the file has a `.webp` twin
- Interactive targets ≥44×44px with ≥8px gaps; never remove `:focus-visible`

## Security considerations

- The site is fully static; there is no server-side code or data storage
- **The application form does not send data anywhere.** It validates, logs to console, waits 1.5s, then shows `#applySuccess`. The coverage checker runs entirely client-side. Keep personal data out of network calls until a real backend is designed
- The coverage checker reflects user input into `innerHTML` — it is escaped via `escapeHtml()`; keep it that way
- **Every portal CTA routes to `/portal/login`.** There is no `/portal/signup` link anywhere
  on the site, and `apply.html`'s own form makes no network request, so the site currently has
  no working application path. That was a deliberate decision, but revisit it if signups matter
- The Font Awesome CDN link uses an SRI `integrity` hash; keep integrity hashes on any CDN resource
- Do not commit secrets; there are none in this repo and none should be added
