# PROJECT CONTEXT — CampusMart AI Official Promotional & Storefront Web App

> **Purpose of this file:** Persistent, self-contained architectural and operational reference.
> Any fresh session or agent can understand the entire system, contracts, routes, and design
> standards without re-auditing the source code. Update this document whenever structural changes land.

---

## 1. What This Project Is

A **flagship consumer web application and promotional storefront** for **CampusMart AI** — a verified, AI-powered marketplace engineered for college and university students to safely buy, sell, and exchange textbooks, electronics, lab equipment, and hostel essentials.

- **Primary Goal:** Provide a commercial-grade, consumer-friendly web experience (meeting Stripe / Airbnb / Gumroad product design standards) that drives student sign-ups, allows instant Android APK downloads, showcases verified campus inventory with rich 4-photo inspection galleries, and provides interactive AI price valuation and chat.
- **Companion to Mobile App:** The native product is a **Flutter Android/iOS app** where students shoot 4-angle photos, negotiate, and chat in campus safe zones. This web application serves as the public storefront, web price estimator, and verified student onboarding/download portal.
- **Audience:** Everyday college and university students. The application maintains **100% consumer-facing language**:
  - Zero technical jargon (no mention of endpoints, databases, evaluators, or dev tooling).
  - All developer credits and evaluator bypasses removed.
  - Official brand copyright: `© 2026 CampusMart AI · Verified Student Marketplace`.
  - Official campus support: `martaicampus@gmail.com` with pre-composed mailto links.

---

## 2. Tech Stack & Environment

| Layer | Technology | Details |
|---|---|---|
| **Build Tool** | Vite `^8.3.4` | Lightning-fast ESM dev server and optimized rollup production bundles |
| **Framework** | React `^19.3.1` | Function components, React hooks (`useState`, `useMemo`, `useCallback`, `useRef`, `useEffect`) |
| **Styling** | Tailwind CSS `^4.3.3` | Tailwind v4 CSS-first `@theme` configuration in `src/index.css` via `@tailwindcss/vite` |
| **Icons** | Lucide React `^1.57.0` | Crisp feather-style SVG iconography |
| **Typography** | Newsreader + Inter | Newsreader serif for display headlines; Inter for readable UI body text |
| **Routing** | Custom Client Router | Dependency-free browser History API router in `src/router/router.jsx` |
| **Deployment** | Vercel | Production SPA configuration via `vercel.json` |
| **Live Backend** | FastAPI + PostgreSQL | Hosted on Render (`https://campusmart-api-zia4.onrender.com`) |

### Development Commands
```bash
npm run dev      # Launch local development server (http://localhost:5173)
npm run build    # Production build -> dist/ (always test before pushing)
npm run preview  # Locally preview the built production bundle
```

---

## 3. Design System — "Daylight Editorial" (Warm Paper & Deep Ink)

The site uses a warm, editorial design language optimized for readability, calm confidence, and accessibility:

### Color Palette (defined in `src/index.css` `@theme`)

| Token | Hex Value | Semantic Usage |
|---|---|---|
| `--color-paper` | `#FAF9F6` | Primary page canvas (warm daylight background) |
| `--color-sunken` | `#F1EFE9` | Sunken containers, well panels, secondary buttons |
| `--color-card` | `#FFFFFF` | Elevated surfaces, cards, interactive modals |
| `--color-ink` | `#1C1917` / `#141413` | Primary text, titles, deep ink primary CTA buttons |
| `--color-ink-soft` | `#3F3B37` | Secondary text, subheadings, labels |
| `--color-muted` | `#625D57` | Descriptive body copy, timestamp notes |
| `--color-faint` | `#9C968E` | Captions, subtle metadata, inactive icons |
| `--color-line` | `#E6E3DC` | Standard 1px architectural borders and dividers |
| `--color-line-strong`| `#D2CEC5` | Hovered borders, active input outlines |
| `--color-accent` | `#1D4ED8` / `#2563EB` | Campus blue accent for interactive links, badges, focus rings |
| `--color-accent-soft`| `#EEF2FF` | Light blue badge backgrounds |
| `--color-positive` | `#15803D` | Verified checkmarks, price savings, trust scores |
| `--color-positive-soft`| `#E9F6EE` | Light green badge containers |
| `--color-warn` | `#B45309` | Warning notices, simulated carrier OTP banner |
| `--color-warn-soft`| `#FDF4E7` | Amber notice backgrounds |

### Brand Mark & Favicon
- **Brand Squircle:** A modern squircle (`rx="9"`) filled with Deep Ink (`#141413`) featuring a Warm Paper (`#FAF9F6`) geometric marketplace glyph and an accent blue spark dot (`#2563EB`).
- **Favicon:** Inline data URI SVG matching the brand mark configured in `index.html`.

---

## 4. Multi-Page Architecture & Route Map

The application is structured into 5 primary student-facing routes managed by `src/router/router.jsx`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CampusMart AI Web App                           │
├───────────────┬───────────────────┬──────────────┬──────────┬──────────┤
│       /       │   /marketplace    │ /how-it-works│ /sandbox │/download │
│   Home Page   │ Live Storefront   │ Verification │Price Est.│ APK Hub  │
└───────────────┴───────────────────┴──────────────┴──────────┴──────────┘
```

### Route 1: Home (`/` — `src/pages/Home.jsx`)
- **Headline:** *"Buy and sell with people on your own campus."*
- **Key Value Promises:** Verified campus email, Fair ₹ pricing from AI, 0% seller commission.
- **Live Campus Counters:** Probes `fetchStats()` (`active listings` and `verified students`) updated in real time.
- **Fresh on Campus Feed:** Preview rows showing real student listings; clicking any item opens the full `ProductDetailModal`.
- **Wanted on Campus Preview Strip:** Showcases urgent student requests with instant cash opportunities for seniors and quick link to `/marketplace?tab=wanted`.
- **Deep-Link Auto-Opening:** Supports `?item=<id-or-slug>` directly opening matching product modal.
- **Primary CTAs:** Direct links to `/marketplace` and `/download`.

### Route 2: Marketplace (`/marketplace` — `src/pages/Marketplace.jsx`)
- **Headline:** *"What students are trading right now"*
- **Two Primary Tabs:**
  1. `🛒 Browse Listings` — full catalog of active pre-owned student listings.
  2. `📢 Want to Buy Board` — live interactive board where students post urgent items needed.
- **WhatsApp Viral Loop & Deep-Link Opening:** Reads `?item=<id-or-slug>` on mount to automatically open the matching product detail modal. Reads `?tab=wanted` or `?wanted=` to auto-activate the Wanted board.
- **Academic Department / Branch Filters:** Single-click pills (`All Branches`, `First Year (Common)`, `Computer / IT`, `Mechanical`, `Civil`, `Electrical / ENTC`, `Pharmacy`) powered by `inferAcademicMeta(product)` client-side classification.
- **Academic Year Filters:** Single-click pills (`All Years`, `FE (1st Year)`, `SE (2nd Year)`, `TE (3rd Year)`, `BE (Final Year)`).
- **Smart Semantic Search:** Searches across `title`, `description`, `category`, `college_name`, department, year, and visual AI inspection tags (`ai_tags`).
- **Category Filter Pills:** Dynamic pills (`All`, `Academic Material`, `Electronics`, `Lab Equipment`, etc.).
- **Campus / College Filter:** Filter by Maharashtra / Indian campus.
- **5-Way Sort Dropdown:**
  1. `Featured` (default catalog order)
  2. `Price: Low to High`
  3. `Price: High to Low`
  4. `Best Value vs AI Estimate` (ranked by highest % savings vs AI fair valuation)
  5. `Highest Seller Trust` (ranked by 5-star seller score)
- **Live Status Badge:** Displays server connectivity (`● Connected to Live Server` or `○ Popular right now`) with an on-demand refresh button.
- **Modal Integration:** Clicking any product card triggers `ProductDetailModal`.

### Route 3: How Verification Works (`/how-it-works` — `src/pages/HowItWorks.jsx`)
- **Headline:** *"Four photos are all it takes to list something honestly."*
- **The 4-Angle Photo Inspection:** Interactive visual breakdown of `Front` (item identity), `Back` (serials/edition), `Edges & ports` (corner wear), and `Wear and tear` (honest grading).
- **Inspection Read-Back Card:** Demonstrates AI condition grading, suggested ₹ resale, pre-written listing text, and seller trust score.
- **Campus Support Note:** Pre-composed mailto link to `martaicampus@gmail.com`.

### Route 4: Price Estimator (`/sandbox` — `src/pages/Sandbox.jsx`)
- **Headline:** *"Check what your item is worth"*
- **Local Estimator Simulation:** Instant in-browser 3-agent pipeline simulation (`Photo & Category Check`, `Campus Market Value`, `Safety Check`) with photo dropzone, age slider, and condition selector.
- **Interactive "Ask CampusMart AI" Assistant:**
  - Real-time catalog-aware assistant wired to `POST /ai/chat` on the live Render FastAPI backend.
  - Auto-acquires a guest session token for unauthenticated visitors so questions never return 401.
  - Interactive sample question chips (*"What is a fair second-hand price for a Bose SoundLink Flex speaker?"*, *"Show me the best deals under ₹500"*, *"What should I pay for a Casio scientific calculator?"*).
  - Multi-turn conversation display with live LLM vs catalog benchmark source badges.
  - Deep-link support: Automatically pre-fills item name and inquiry when navigating from `ProductDetailModal` (`?item=...&query=...`).

### Route 5: Android App & Student Auth (`/download` — `src/pages/Download.jsx`)
- **Headline:** *"Get CampusMart AI on your phone."*
- **Locked State (Guest):** Displays `AuthCard.jsx` to sign in or create an account with campus email.
- **Searchable CET Directory College Selector:** Fast 3-tier searchable college picker with instant local search across 120+ Maharashtra CET Cell & non-CET institutions + live search fallback.
- **Instant Fallback Verification:** Automatic detection of `fallback_otp_code` when carrier emails are delayed, providing an interactive one-click auto-fill amber banner.
- **Unlocked State (Signed In):**
  - Displays verified student badge (`✓ <Name> · ★ 5.0 / 5 Verified Student`).
  - Direct download button for `campusmart-ai.apk`.
  - Dynamic APK file size probe (`useApkSize`).
  - Pure SVG QR Code (`QrCode.jsx`) encoding the absolute download URL for instant camera scanning.
  - 3-step installation guide and Android Chrome tip.
  - Support note with pre-composed mailto link.

---

## 5. Key Interactive Components

### `ProductDetailModal.jsx` (Airbnb-Style Detail Modal)
- **4-Photo Interactive Gallery:** Large primary image display with next/prev controls, counter pill (`1 / 4`), and a 4-thumbnail clickable strip mapping over `product.image_urls` (falling back to `[product.image_url]`).
- **Academic & College Badges:** Displays `academic.badge` (e.g. `FE · First Year Common`, `SE · Computer/IT`) and verified college affiliation.
- **AI Inspection Summary:** Surfaces `ai_condition_notes` with positive badge check.
- **Visual Search Tags:** Renders hashtag pills from `product.ai_tags`.
- **Fair Price Comparison:** Renders listed ₹ price alongside AI suggested fair value and green discount savings badge (e.g., `24% below AI estimate`).
- **Seller Trust Card:** Renders seller name, verified email indicator, star ratings, and score formatted as `★ 4.9 / 5`.
- **Viral WhatsApp Share & Copy Link:**
  - One-click `"Share to Hostel / Batch WhatsApp"` button with formatted title, price, suggested fair value, college, dept, and deep link.
  - `"Copy Link"` button with instant visual toast feedback (`"Link Copied!"`).
- **Dual Action CTAs:**
  - `"Get the App to Chat with Seller"` (routes to `/download`).
  - `"Ask CampusMart AI About This Item"` (routes to `/sandbox` with pre-filled item context).

### `WantedBoard.jsx` ("Want to Buy" Campus Request Board)
- **Live Urgent Campus Requests:** Displays student requests fetched via `GET /wanted/` merged with pre-seeded Maharashtra requests (`src/data/wantedSeed.js`) and local persistence (`campusmart.wanted_posts.v1`).
- **Urgency Badges:** Color-coded urgency pills (`🔥 Urgent for tomorrow's exam`, `🔥 Urgent for Monday submission`, `⚡ Needed this week`, etc.).
- **AI Instant Match Indicator:** Checks active catalog listings against wanted items; if an item matches within budget, displays an interactive `"✨ 1 Matching Listing Found — View Deal"` button that opens `ProductDetailModal`.
- **Quick Cash Actions:**
  - `"I Have This · Sell & Earn ₹"` modal with app handoff and campus match email composition.
  - `"Ask in WhatsApp Group"` button with pre-formatted broadcast message.
- **"+ Post a Wanted Item" Modal with AI Auto-Fill:**
  - Natural language input (*"Need Casio fx-991CW under ₹700 urgent for tomorrow exam"*).
  - `"✨ Auto-Fill"` button invoking `aiDraftWantedRequest()` (with instant local NLP regex parsing fallback) to auto-extract Title, Budget, Urgency, Branch, and Academic Year.
  - Instant optimistic posting to the board and background synchronization.
  1. `Get the App to Chat with Seller` (routes to `/download`)
  2. `Ask CampusMart AI About This Item` (routes to `/sandbox?item=...`)
- **Accessibility:** Trap focus, body scroll lock, Escape key dismiss, backdrop blur click dismiss.

### `AuthCard.jsx` (Student Sign In & OTP Verification)
- **Dual Tab Mode:** `Sign in` (email + password) and `Sign up` (name + email + password minLength 8).
- **OTP Verification Step:** When sign-up succeeds, switches to 6-digit OTP code entry.
- **Instant Verification Code Banner:**
  - Detects `fallback_otp_code` returned by `POST /auth/send-otp` or `POST /auth/resend-otp` when carrier email delivery is delayed.
  - Displays an interactive amber banner:
    > **Instant Verification Code: `<fallback_otp_code>` (Click to auto-fill)**
  - Clicking automatically populates the code and triggers verification so no student ever gets stranded.
- **Session Handshake:** Calls `useAuth.verifyOtp()`, stores `{ token, user }` in `localStorage`, and triggers custom `campusmart:auth-changed` event to unlock the download page instantly.

### `ApiStatusBadge.jsx` & `WarmupBanner.jsx`
- Handles Render free-tier cold starts gracefully.
- Displays polite countdown / waking banner if API response takes > 2.5s.
- Refresh trigger with in-flight deduplication.

---

## 6. Complete Repository File Map

```
/
├── index.html                     # Entry HTML, SEO/OG meta, squircle favicon, fonts
├── package.json                   # Vite 8, React 19, Tailwind 4, Lucide React
├── vite.config.js                 # Plugins: @vitejs/plugin-react, @tailwindcss/vite
├── vercel.json                    # SPA wildcard rewrite + immutable asset caching headers
├── .env.example                   # Documents VITE_API_BASE_URL & VITE_APK_DOWNLOAD_URL
├── .gitignore                     # Ignores node_modules, dist, .env*
├── PROJECT_CONTEXT.md             # This file (source of truth)
│
├── public/
│   └── campusmart-ai.apk          # Direct Android APK download target (or CDN URL)
│
└── src/
    ├── main.jsx                   # React root entry, mounts <App />
    ├── App.jsx                    # Root layout shell, dynamic page titles, Nav, Footer, Routes
    ├── index.css                  # Tailwind v4 @theme tokens, typography, component utilities
    │
    ├── api/
    │   └── client.js              # Full backend client (products, stats, auth OTP, AI chat)
    │
    ├── router/
    │   └── router.jsx             # Lightweight zero-dep SPA router (Router, Link, NavLink, Routes)
    │
    ├── components/
    │   ├── ApiStatusBadge.jsx     # Live/Offline status indicator + refresh trigger
    │   ├── AuthCard.jsx           # Student login & OTP sign-up card with auto-fill banner
    │   ├── Footer.jsx             # Copyright, verification link, pre-composed support mailto
    │   ├── Nav.jsx                # Sticky navigation bar with squircle logo, nav links, auth status
    │   ├── ProductCard.jsx        # Storefront listing card with ₹ price, condition, 5-star trust
    │   ├── ProductDetailModal.jsx # Airbnb-style 4-photo gallery modal with dual CTAs
    │   ├── QrCode.jsx             # Pure SVG QR code renderer (no external runtime deps)
    │   └── WarmupBanner.jsx       # Render server wakeup alert for cold starts
    │
    ├── pages/
    │   ├── Home.jsx               # Landing page with live activity counters & fresh listings
    │   ├── Marketplace.jsx        # Storefront with semantic search, 5 sort modes, category filter
    │   ├── HowItWorks.jsx         # 4-angle photo verification breakdown & student benefits
    │   ├── Sandbox.jsx            # Price Estimator pipeline sim + "Ask CampusMart AI" live chat
    │   ├── Download.jsx           # Android APK download portal, verified badge, QR code, AuthCard
    │   └── NotFound.jsx           # 404 handler with return home navigation
    │
    ├── hooks/
    │   ├── useAuth.js             # Session state & localStorage persistence (campusmart.auth.v1)
    │   ├── useLiveFeed.js         # Shared product fetcher with module-level in-flight cache
    │   ├── usePipeline.js         # 3-step listing pipeline animation timer for Sandbox
    │   ├── useStats.js            # Probes active listings & verified student counts
    │   └── useWarmup.js           # Measures cold start duration for polite UX messaging
    │
    ├── lib/
    │   ├── format.js              # rupees(₹), trustOutOf5(★ x/5), relativeTime(), conditionLabel()
    │   ├── listingEngine.js       # Local rule-based classifier, pricing math, safety word check
    │   └── qrcode.js              # Dependency-free QR code matrix generator (versions 1-10, EC-M)
    │
    └── data/
        ├── site.js                # App specs, photo angles, verification steps, support mailto
        ├── sandbox.js             # Sandbox condition tiers, prohibited words, fallback seed data
        └── demoListings.js        # Fallback catalog seed data for offline resilience
```

---

## 7. Backend API Contracts & Integration

All requests are dispatched through `src/api/client.js` with exponential backoff retry and timeout guards (`REQUEST_TIMEOUT_MS = 75000` for Render spin-ups).

| Route | Method | Payload / Headers | Response & Purpose |
|---|---|---|---|
| `/` | `GET` | None | Health check probe. Returns `200 OK` when backend is awake. |
| `/products/` | `GET` | None | Returns array of products. Normalized into `{ id, title, description, category, condition, image_url, image_urls, ai_tags, ai_condition_notes, seller_name, college_name, listed_price, suggested_price, seller_trust_score, created_at }`. |
| `/colleges` | `GET` | `?q=<query>&discover=true` | **3-Layer Hybrid College Search Engine:** Queries local 6-region directory (180+ institutes) + live backend AI + web discovery (Nominatim & Wikipedia). Returns `{ code, name, shortName, city, district, type, badge, source }`. |
| `/stats/` | `GET` | None | Returns campus metrics (`listings`, `students`). Falls back to null. |
| `/auth/send-otp` | `POST` | `{ name, email, password, college_name? }` | Sends 6-digit OTP. Returns `{ message, email, email_delivered, fallback_otp_code }`. |
| `/auth/verify-otp` | `POST` | `{ email, otp_code, college_name? }` | Verifies OTP. Returns `{ access_token, token_type, user: { id, name, email, trust_score, college_name } }`. |
| `/auth/resend-otp` | `POST` | `{ email }` | Resends OTP. Returns `{ message, fallback_otp_code }`. |
| `/auth/login` | `POST` | `{ email, password }` | Authenticates existing user. Returns `{ access_token, user }`. |
| `/ai/chat` | `POST` | `Authorization: Bearer <token>`<br>`{ message, history }` | **Catalog-Aware AI Assistant:** Queries live Gemini LLM seeded with PostgreSQL catalog. Returns `{ reply, source: "llm"|"catalog", recommended_product_ids }`. Supported for guests via transparent session token. |

### Trust Score Formula & Standard
- **Backend Scale:** Stored as `0.0` to `5.0` (e.g. `4.9`, `5.0`).
- **Display Standard:** Formatted exclusively as `★ 4.9 / 5` or `★ 5.0 / 5` via `trustOutOf5()`.
- **Rule:** Never display raw out-of-100 or broken integer calculations.

---

## 8. Deployment & Production Configuration

- **Platform:** Vercel (Production URL connected to GitHub `origin/main`).
- **Configuration (`vercel.json`):**
  - SPA Rewrites: `/(.*) -> /index.html` (allows direct navigation and refresh on `/marketplace`, `/download`, etc.).
  - Immutable asset caching for `/assets/(.*)` (`max-age=31536000, immutable`).
  - Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://campusmart-api-zia4.onrender.com` (configured in Vercel project settings).
  - `VITE_APK_DOWNLOAD_URL`: `/campusmart-ai.apk` (or CDN URL).

---

## 9. Maintenance Rules & Code Conventions

1. **Consumer Cleanliness:** Never introduce developer jargon, internal API paths in UI labels, or demo evaluator buttons into customer-facing components.
2. **Support Contact Integrity:** Always use the official pre-composed mailto template for support:
   ```
   mailto:martaicampus@gmail.com?subject=CampusMart%20AI%20Support%20Inquiry&body=Hi%20CampusMart%20Support%20Team,%0A%0AI%20need%20help%20with:
   ```
3. **Data Separation:** Copy and static models belong in `src/data/` (`site.js`, `sandbox.js`, `demoListings.js`, `colleges.js`); UI components only present and wire interactions.
4. **Build Verification:** Always execute `npm run build` after changes to verify zero compile or bundle errors before pushing.
5. **Session Handling:** User sessions are stored under the localStorage key `campusmart.auth.v1` and guest tokens under `campusmart.guest_token`.
6. **Accessibility:** Ensure all modals, accordions, and dropdowns support keyboard navigation (Enter, Space, Tab, Escape) and proper ARIA labeling.

---

*Last updated: 2026-10-17. Integrated 3-Layer Hybrid College Search Engine (comprehensive 6-region Maharashtra directory + backend AI + live web discovery via Nominatim/Wikipedia) with 220ms debounce and instant 0ms local response.*
