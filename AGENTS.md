# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

This is a **static marketing landing page** for **EH CONNECT**, a fiber internet service provider (ISP). It is a plain HTML/CSS/JS site with **no build system, no package manager, no framework, and no backend** — the files are served as-is.

- Domain referenced throughout: `https://ehconnection.com`
- External billing/customer portal links point to `https://billing.ehconnection.com` (and `/portal/signup`)
- Language of code, comments, and content: **English**

### Project structure

```
index.html          Main one-page landing page (~600 lines)
apply.html          "Apply Now" page with the application form (~250 lines)
css/style.css       All styles for both pages (~2300 lines)
js/main.js          All client-side behavior for both pages (~320 lines)
images/             Logo, favicons, apple-touch-icon, PWA manifest (site.webmanifest),
                    and downloaded stock photos used by the landing page:
                    network-switch.jpg + fiber-patch.jpg (hero carousel), technician.jpg +
                    server-room.jpg (about collage + hero carousel), home-streaming.jpg +
                    business-team.jpg (audience cards), cta-bg.jpg (CTA banner background)
```

There is no `package.json`, no config files, no test suite, and no CI configuration.

## Build, run, and test commands

There is nothing to build or install. To view the site, serve the files with any static file server, e.g.:

```bash
python3 -m http.server 8000        # or: npx serve .
```

### Docker

The site ships as an nginx container (`Dockerfile`, `docker-compose.yml`, `nginx.conf`). Files are copied to `/usr/share/nginx/html/EH` so the `/EH/` path prefix works; `nginx.conf` redirects `/` to `/EH/index.html`.

```bash
docker compose up -d --build      # serves on http://localhost:8129
docker compose down               # stop
```

**Important:** all asset paths in the HTML and manifest are absolute and prefixed with `/EH/` (e.g. `/EH/css/style.css`, `/EH/images/logo.png`). The site is deployed under an `/EH/` subdirectory on the web server. When serving locally, either place the files under an `EH/` directory inside the server root, or the asset links will 404. Keep the `/EH/` prefix when adding new asset references.

**Testing:** manual only — open the pages in a browser and check behavior (navigation, mobile menu, form validation). There are no automated tests or linters.

## Code organization

### `index.html` — one-page layout

Sections, in order, each wrapped in `<section id="...">` (used by the scroll-spy nav):

- `#home` — hero with auto-rotating photo carousel (4 slides: `network-switch.jpg`, `fiber-patch.jpg`, `technician.jpg`, `server-room.jpg`; dots + hover pause; JS section 10) and an FTTH-themed highlights row
- `#about` — "Why choose EH CONNECT": image collage split (technician + server room), feature cards, and "For Your Home / Built Around Your Needs" audience cards

**Offering note:** EH CONNECT does **not** sell fixed business plans — copy instead says speeds are customizable per customer need ("custom speed plan", "tailored quote"). Don't reintroduce "business plan / enterprise plan / static IP / SLA" wording.
- `#how-it-works` — 3-step "Get Connected" strip
- `#plans` — internet plans and pricing cards
- `#coverage` — service coverage areas with a lazy-loaded embedded Google Map (`data-src` set by JS section 7)
- `#portal` — customer portal features
- `#testimonials` — subscriber quotes (initial avatars, no photos)
- CTA banner (no id) — background photo `cta-bg.jpg` with dark overlay
- `#faq` — FAQ accordion built with native `<details>` elements (no JS)
- `#contact` — contact information

Head includes SEO meta tags, Open Graph tags, Google Fonts (Inter), Font Awesome 6.5.1 via cdnjs (with SRI integrity hash), favicon set, and the PWA manifest.

### `apply.html` — application page

Same navbar (always in `scrolled` state) and a form (`#applyForm`, `novalidate`) plus a `#applySuccess` confirmation block.

### `js/main.js` — single script, `DOMContentLoaded` wrapper

Everything runs inside one `DOMContentLoaded` listener, organized into **numbered, banner-commented sections** (1. Navbar scroll effect, 2. Mobile menu toggle, 3. Scroll spy, 4. IntersectionObserver scroll animations, 5. Smooth scroll, 6. Parallax tilt on cards, 7. Lazy load of the coverage map iframe from its `data-src`, 8. Reduced-motion check, 9. Form validation, 10. Hero image carousel). Keep this numbered-section organization when extending the file.

Key behaviors:

- Scroll animations work via `IntersectionObserver` adding `.is-visible` to elements with classes `.animate-on-scroll`, `.animate-on-scroll-left`, `.animate-on-scroll-right`, `.stagger-children`.
- Respects `prefers-reduced-motion` (tilt effect and animations are disabled in both JS and a dedicated CSS media query at the end of `style.css`).
- The apply-form submission is **simulated client-side only**: it prevents default, validates, logs the data to the console, waits 1.5 s, then shows `#applySuccess`. No network request is made yet (comment notes "future billing system integration"). The primary "Apply Now" / "Get Connected" CTAs link directly to the external billing portal instead.

### `css/style.css` — design system

- All design tokens are CSS custom properties under `:root`: colors (`--color-primary: #0B132B` dark navy, `--color-secondary: #0091D5` blue, `--color-accent: #7FDBFF`), gray scale, spacing, radii, shadows, transitions, and glassmorphism variables (`--glass-bg`, `--glass-border`, `--glass-blur`).
- Theme color is `#0B132B` (also in `<meta name="theme-color">` and the manifest).
- Reusable patterns: `.container` (max-width 1200px), `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-sm` / `.btn-lg`, `.glass-card`, `.section-badge` / `.section-title` / `.section-subtitle`.
- Dark theme with glassmorphism cards and gradient accents; fully responsive with mobile navbar toggle.

## Code style guidelines

- **HTML:** 2-space indent, banner comments delimiting major sections (`<!-- ===...=== NAVBAR ===...=== -->`), ARIA attributes on nav/sections (`role`, `aria-label`, `aria-expanded`).
- **CSS:** 2-space indent, design tokens via custom properties — reuse existing variables instead of hardcoding new colors/spacing.
- **JS:** 2-space indent, `'use strict'`, arrow functions, passive scroll listeners, banner comments matching the existing numbered-section style.
- External links get `target="_blank" rel="noopener noreferrer"`.
- When adding a new section to `index.html`, give it an `id` and a matching `.navbar-links` anchor so the scroll spy picks it up.

## Security considerations

- The site is fully static; there is no server-side code or data storage.
- The application form does **not** send data anywhere — keep personal data out of network calls until a real backend integration is designed.
- The Font Awesome CDN link uses an SRI `integrity` hash; keep integrity hashes when adding or updating CDN resources.
- Do not commit secrets; there are no credentials in this repo and none should be added.
