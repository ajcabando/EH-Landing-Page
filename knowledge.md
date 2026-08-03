# Project Knowledge

This file gives Freebuff context about the EH CONNECT ISP landing page project: goals, commands, conventions, and gotchas.

## What this is

A **static marketing landing page** for **EH CONNECT**, a fiber internet service provider serving Liloan and Consolacion, Cebu, Philippines. It's a plain HTML/CSS/JS site with **no build system, no package manager, no framework, and no backend**.

- Domain: `https://ehconnection.com`
- Billing/customer portal: `https://billing.ehconnection.com`
- Facebook: `https://facebook.com/e.hinternetconnection`
- Messenger: `https://m.me/e.hinternetconnection`

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Main one-page landing page (~600 lines, 10+ sections) |
| `apply.html` | "Apply Now" page with application form (~250 lines) |
| `css/style.css` | All styles, futuristic 3D theme, glassmorphism, responsive (~2500 lines) |
| `js/main.js` | All client-side JS, organized in numbered sections (~400 lines) |
| `images/` | Logo, favicons, PWA manifest, stock photos (carousel: router-wifi.jpg, fiber-optic.jpg, family-laptop.jpg, streaming-setup.jpg, secure-home-network.jpg, home-internet-speed.png) |
| `Dockerfile` | nginx:1.27-alpine container that serves under `/EH/` path prefix |
| `docker-compose.yml` | Runs on port 8129 |
| `nginx.conf` | Redirects `/` → `/EH/index.html`, serves `/EH/` alias |

## Commands

There's nothing to install or build — it's static HTML/CSS/JS.

```bash
# Local dev (pick one)
python3 -m http.server 8000
npx serve .

# Docker
docker compose up -d --build    # serves on http://localhost:8129
docker compose down             # stop

# Testing: manual only — open pages in browser, check navigation,
# mobile menu, form validation, carousel. No automated tests or linters.
```

## Architecture & conventions

### Path prefix — IMPORTANT GOTCHA

All asset paths in HTML are **absolute and prefixed with `/EH/`** (e.g. `/EH/css/style.css`, `/EH/images/logo.png`). The site is deployed under an `/EH/` subdirectory. When serving locally with `python3 -m http.server`, place files under an `EH/` subdirectory, or asset links will 404. Always use the `/EH/` prefix when adding new asset references.

### HTML structure

- Sections in `index.html` each have an `id` matching navbar anchors (scroll spy picks them up)
- Sections: `#home` (hero), `#about`, `#how-it-works`, `#plans`, `#coverage`, `#portal`, `#testimonials`, CTA banner, `#faq`, `#contact`
- 2-space indent, banner comments (`<!-- ===...=== -->`), ARIA attributes on nav/sections
- External links: `target="_blank" rel="noopener noreferrer"`

### CSS — Futuristic 3D Design System

#### Color Palette (CSS Custom Properties)

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-neon-cyan` | `#00e5ff` | Primary accent, glows, borders, badges |
| `--color-neon-purple` | `#b44dff` | Secondary accent, gradients, network dots |
| `--color-neon-pink` | `#ff2d78` | Tertiary accent, floating shapes |
| `--color-neon-green` | `#00ff88` | Success states, checkmarks |
| `--color-dark` | `#030712` | Background |
| `--color-primary` | `#050a18` | Deep background |
| `--color-secondary` | `#00e5ff` | Main interactive color |

#### Glassmorphism Cards (`.glass-card`)

- Deep glass background: `rgba(8, 14, 40, 0.55)` with `blur(24px)`
- `::before` pseudo-element: Top refraction highlight (cyan→purple gradient, 1px)
- `::after` pseudo-element: Holographic shimmer + dynamic light reflection via CSS custom properties (`--light-x`, `--light-y`)
- `transform-style: preserve-3d` for 3D tilt effects
- Hover: `translateY(-8px) translateZ(20px)` with neon glow shadow

#### 3D Effects

- Hero section: `perspective: 1200px` on `.hero-visual`
- Carousel: Interactive 3D tilt via JS mousemove (rotateX/rotateY up to ±8deg, translateZ(20px), scale(1.02))
- Cards: Interactive tilt via JS mousemove (rotateX/rotateY up to ±10deg, translateZ(15px))
- Dynamic light reflection on glass cards via `--light-x`/`--light-y` CSS custom properties

#### Animations

| Animation | Description |
|-----------|-------------|
| `holoShimmer` | Holographic shimmer sweep on glass cards |
| `gradientShift` | Rotating gradient on titles and buttons |
| `floatSlow` | Slow vertical float (unused helper) |
| `glowPulse` | Icon and badge glow animation |
| `borderGlow` | Border opacity pulse animation |
| `signalPulseH/V` | Horizontal/vertical signal sweep gradients (site-wide `.signal-layer`) |
| `signalTravel` | Fiber-light lines traveling across the screen (site-wide `.signal-layer`) |
| `dotPulse` | Glowing signal dots pulsing (site-wide `.signal-layer`) |

#### Hero Background

The hero uses the **same plain dark background as the rest of the page** (`body` → `--color-dark`). The old hero-only animated layers (mesh gradient, grid, network, floating shapes, scanlines) were removed for visual consistency across sections.

Two **subtle site-wide decorative layers** (both fixed at `z-index: -1` behind all content) run on **both pages**:

- `#particleCanvas.particle-bg` — faint fiber-optic particle canvas (25–50 particles, cyan/purple/green, low-opacity connection lines, JS-driven)
- `.signal-layer` — moving fiber-light signal lines: 5 traveling horizontal light lines (`signalTravel`) + 5 pulsing glow dots (`dotPulse`), plus horizontal/vertical sweep gradients (`signalPulseH/V`) via `::before`/`::after`; pure CSS, reduced-motion aware

#### Buttons

- `.btn-primary`: Animated gradient (cyan→blue→purple), glow shadow, 3D hover lift
- `.btn-secondary`: Glass background, cyan border glow on hover
- `.btn-outline`: Cyan border, subtle fill on hover
- All buttons: `::before` shimmer sweep, `::after` gradient border mask on hover

#### Section Badges

- Neon cyan border and glow, text-shadow, `glowPulse` animation on icon

#### Section Titles

- Animated gradient text (white→cyan→purple) with `gradientShift` animation
- `drop-shadow` filter for subtle glow

### JavaScript (`js/main.js`)

Everything runs inside one `DOMContentLoaded` listener. Organized into **numbered, banner-commented sections**:

1. Navbar scroll effect
2. Mobile menu toggle
3. Scroll spy (highlights active nav link)
4. IntersectionObserver scroll animations (adds `.is-visible`)
5. Smooth scroll
6. **3D perspective tilt on glass cards** (rotateX/rotateY via mousemove, dynamic light via CSS custom properties)
7. Lazy-load coverage map iframe (`data-src` → `src`)
8. Reduced-motion check
9. Form validation (apply page)
10. **Hero carousel 3D tilt** (rotateX/rotateY/translateZ/scale, dynamic glow shift)
11. Hero image carousel (auto-rotate, dots, hover pause)
12. **Particle canvas system** — site-wide fixed backdrop, 25–50 particles with connections, subtle low-opacity (cyan/purple/green), reduced-motion aware, resize debounce

Uses `'use strict'`, arrow functions, passive scroll listeners.

### Important: Form submission is client-side only

The `#applyForm` on `apply.html` validates, logs data to console, waits 1.5s, then shows `#applySuccess`. No network request. The real "Apply Now" CTAs link directly to the external billing portal.

### EH CONNECT does NOT sell fixed business plans

Copy says speeds are customizable per customer need ("custom speed plan", "tailored quote"). Don't reintroduce "business plan / enterprise plan / static IP / SLA" wording.

### Favicon set

- `/EH/images/favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `site.webmanifest`
- Theme color: `#030712`

### CDN dependencies

- Google Fonts: Inter (400–900)
- Font Awesome 6.5.1 via cdnjs with SRI integrity hash

### Accessibility

- `aria-hidden="true"` on all decorative elements (particle canvas, hero carousel glow)
- `prefers-reduced-motion` respected: JS disables particle canvas and tilt effects; CSS sets `animation-duration: 0.01ms`
- All interactive elements have focus-visible styles

### Security

- Fully static — no server-side code or data storage
- Form doesn't send data anywhere
- No secrets in this repo; never add any
