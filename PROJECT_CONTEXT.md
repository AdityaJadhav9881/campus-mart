# PROJECT CONTEXT — CampusMart AI Promotional Site

> Purpose of this file: persistent, self-contained context so a fresh session
> (or a different agent) can pick up this project without re-reading source.
> Read this first, then the referenced files as needed. Update it whenever a
> major change lands.

---

## 1. What this project is

A **single-page promotional / marketing website** for **CampusMart AI** — a
multi-agent AI marketplace for college students to securely buy, sell, and
exchange academic materials.

- **Frontend-only repo** (no backend, DB, or auth of its own), but since the
  production-integration pass it makes **read-only live API calls** to the
  separate FastAPI + PostgreSQL backend (`GET /`, `GET /products/`) for the
  campus feed sync. When the API is unreachable the site falls back to an
  offline demo mode with seed data.
- It is a **showcase / lead-gen page** that proves the product's value using
  interactive demos (dual-tab APK download + waitlist modal with generated QR
  code, live price estimator, phone mockup, in-browser pipeline sandbox,
  interactive architecture diagram).
- The actual product is described as a **Flutter mobile app**; this site is the
  web landing page for it, and hosts the direct Android APK download hub.

Product pitch in one line: *a secure, AI-driven exchange for college students
with intelligent listings, fair pricing, and trust built into every
transaction.*

---

## 2. Tech stack

| Layer      | Choice                                   |
|------------|------------------------------------------|
| Build tool | Vite `^8.3.4`                            |
| Framework  | React `^19.3.1` (function components + hooks, JSX) |
| Styling    | Tailwind CSS `^4.3.3` via `@tailwindcss/vite` |
| Icons      | lucide-react `^1.57.0`                   |
| Language   | Plain JSX (JavaScript), **no TypeScript** |
| Fonts      | Inter (Google Fonts, loaded in `index.html`) |
| Deploy     | Vercel (`vercel.json` present)           |

Notes:
- Tailwind **v4** is CSS-first config. There is **no `tailwind.config.js`**.
  Design tokens live in `src/index.css` under `@theme { ... }`.
- Node v24, npm v11 verified on the dev machine.

### Commands
```bash
npm run dev      # start dev server
npm run build    # production build -> dist/  (VERIFY after every change)
npm run preview  # preview the production build
```

**Always run `npm run build` after edits to verify no syntax / missing-asset
errors.** There is no test suite and no linter configured.

---

## 3. Design system — "Infinity Design"

This site follows a custom design philosophy stored in the repo as two text
files (they are reference docs, not code):

- `INFINITY_DESIGN_Universal_Design_Philosophy.txt` — the master philosophy.
- `Aditya_Infinity_Design_Portfolio_Master_Prompt.txt` — an example brief that
  applies the philosophy to a portfolio (used only as a style reference).

### Core tenets to preserve
- Infinity is an **experience**, not a decoration. No galaxies, stars, neon
  everywhere, particles, or forced glassmorphism.
- Premium comes from **restraint**: precise spacing, strong hierarchy, large
  negative space, meaningful motion only.
- Motion must **communicate** (state/direction/feedback), never decorate.
  Never make the user wait on an animation.
- Always honor **`prefers-reduced-motion`**.
- Accessibility is non-negotiable: readable contrast, keyboard nav, focus
  states, screen readers, semantic HTML.
- Avoid generic UI: no repeated rounded card grids, no generic gradients.

### Visual tokens (defined in `src/index.css` `@theme`)
Colors — dark "void/abyss" foundation with a single restrained cyan accent:

| Token              | Hex       | Use                                      |
|--------------------|-----------|------------------------------------------|
| `--color-void`     | `#04060a` | Page background (deepest)                |
| `--color-abyss`    | `#070a10` | Slightly raised surfaces / alt sections  |
| `--color-surface`  | `#0b0f16` | Panels, inputs, cards                    |
| `--color-hairline` | `#18202c` | 1px borders, dividers                    |
| `--color-hairline-strong` | `#243044` | Emphasized borders / input borders |
| `--color-ink`      | `#eef3f9` | Primary text (near-white)                |
| `--color-muted`    | `#93a0b1` | Secondary text                           |
| `--color-faint`    | `#74818f` | Tertiary / captions / labels             |
| `--color-accent`   | `#22d3ee` | THE cyan accent — interactions, emphasis |
| `--color-accent-deep` | `#0e7490` | Deeper cyan                          |

Rules of use:
- **Cyan (`accent`) is the only brand color.** Use it sparingly for focus,
  interaction, and emphasis. Do not sprinkle it everywhere.
- **Green is semantic success ONLY.** **Red is semantic error ONLY.**
  (Exceptions already in code: an amber/amber-300 tone is used for the
  "consumer email detected" warning in the waitlist modal, and red-400/red-300
  for form validation errors.)
- `theme-color` meta in `index.html` is `#0a0a0f` (the "abyss dark" tone
  requested for mobile browser chrome).

### Type + spacing
- Font: Inter. Utility `label-caps` (defined via `@utility` in `index.css`)
  renders small uppercase tracked labels — used heavily for section eyebrows.
- Spacing is on a 4/8px rhythm; sections generally `py-24 md:py-32`.
- Hairline (`1px`) borders everywhere instead of shadows/rounded cards.
- Layout container is `mx-auto max-w-6xl px-6`.

### Motion utilities (in `src/index.css`)
- `.hero-in` + `@keyframes hero-rise` — hero entry stagger (use inline
  `style={{ animationDelay }}` for stagger).
- `.reveal[data-visible=true]` — scroll-reveal (driven by `Reveal.jsx`).
- `.agent-dot` — slow 3.2s opacity pulse for status dots.
- `.range-track` — custom styled `<input type="range">` (hairline track,
  cyan thumb with glow ring).
- `.scan-sweep` / `.detect-in` — the YOLO camera scan line + detection
  animation inside the phone mockup, also reused for the sandbox's
  "verified" banner and the mobile architecture detail card.
- `.pipeline-fill` — `scaleX` progress bar under the sandbox's running agent.
- `.card-arrive` — feed card entrance when a sandbox listing is published.
- `.arch-connector` / `.arch-node` — stroke/color transitions on the
  architecture diagram edges and nodes (plus a `translateY(-1px)` node hover).
- All animations are disabled under `prefers-reduced-motion: reduce`.

---

## 4. File map

```
/
├── index.html                 # entry HTML, all meta/OG/Twitter tags, Inter font
├── package.json               # scripts + deps
├── vite.config.js             # react() + tailwindcss() plugins
├── vercel.json                # SPA rewrite + caching/security headers
├── .env.example               # documents VITE_API_BASE_URL + VITE_APK_DOWNLOAD_URL
├── .gitignore                 # ignores node_modules, dist, .env*, editor junk
│
├── public/
│   └── campusmart-ai.apk      # (drop the signed release here; served at site root)
│
├── src/
│   ├── main.jsx               # createRoot mount, imports ./index.css
│   ├── index.css              # Tailwind v4 @theme tokens + base + utilities
│   ├── App.jsx                # composes sections; OWNS waitlist modal state
│   │
│   ├── api/
│   │   └── client.js          # FastAPI client: checkApiHealth (GET /),
│   │                          #  fetchLiveProducts (GET /products/), env-driven base URL
│   │
│   ├── lib/
│   │   └── qrcode.js          # dependency-free QR generator (byte mode, EC level M,
│   │                          #  versions 1–10) returning a boolean module matrix
│   │
│   ├── components/
│   │   ├── Reveal.jsx         # generic IntersectionObserver scroll-reveal wrapper
│   │   ├── ApiStatusBadge.jsx # ● Connected / ○ Offline badge + Refresh button
│   │   ├── QrCode.jsx         # pure-SVG QR renderer (light bg, void modules)
│   │   └── WaitlistModal.jsx  # dual-tab Get CampusMart AI modal (APK + iOS waitlist)
│   │
│   ├── hooks/
│   │   ├── usePipeline.js     # 3-step agent pipeline timing for the sandbox
│   │   └── useLiveFeed.js     # shared live-feed sync (health check + /products/,
│   │                          #  in-flight dedupe + cache) + mapProductToFeedItem
│   │
│   ├── data/
│   │   ├── features.js        # landing-page content (features, agent pipeline,
│   │   │                      #  exchange flow, estimator model, phone-preview
│   │   │                      #  data, FAQs)
│   │   └── sandbox.js         # sandbox model (conditions, prohibited terms,
│   │                          #  seed feed) + architecture node/edge graph
│   │
│   └── sections/
│       ├── Navigation.jsx     # fixed nav, mobile menu, Download CTA -> modal
│       ├── Hero.jsx           # hero + agent-mesh visual, Download CTA -> modal
│       ├── Features.jsx       # 4 AI features, sticky-heading + hairline list
│       ├── PriceEstimator.jsx # interactive live price calculator demo
│       ├── LiveSandbox.jsx    # in-browser 3-agent pipeline sim + LIVE campus feed
│       ├── ArchitectureDiagram.jsx # clickable 4-layer system diagram
│       ├── AppPreview.jsx     # pure-CSS phone frame + 3 tabbed screens (feed syncs live)
│       ├── About.jsx          # "Bulletin boards, replaced." + exchange flow
│       ├── Faq.jsx            # hairline accordion
│       └── Footer.jsx         # credits + Download CTA -> modal
│
└── Aditya_Infinity_Design_Portfolio_Master_Prompt.txt   # design reference
└── INFINITY_DESIGN_Universal_Design_Philosophy.txt      # design reference
└── PROJECT_CONTEXT.md         # this file — keep in sync with the build
```

### Separation rule
**Content/data lives in `src/data/`; components only present it.** Landing copy
in `features.js`, sandbox + architecture data in `sandbox.js`. Keep it that way
— do not hard-code copy inside section components when it can live in a data
file. (Small local-only UI state, like the architecture diagram's coordinate
slots, is fine inside the component.)

---

## 5. Section order & wiring

`src/App.jsx` renders, in order:

```
<Navigation onDownload={openWaitlist} />
<main id="main">
  <Hero onDownload={openWaitlist} />
  <Features />
  <PriceEstimator />
  <LiveSandbox />
  <ArchitectureDiagram />
  <AppPreview />
  <About />
  <Faq />
</main>
<Footer onDownload={openWaitlist} />
<WaitlistModal open={waitlistOpen} onClose={closeWaitlist} />
```

Section anchor IDs (used by nav + scroll-padding):
`#top`, `#features`, `#estimator`, `#demo` (Live Sandbox),
`#architecture`, `#preview`, `#project` (About), `#faq`, `#download` (Footer),
`#main` (skip link target).

`html` has `scroll-padding-top: 5.5rem` so anchored sections clear the fixed
64px nav.

---

## 6. Component notes (the important behaviors)

### Navigation.jsx
- Fixed header, transparent at top, gains `bg-void/85 backdrop-blur-md` +
  hairline border once `window.scrollY > 12` (or when mobile menu open).
- Desktop links are **tiered by breakpoint** — 6 links crowd a laptop bar, so:
  - `lg`–`xl`: compact set via `COMPACT_LINKS` — `#demo`, `#architecture`,
    `#faq` (`hidden ... lg:flex xl:hidden`).
  - `xl` and up: full set via `FULL_LINKS` — `#features`, `#estimator`,
    `#demo`, `#architecture`, `#preview`, `#faq`.
  - Download App button sits outside the link `nav`s (the header row is
    `justify-between`), with `lg:ml-6` for breathing room.
  - Below `lg`, a hamburger toggles the mobile menu, which lists all
    `NAV_LINKS`.
- `NAV_LINKS` includes a `Download` entry flagged `action: "waitlist"` —
  rendered as a `<button>` that opens the modal.
- The mobile menu's focus target is a `closeRef` (the big Download button).
  Escape closes the menu.
- Wordmark: "CAMPUSMART" + superscript cyan "AI".

### Hero.jsx
- Two-column on `lg` (headline/CTA left, "Agent Mesh" diagram right,
  diagram `hidden lg:block` and `aria-hidden`).
- Staggered entry via `.hero-in` + inline `animationDelay`.
- Background: controlled radial cyan glow + a faint 88px grid, both masked
  and `pointer-events-none` (depth, not decoration).
- Agent Mesh diagram visually narrates:
  4 agents (Listing/Vision, Pricing/Market, Trust/Security,
  Recommendation/Discovery) → **CampusMart Core** → **Verified Exchange**.
- Primary CTA is a `<button onClick={onDownload}>` (opens waitlist modal).

### Features.jsx
- Sticky left column (`lg:sticky lg:top-28`) with eyebrow + heading;
  right column is a hairline-separated `<ul>` of the 4 features.
- Each row: number `01–04`, icon, title, summary (cyan), body, and a
  "Connects to —" line. Hover: cyan vertical hairline grows in +
  `group-hover:pl-6` shift + icon turns cyan. This is intentional — it is
  NOT a generic card grid.
- Content comes from `features` array in `data/features.js`.

### PriceEstimator.jsx
- Interactive demo. Category pills (Engineering Textbooks / Scientific
  Calculators / Drafter & Lab Kits / Electronics), a price range slider, and
  a 3-way Condition selector (Like New / Good / Fair).
- Live output panel (`aria-live="polite"`): **AI Suggested Resale Price**,
  a dynamic **discount %** tag, **Estimated Selling Speed**, condition
  factor, and category.
- Math (illustrative model, NOT a real API):
  - `suggested = round(maxPrice × condition.multiplier)`
  - `discount  = round((1 − condition.multiplier) × 100)`
  - Multipliers: Like New `0.7`, Good `0.55`, Fair `0.38`
  - Speeds: "Under 24 hours" / "1 – 2 days" / "3 – 5 days"
- Categories carry a `max` price; switching category resets the slider to
  `60%` of the new max.
- Prices are formatted `₹` with `toLocaleString("en-IN")`.
- UI states clearly that this is an illustrative model — **when a real
  pricing endpoint exists, replace the math + `conditionTiers` data.**
- Uses the custom `.range-track` input styling.
- Section background `bg-surface/40` (deliberate: it sits between two
  `void`/`abyss` sections and needed its own tone).

### LiveSandbox.jsx (`#demo`) + hooks/usePipeline.js
In-browser simulation of the 3-agent listing pipeline. Section background
`bg-abyss`. The pipeline demo itself runs locally — no image or text leaves
the page — but the **Campus Feed below it now syncs with the live FastAPI +
PostgreSQL backend** (`useLiveFeed`):

- **Dropzone**: drag-and-drop + click-to-browse + keyboard operable
  (`role="button"`, Enter/Space). Shows an instant thumbnail via
  `URL.createObjectURL`, with a hover "Remove" overlay. Auto-derives a title
  from the filename when the title field is empty. Rejects non-image files
  with an inline `role="alert"` message. Revokes object URLs on change/unmount.
- **Inputs**: Item Title (min 2 chars to enable Run), Age in years (0–15),
  3-way Condition selector (Like New / Good / Fair).
- **Run AI Pipeline** → `usePipeline()` advances `step` 1→2→3→4 with
  `STEP_DURATION = 900ms` + `STEP_GAP = 260ms`, then fires the completion
  callback. Returns `{ step, running, done, run, reset }`; clears timers on
  unmount and on re-run.
- **Agent stepper** (vertical, icon + label + tech + detail):
  1. *Listing Intelligence / YOLO* → `classifyItem()` regex classifies into
     **Academic Material / Lab Equipment / Electronics**.
  2. *Price Prediction / Scikit-learn* → `priceFor()` =
     `round(base[category] × conditionMultiplier × ageFactor)` where
     `ageFactor = max(0.55, 1 − age × 0.08)`; confidence =
     `0.82 + mult×0.18 − age×0.01`, capped at 0.97.
  3. *Trust & Fraud / Regex·NLP* → `scanProhibited()` scans the title against
     `prohibitedTerms` and assigns **CLEARED** or **FLAGGED**.
  Each running step shows a `.pipeline-fill` progress bar; done steps show a
  check and their result string.
- **Campus Feed**: on completion a card is **prepended** with `.card-arrive`;
  it shows thumbnail (or a 4-letter seed tag), title, category · condition ·
  age, AI price (`₹`, `toLocaleString("en-IN")`), clearance badge, verified
  status, confidence %, and — when flagged — the matched terms plus a
  "held for manual trust review" note.
- Seeded with 3 listings (`seedFeedItems`) so the feed is never empty offline;
  one is deliberately FLAGGED. A tip invites trying "cash only" or "scam".
- `aria-live="polite"` region announces completion. Reset clears form + preview.
- **Live sync**: on mount `useLiveFeed()` runs `checkApiHealth()` (GET `/`) then
  `fetchLiveProducts()` (GET `/products/`) against `VITE_API_BASE_URL`. Live
  products are mapped via `mapProductToFeedItem` (source `live`, cyan LIVE chip,
  image from `image_url`, price from `suggested_price ?? listed_price`, trust
  from `seller_trust_score / 100`) and **prepended above** sandbox-published
  items. Seeds show only when the API is offline/empty. A **Refresh** button in
  the `ApiStatusBadge` re-fetches on demand. Both sections share one in-flight
  promise + cache (module-level in `useLiveFeed.js`), so only one network round
  trip happens per sync.

### ArchitectureDiagram.jsx (`#architecture`)
Clickable 4-layer system diagram, section background `bg-void`.

- **Layout**: fixed SVG viewBox `1000×560`, node slots in a local `SLOTS`
  map (`x`, `y`, `w`; height 62). Columns left→right: Frontend (Flutter,
  React Admin) → Backend (FastAPI, Firebase Auth) → AI Orchestration
  (LangGraph center, with YOLO / Scikit-learn / Regex·NLP above & below) →
  PostgreSQL 15. Layer labels are positioned along the top.
- **Edges**: built once from `architectureConnections` (deduped, symmetric
  graph in `sandbox.js`) via `edgePath()`. Horizontal pairs use a cubic
  bezier; same-column pairs (LangGraph ↔ agents) use a straight vertical line.
- **Interaction**: clicking a node selects it (click again to clear). Outgoing
  edges go **solid cyan** (`stroke-width` 2), incoming **soft cyan**, others
  stay dim; connected nodes brighten, unrelated nodes dim via `arch-node`.
  A side panel shows the selected node's layer, blurb, and connected names.
  Suggested demo: select **LangGraph** to light all three agent pipelines +
  the database write path.
- Nodes are real `<button>`s with `aria-pressed`.
- **Below `md`** the SVG is replaced by a stacked per-layer list (the fixed
  viewBox doesn't reflow on phones) with the same selection behavior and a
  `.detect-in` detail card. Legend explains inactive / related / selected.

### AppPreview.jsx
- Pure CSS/Tailwind smartphone mockup: outer bezel, notch, fake status bar
  ("9:41" + dots), header with VERIFIED badge, fixed `h-[440px]` screen,
  home indicator.
- 3 tabs (`role="tablist"`, full ARIA + arrow-key navigation):
  1. **Smart Feed** — listing rows with title, price, category tag, and a
     cyan trust-score bar + `BadgeCheck`. Uses **live backend products when
     online** (top 4, mapped to phone shape via `mapProductToPhoneItem`),
     falling back to static `feedListings` offline.
  2. **AI Listing Camera** — viewfinder grid, silhouette, YOLO-style
     bounding box with corner brackets, confidence label
     ("DRAFTER KIT · 0.94"), animated `.scan-sweep` line, and an
     auto-filled "Draft Listing" card.
  3. **Verified Student Chat** — verified-peer messages, a safe-campus
     pickup line ("Library Atrium — Safe Zone 2"), and a message composer.
- Left column has explanatory copy + a hairline list describing each screen.
- `VIEWS` map ties tab id → `{ title, Component }`.

### About.jsx
- "Bulletin boards, replaced." — explains replacing cork boards / group
  chats with a secure automated architecture.
- Contains the **Exchange Flow** strip: Capture → List → Price → Verify →
  Exchange (grid of 5, vertical on mobile, vertical-divided on `md`+).

### Faq.jsx
- Hairline accordion. Single-open behavior (`openId` state, clicking the open
  item closes it; first item open by default).
- Expand/collapse via animated `grid-template-rows: 1fr / 0fr` +
  opacity on the inner paragraph (respects reduced motion).
- Plus icon rotates 45° into an × when open.
- Full ARIA: `aria-expanded`, `aria-controls`, `aria-labelledby`,
  `role="region"`.
- 5 FAQs in `data/features.js` `faqs` array covering: scam/non-student
  prevention, safe meetup zones, zero commissions, price calculation, and
  no-typing listings.

### Footer.jsx
- Big "Get the App" CTA block (`id="download"`) with a Download button that
  opens the waitlist modal.
- Credits row (REQUIRED copy, do not alter):
  **`Engineered by Aditya Jadhav | Infinity Crew`** rendered with
  "Aditya Jadhav" in `ink` and "Infinity Crew" in cyan, separated by a `|`.
- Copyright: `© 2026 CampusMart AI`.

### Reveal.jsx
- Reusable scroll-reveal wrapper. Renders any element (`as` prop, default
  `div`), adds `.reveal`, uses a single `IntersectionObserver`
  (threshold `0.12`, `rootMargin "0px 0px -6% 0px"`) to set
  `data-visible="true"`, then disconnects. `delay` prop sets
  `transitionDelay` for stagger. Fully disabled under reduced motion.

---

## 7. WaitlistModal.jsx → "Get CampusMart AI" modal

Opened by every "Download App" CTA (Hero, desktop nav, mobile nav, Footer).
State lives in `App.jsx` (`waitlistOpen`), passed as
`open` / `onClose` props. Now a **dual-tab** dialog.

### Tab 1 — Android APK (default)
- Primary `<a download>` CTA: **"Download Android APK (v1.0.0 Release)"** →
  `import.meta.env.VITE_APK_DOWNLOAD_URL || "/campusmart-ai.apk"`.
- **Inline pure-SVG QR code** (`src/lib/qrcode.js` + `components/QrCode.jsx`,
  no dependencies) encoding the resolved **absolute** APK URL (origin + path
  when site-root-relative). Light background, void modules — scannable with
  any phone camera. Generator: byte mode, EC level M, versions 1–10, full
  mask-penalty selection; verified by round-trip decode + RS checks.
- 3-step install strip (01 Download → 02 Allow browser install permission →
  03 Sign in with campus email) as a hairline `<ol>`.
- Metadata badges: **Flutter 3.x**, **Android 5.0+ (API 21+)**,
  **Verified by Infinity Crew** (the last with a cyan `ShieldCheck`).
- On open, focus lands on the download link.

### Tab 2 — iOS & Campus Rollout Waitlist
- The original student waitlist form (unchanged validation, email
  classification, success state with queue number + Copy Invite Link).

### Shared modal behavior (both tabs)
- **Accessibility**: `role="dialog"`, `aria-modal`, `aria-labelledby`,
  tablist/tab/tabpanel ARIA with arrow-key navigation, focus trap, Escape,
  backdrop click, body scroll lock, focus restore to trigger on close.
- Transient state (tab, values, errors, submitted, copied) resets on reopen.
- Waitlist copy still states it is **simulated** — no backend for it yet.

### To make the waitlist real later
Replace the `handleSubmit` body with an API POST and set `queueNumber` from
the server response. Everything else (UI/a11y) can stay. APK hosting: drop
the signed build at `public/campusmart-ai.apk` (or point
`VITE_APK_DOWNLOAD_URL` at a CDN).

---

## 7b. Live API client (`src/api/client.js`) + `hooks/useLiveFeed.js`

- Base URL: `import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"`.
  In **production without the env var**, network calls are skipped entirely
  (`NETWORK_ENABLED` = explicit URL or `import.meta.env.DEV`) so the site
  shows Offline Demo Mode without failed localhost requests.
- `checkApiHealth()` → GET `/`, returns boolean. `fetchLiveProducts()` →
  GET `/products/`, accepts a bare array or `{products|items|results: []}`,
  maps each row to
  `{ id, title, description, category, condition, image_url, listed_price,
  suggested_price, seller_trust_score, created_at }`.
  8s `AbortSignal.timeout` guard.
- `useLiveFeed()` hook: health → products, module-level in-flight dedupe +
  last-good cache (shared by LiveSandbox + AppPreview), exposes
  `{ products, feedItems, online, loading, refresh, apiUrl }`.
- `ApiStatusBadge`: cyan ● "Connected to Live FastAPI Server" (with
  `.agent-dot` pulse) or faint ○ "Offline Demo Mode", plus Refresh button.
- **Backend requirement**: FastAPI must allow the site origin via CORS.

---

## 8. Deployment

- **Vercel**, config in `vercel.json`:
  - `cleanUrls: true`, `trailingSlash: false`
  - SPA rewrite: `/(.*) → /index.html`
  - `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`
    (safe because Vite hashes asset filenames)
  - Security headers on all routes: `X-Content-Type-Options: nosniff`,
    `X-Frame-Options: DENY`,
    `Referrer-Policy: strict-origin-when-cross-origin`
- Vercel auto-detects Vite: build `npm run build`, output `dist`.

### Environment variables (see `.env.example`)
| Var | Purpose | Local default | Production |
|-----|---------|---------------|------------|
| `VITE_API_BASE_URL` | FastAPI base URL (no trailing slash) | `http://127.0.0.1:8000` (DEV only) | `https://campusmart-api.onrender.com` — set in Vercel |
| `VITE_APK_DOWNLOAD_URL` | APK download target for the modal + QR | `/campusmart-ai.apk` | same, or absolute CDN URL |

Unset `VITE_API_BASE_URL` in production → Offline Demo Mode (seed listings,
no network attempts). `.env` / `.env.*` are gitignored; `.env.example` is
tracked. Drop the signed APK at `public/campusmart-ai.apk` so the default
site-root URL resolves.

### Meta / SEO (in `index.html`)
- `<title>CampusMart AI — Secure Student Marketplace</title>`
- description, `<link rel="canonical" href="https://campusmart.ai/">`
- OpenGraph (`og:type/site_name/url/title/description/image`,
  image 1200×630) and Twitter (`summary_large_image` + image + alt).
- `viewport` with `viewport-fit=cover`, `theme-color` `#0a0a0f`,
  `color-scheme: dark`.
- Favicon is an inline SVG data-URI (dark rounded square + cyan chevron).

**KNOWN TODO:** OG image URLs point at
`https://campusmart.ai/og-cover.png` which **does not exist yet**. Either add
a 1200×630 `og-cover.png` to `public/` and adjust the URLs, or update the
tag to a real hosted image before going live for link previews.

---

## 9. Git / hosting

- **Repo:** https://github.com/AdityaJadhav9881/campus-mart.git (`origin`)
- **Branch:** `main` (tracks `origin/main`)
- **History:**
  - `0d60b9b` — initial landing site (hero, features, estimator, app
    preview, FAQ, waitlist modal) + Vercel config. 22 files.
  - `489c8d8` — added LiveSandbox + ArchitectureDiagram, `data/sandbox.js`,
    `hooks/usePipeline.js`, nav tiering, and this context file.
  - `41a79c0` — docs: sync PROJECT_CONTEXT with sandbox + architecture
    explorer.
  - `7e23f77` — **production-integration pass** (current): `src/api/client.js`,
    `src/hooks/useLiveFeed.js`, `src/lib/qrcode.js`, `ApiStatusBadge.jsx`,
    `QrCode.jsx`, dual-tab `WaitlistModal.jsx`, live feed sync in
    LiveSandbox + AppPreview, `.env.example`, `.gitignore` (now ignores
    `.env` / `.env.*` but tracks `.env.example`). 11 files, +1125/−92.
    **Pushed to `origin/main`.**
- PowerShell prints a spurious `NativeCommandError` on `git push` because git
  writes progress to stderr — check the final `main -> main` line to confirm
  success.
- Line endings: Windows/CRLF warnings from git are expected and harmless.
- `.gitignore` excludes `node_modules`, `dist`, `*.local`, `.env` /
  `.env.*` (except `.env.example`), `.DS_Store`, editor dirs, and npm/yarn
  debug logs.

---

## 10. Constraints & conventions to keep

1. **Frontend only** — do not add a backend, DB, or auth *to this repo*.
   Consuming the existing FastAPI backend read-only (`src/api/client.js`) is
   allowed; adding new server code here is not.
2. **Infinity Design language** — void/abyss foundation, hairline borders,
   single cyan accent, precise spacing, restrained motion, generous negative
   space. No generic card grids, no gratuitous glow/neon.
3. **Data out of components** — keep copy/config in `src/data/`
   (`features.js` for landing content, `sandbox.js` for sandbox + architecture
   data).
4. **Accessibility is mandatory** — ARIA on interactive widgets, visible
   focus (`:focus-visible` outline is global), keyboard operability,
   `prefers-reduced-motion` support.
5. **Tailwind v4** — tokens go in the `@theme` block in `src/index.css`,
   never a JS config file.
6. **Verify with `npm run build`** after every meaningful change.
7. **Do not touch** the required credit line in the Footer:
   "Engineered by Aditya Jadhav | Infinity Crew".
8. Placeholder/illustrative content (prices, queue number, invite link, OG
   image) is intentional and labeled as such — swap for real values only
   when the backend/assets exist.

---

## 11. Known TODOs / next steps

- [ ] Add a real 1200×630 OG image (`og-cover.png`) or fix OG image URLs.
- [x] APK download hub: dual-tab modal with direct APK link, generated QR
      code, install steps — needs `public/campusmart-ai.apk` dropped in and
      `VITE_APK_DOWNLOAD_URL` + `VITE_API_BASE_URL` set in Vercel.
- [x] Live backend sync: `src/api/client.js` + `useLiveFeed` wired into
      LiveSandbox + AppPreview (needs CORS + deployed FastAPI with
      `GET /` and `GET /products/`).
- [ ] Wire the waitlist form to a real endpoint; return a real queue number.
- [ ] Replace the estimator's illustrative multipliers with real pricing
      data/service.
- [ ] Replace the sandbox's local classifier/pricer/fraud-scan with real agent
      endpoints (keep `usePipeline` for step timing).
- [ ] Update the invite link (`https://campusmart.ai/invite/campus`) to a
      real referral URL.
- [ ] Optional: add ESLint + a test setup (none configured today; QR lib was
      verified via one-off Node round-trip scripts).
- [ ] Optional: a real multi-page architecture if the product grows beyond a
      single landing page.

**Maintenance rule:** this file is committed alongside the code. After any
structural change (new section, new file, nav/anchor change, new data file,
or a new commit), update the matching section here and bump the closing note
below — it is the project's source of truth for future sessions.

---

*Last updated: after commit `7e23f77` ("Add live FastAPI feed sync and APK
download modal with QR code"), pushed to `origin/main`. Covers the
production-integration pass — `src/api/client.js` (FastAPI health +
`/products/` client), `src/hooks/useLiveFeed.js` (shared live-feed sync with
cache/dedupe), `src/components/ApiStatusBadge.jsx`, `src/lib/qrcode.js` +
`src/components/QrCode.jsx` (dependency-free SVG QR, versions 1–10, verified
by round-trip decode + RS checks), dual-tab "Get CampusMart AI" modal
(default Android APK tab with download CTA, generated QR, 3-step install
strip, metadata badges; iOS/campus waitlist as tab 2), live campus-feed sync
in `LiveSandbox.jsx` + `AppPreview.jsx` with connection badge + Refresh,
`.env.example` documenting `VITE_API_BASE_URL` / `VITE_APK_DOWNLOAD_URL`, and
`.gitignore` env handling. Build verified clean (`npm run build`), 311 kB JS
/ 93.9 kB gzip.*
