# Project Knowledge

Reference notes for the EH CONNECT ISP landing page project: goals, commands, conventions, and gotchas.

> **Note (Sept 2026 redesign):** the site was rebuilt from a dark neon-glassmorphism
> theme into a light professional theme. `AGENTS.md` is the authoritative source for the
> current design system, structure, and code conventions. This file keeps the project-level
> facts and the history of what was removed, so the old patterns don't get reintroduced.

## What this is

A **static marketing landing page** for **EH CONNECT**, a fiber internet service provider serving Liloan and Consolacion, Cebu, Philippines. It's a plain HTML/CSS/JS site with **no build system, no package manager, no framework, and no backend**.

- Domain: `https://ehconnection.com` (OG tags still point to the test server `http://10.10.80.153`)
- Test/staging server: `10.10.80.153` — SSH user `alain`, project in `landing-page/`, deployed via Docker
- Application CTAs: `https://billing.ehconnection.com/portal/signup`
- Portal CTAs: `https://billing.ehconnection.com/portal/login`
- Facebook: `https://facebook.com/e.hinternetconnection`
- Messenger: `https://m.me/e.hinternetconnection`

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Main one-page landing page (7 sections + footer) |
| `apply.html` | "Apply Now" page with the application form |
| `css/style.css` | All styles for both pages — light design system, responsive (~2800 lines) |
| `js/main.js` | All client-side JS in 9 numbered sections (~300 lines) |
| `images/` | Logo, favicons, PWA manifest, stock photos (see image table below) |
| `Dockerfile` | nginx:1.27-alpine; copies site to `/usr/share/nginx/html` (root), `chmod -R a+rX` |
| `docker-compose.yml` | Runs on port 8129 |
| `nginx.conf` | Serves at root `/`, `try_files $uri $uri/ =404`; 301-redirects legacy `/EH` → `/` |

### Images

| File | Used for |
|------|----------|
| `hero-home-dusk.{jpg,webp}` | Hero right panel (preloaded, `fetchpriority="high"`) |
| `coverage-texture.{jpg,webp}` | `#coverage` dark backdrop at 30% + luminosity blend |
| `technician.jpg` | `#about` (Get Connected) |
| `fiber-optic.{jpg,webp}` | `#support` dark backdrop at 20% |
| `logo-brand.{png,webp}` | Navbar brand lockup — navy + primary blue, transparent bg, 300×60 |
| `logo-brand-light.{png,webp}` | Footer brand lockup — white + accent-cyan, transparent bg |
| `logo.png` | **favicon / manifest / OG only** — a full dark square badge, unreadable at navbar size |

The brand lockup is a 300×60 horizontal PNG whose white paper was knocked out to transparency
and whose colors were remapped to the page palette (red → `#1668E3`, black → `#0A1A33`, the
blue mark keeps a gradient). Two variants exist because the navy one is invisible on the dark
footer. It renders at 190×38, comfortably under the native 300px width, so it never upscales.

**Known inconsistency:** the logo reads "E.H INTERNET CONNECTION" while ~22 strings across both
pages still read "EH CONNECT" (titles, meta, footer copyright, apply page copy, alt text).
Intentional — the logo was swapped without a rename.

**Unused after the redesign** (left on disk, not deleted): `fiber-patch.jpg`, `home-internet-speed.png`, `secure-home-network.png`, `family-laptop.jpg`, `home-streaming.jpg`, `router-wifi.jpg`, `business-team.jpg`, `server-room.jpg`, `cta-bg.jpg`. Most were only used by the deleted hero carousel.

`cwebp` is installed and used to produce WebP twins; `sips` on this machine does **not** support WebP.

## Commands

There's nothing to install or build — it's static HTML/CSS/JS.

```bash
# Local dev (pick one)
python3 -m http.server 8000
npx serve .

# Docker
docker compose up -d --build    # serves on http://localhost:8129
docker compose down             # stop

# Testing: manual — open pages in a browser, check navigation, mobile menu,
# plans toggle, coverage checker, form validation.
# Playwright IS available for scripted checks:
#   npx playwright --version    # 1.63.0
```

## Architecture & conventions

### Asset paths — root-relative (no path prefix)

All asset paths are **root-relative** (`/css/style.css`, `/images/logo.png`, `/js/main.js`). The site is served at the **root path** by nginx. Legacy `/EH/...` URLs are 301-redirected to `/...`. Always use root-relative paths for new asset references.

### HTML structure

- Sections in `index.html` each have an `id`; navbar anchors must match one for the scroll spy
- Order: `#home`, `#plans`, `#coverage`, `#portal`, `#about`, `#testimonials`, `#faq`, `#support`, footer
- Navbar order is Home / Plans / Coverage / Support / About / FAQ — **deliberately different** from page order
- 2-space indent, banner comments, ARIA on nav/sections and all icon-only controls
- External links: `target="_blank" rel="noopener noreferrer"`

### CSS — light design system

See `AGENTS.md` for the full token table. Key points:

- Light base (`#FFFFFF`); three dark sections only: `#coverage`, `#support`, `.footer`
- Blue `#1668E3` clears 5.1:1 against white, so it works for both blue-on-white text and white-on-blue fills
- Only three keyframes remain — `mapPulse`, `floatBadge`, `streak`
- The hero photo bleeds off the right viewport edge at ≥1025px via a negative `margin-right` computed from `--max-width`

### JavaScript (`js/main.js`)

One `DOMContentLoaded` listener, 9 numbered banner-commented sections: navbar scroll · mobile menu · scroll spy · IntersectionObserver reveals · smooth scroll · **plans Monthly/Compare toggle** · **coverage address checker** · form validation · apply form submit.

Uses `'use strict'`, arrow functions, passive scroll listeners.

## Portal URLs

The 19 billing links split by intent, and every one shares the same origin — so edit them by
line number, never by search-and-replace, or the two sets will cross.

| Destination | Count | Links |
|---|---|---|
| `/portal/signup` | 11 | navbar Apply Now (x2), hero Get Connected, 4 plan "Get This Plan", 4 compare-table CTAs |
| `/portal/login` | 8 | navbar Customer Portal (x2), "Go to Customer Portal", success-block Customer Portal, 2 footer Customer Portal, 2 footer "Submit a Ticket" |

"Submit a Ticket" points at login, not signup: filing a ticket is an existing-subscriber
support action, not an application. Note that "Submit a Ticket" did not exist in the original
design — it was added during the redesign.

`apply.html` is not linked from anywhere in the site. It is reachable only by direct URL, its
form is a client-side mock that sends no network request, and its own navbar "Apply Now" now
points at the real signup page directly above that mock form.

## What was removed in the Sept 2026 redesign (do not reintroduce)

- **Particle canvas** (`#particleCanvas`, `FiberParticle` class, `requestAnimationFrame` loop)
- **Site-wide signal layer** (`.signal-layer`, `.signal-line`, `.signal-dot`, `signalTravel`/`signalPulseH/V`/`dotPulse`)
- **3D card tilt** on mousemove (`perspective`, `rotateX/rotateY`, `--light-x`/`--light-y` dynamic reflection)
- **Hero image carousel** (6 slides + dots, auto-rotate, 3D tilt, `hover` pause)
- **Google Maps iframes** (coverage map + contact map) — no third-party map requests any more
- All neon keyframes: `holoShimmer`, `gradientShift`, `floatSlow`, `glowPulse`, `borderGlow`
- The `#contact` section, the "Why Choose Us" feature grid, the standalone
  "How it works" section, and the CTA banner

**`#faq` was dropped by mistake, not by decision.** It was restored from
`https://ehconnection.com/` and git `c73d7d4` (the two copies were byte-identical). It is
live content mirrored from the production site, not filler. It sits between `#testimonials`
and `#support` because it answers pricing/contract/payment objections just before the
closing CTA. Native `<details>` accordion, no JS.

## Important: form submission is client-side only

The `#applyForm` on `apply.html` validates, logs data to console, waits 1.5s, then shows `#applySuccess`. No network request. The real "Apply Now" CTAs link directly to the external billing portal. Keep it that way until a real backend exists.

## EH CONNECT does NOT sell fixed business plans

Copy says speeds are customizable per customer need ("custom speed plan", "tailored quote"). Don't reintroduce "business plan / enterprise plan / static IP / SLA" wording.

## Favicon set

- `/images/favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `site.webmanifest`
- Theme color (meta + manifest): `#0A1A33` — matches the dark sections and the footer

## CDN dependencies

- Google Fonts: Poppins (600–800), Inter (400–600), Caveat (500–600) — single combined request
- Font Awesome 6.5.1 via cdnjs with an SRI integrity hash

## Accessibility

- `aria-hidden="true"` on all decorative elements (device mockups, star glyphs, map dots, hero overlays)
- Every text pair meets WCAG AA. `--color-body-light` (`#7A8699`) is only 3.7:1 — don't use it for text
- `prefers-reduced-motion` respected in both CSS and JS
- Skip link, `focus-visible` outlines, ≥44×44px targets, `role="status"` on the coverage result

## Security

- Fully static — no server-side code or data storage
- Form doesn't send data anywhere
- The coverage checker reflects user input into `innerHTML` and escapes it via `escapeHtml()` — keep it that way
- No secrets in this repo; never add any
