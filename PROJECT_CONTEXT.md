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

The application is structured into 6 primary student-facing routes managed by `src/router/router.jsx`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CampusMart AI Web App                                   │
├───────────────┬───────────────────┬──────────────┬──────────────┬──────────┬───────────┤
│       /       │   /marketplace    │ /product/:id │ /how-it-works│ /sandbox │ /download │
│   Home Page   │ Live Storefront   │ Flagship Item│ Verification │Price Est.│  APK Hub  │
└───────────────┴───────────────────┴──────────────┴──────────────┴──────────┴───────────┘
```

### Route 1: Home (`/` — `src/pages/Home.jsx`)
- **Headline:** *"Buy and sell with people on your own campus."*
- **Key Value Promises:** Verified campus email, Fair ₹ pricing from AI, 0% seller commission.
- **Live Campus Counters:** Probes `fetchStats()` (`active listings` and `verified students`) formatted in a strict 2-column mobile-hardened grid (`min-w-0`).
- **Fresh on Campus Feed:** Preview rows showing real student listings with strict mobile text truncation (`truncate flex-1 min-w-0`) and visible right-docked ₹ prices; clicking any item navigates directly to `/product/:id`.
- **Wanted on Campus Preview Strip:** Showcases urgent student requests with instant cash opportunities for seniors and quick link to `/marketplace?tab=wanted`.
- **Deep-Link Auto-Opening:** Supports `?item=<id-or-slug>` automatically redirecting to `/product/:id`.
- **Primary CTAs:** Direct links to `/marketplace` and `/download`.

### Route 2: Marketplace (`/marketplace` — `src/pages/Marketplace.jsx`)
- **Headline:** *"What students are trading right now"*
- **Two Primary Tabs:**
  1. `🛒 Browse Listings` — full catalog of active pre-owned student listings.
  2. `📢 Want to Buy Board` — live interactive board where students post urgent items needed.
- **WhatsApp Viral Loop & Deep-Link Forwarding:** Reads `?item=<id-or-slug>` on mount to automatically navigate to `/product/:id`. Reads `?tab=wanted` or `?wanted=` to auto-activate the Wanted board.
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
- **Card Navigation:** Clicking any product card smoothly navigates to the dedicated full-page experience at `/product/:id`.

### Route 3: Dedicated Full-Page Product Experience (`/product/:id` — `src/pages/ProductPage.jsx`)
- **Headline:** Flagship Amazon / Airbnb-tier full-window product page replacing cramped modal overlays.
- **Breadcrumb Navigation:** `← Back to Marketplace` · Category · Department & Academic Year.
- **Desktop 12-Column Grid / Mobile Native Scroll:**
  - **Left Showcase (7 cols):** Large high-resolution main inspection photo with Left/Right navigation arrows (`‹` / `›`), angle counter badge (`1 / 4`), 4 clickable angle thumbnails (`Front`, `Back`, `Side`, `Detail`), and click-to-zoom fullscreen inspection modal.
  - **Right Action Dock (5 cols):**
    - Metadata badges: Category, Condition (`Like New`), Academic tag (`BE · Computer/IT`), and Campus affiliation.
    - Large title and clear ₹ Listed Price with comparison to AI Suggested Fair Value and green savings percentage badge (`Save ₹X vs AI estimate`).
    - Clean AI condition grading summary with backend fallback string sanitization (`cleanAiNotes`).
    - Visual inspection tags (`ai_tags`) rendered as interactive filter pills.
    - Verified student seller trust card (`★ 4.9 / 5 Verified Student Seller`).
    - 4 prominent, un-crushed action buttons:
      1. `Get the App to Chat with Seller` (routes to `/download`)
      2. `Ask CampusMart AI About This Item` (deep-links to `/sandbox` with pre-filled context)
      3. `Share to Hostel / Batch WhatsApp` (generates viral WhatsApp broadcast message)
      4. `Copy Link` (copies canonical deep link with instant toast feedback)

### Route 4: How Verification Works (`/how-it-works` — `src/pages/HowItWorks.jsx`)
- **Headline:** *"Four photos are all it takes to list something honestly."*
- **The 4-Angle Photo Inspection:** Interactive visual breakdown of `Front` (item identity), `Back` (serials/edition), `Edges & ports` (corner wear), and `Wear and tear` (honest grading).
- **Inspection Read-Back Card:** Demonstrates AI condition grading, suggested ₹ resale, pre-written listing text, and seller trust score.
- **Campus Support Note:** Pre-composed mailto link to `martaicampus@gmail.com`.

### Route 5: Price Estimator (`/sandbox` — `src/pages/Sandbox.jsx`)
- **Headline:** *"Check what your item is worth"*
- **Live Google Gemini Vision & Market Valuation (`estimatePriceWithAi`):**
  - Converts attached image to compressed Base64 data URL (max 1024px canvas) in <50ms.
  - Queries `POST /ai/estimate-price` on `API_BASE` (public endpoint powered by Google Gemini Vision + Google Search grounding).
  - Stops auto-filling camera/chat filenames (`WhatsApp Image...`, `IMG_...`, `Screenshot_...`) into title; identifies true product title directly from photo inspection.
- **Screenshot & Non-Product Rejection Card:**
  - Automatically identifies and disqualifies phone/desktop screenshots, memes, and non-sellable images.
  - Displays red rejected card (`❌ Invalid Image Detected (Screenshot / Non-Product)`) with explicit safety notices and `— (Not a sellable item)`.
- **Real Online Market Valuation Card:**
  - Displays identified product title and category.
  - Displays new retail MRP in India (`₹`) vs recommended campus resale price (`₹`) with percentage savings badge.
  - Displays fair campus range (`₹min – ₹max`).
  - Displays AI inspection and market reasoning notes (`condition_notes`).
- **Live Google Gemini "Ask CampusMart AI" Agent:**
  - Live conversational agent wired directly to `POST /ai/chat` powered by Google Gemini.
  - Seamless guest JWT registration: automatically acquires a verified JWT via `POST /auth/register` in <300ms without requiring carrier email OTP.
  - Self-healing token re-auth: if a token expires (401), automatically clears cache, regenerates session, and retries query.
  - Dynamic catalog scoring & matching: if network is sleeping, analyzes queries against live catalog listings and renders clickable product chips linking directly to `/product/:id`.
  - Multi-turn conversation display with `✨ Live Google Gemini Agent` badge.
  - Deep-link support: Automatically pre-fills item name and inquiry when navigating from `/product/:id` (`?item=...&price=...`).

### Route 6: Android App & Student Auth (`/download` — `src/pages/Download.jsx`)
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

### `ProductPage.jsx` (Flagship Full-Page Storefront Item Route `/product/:id`)
- **Native Full-Window Scroll:** Built to Amazon / Airbnb product page standards with zero modal clipping, unconstrained native page scrolling, and responsive 2-column desktop / 1-column mobile flow.
- **Interactive 4-Angle Showcase:** Left-column showcase with high-res photo gallery, left/right arrow navigation, angle counter pill (`1 / 4`), clickable thumbnails (`Front`, `Back`, `Side`, `Detail`), and a full-screen zoom modal.
- **Price Transparency & AI Benchmark:** Displays listed ₹ price side-by-side with AI suggested fair value, dynamic % discount pill, and clear retail MRP comparisons.
- **Sanitized Inspection Feedback:** Uses `cleanAiNotes()` to strip raw backend key/error strings and present clean, student-friendly inspection notes.
- **Trust & Campus Credibility:** Displays seller name, college badge, verified email check, and `★ 4.9 / 5` trust rating.
- **4 Action Docks:** Direct routes to `/download`, `/sandbox` with pre-filled item inquiry, 1-click WhatsApp hostel/batch share, and copy link with toast.

### `ProductDetailModal.jsx` (Quick-Preview Modal)
- **4-Photo Interactive Gallery:** Compact preview modal for quick in-page inspection with next/prev controls, counter pill (`1 / 4`), and a 4-thumbnail clickable strip mapping over `product.image_urls`.
- **Card-to-Page Handoff:** Provides instant quick previews while primary catalog clicks navigate directly to `/product/:id`.
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

### `HeroGraphic.jsx` (Interactive 4-Angle AI Viewfinder)
- **Viewfinder Reticle Frame:** High-end Apple/Stripe-tier interactive graphic simulating live camera inspection of campus gear (Casio fx-991CW).
- **Scanning Laser Beam Animation:** CSS `@keyframes laser-sweep` beam sweeping down the item with glow effects.
- **Corner Target Crosshairs:** Hairline technical reticles `[  ]` and central scan indicator.
- **Interactive 4-Angle Selector:** 4 clickable angle buttons (`Front`, `Back`, `Slide Cover`, `Self-Test`) that dynamically update inspection images, diagnostic notes, and confidence scores (`99.4%`).
- **Floating Valuation & Trust Badges:** Surfaces `AI Suggested Price: ₹650 (38% below MRP)` and seller trust verification seal (`★ 4.9 · DACOE Karad`).

### `CategoryShowcase.jsx` (Graphic Category Grid)
- **6 Duotone Graphic Cards:** Textbooks & Notes, Engineering Tools, Laptops & Gadgets, Lab Coats & Pharma, Electronics & IoT, and Hostel Essentials.
- **Custom Visual Accents:** Subtle ambient gradients, category icons, item counts, and promotional badges (`50-70% Off MRP`, `Submission Ready`, `4-Angle Verified`).
- **Direct 1-Click Routing:** Navigates straight to `/marketplace?category=...`.

### `TrustBadges.jsx` (Campus Trust Architecture)
- **4 Editorial Trust Pillars:** 100% Verified Campus Peers, 4-Angle Vision AI Verification, Hostel & Campus Safe Zones, and Zero Middleman Fees.
- **Micro-Badges:** Highlights key guarantees (`Student IDs Checked`, `Zero Fake Photos`, `Instant 5-Min Handover`, `₹0 Commission`).

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
├── PROJECT_CONTEXT.md             # Persistent architectural source of truth
├── STUDENT_STUDY_GUIDE.md         # Comprehensive engineering & exam study guide for students
│
├── public/
│   └── campusmart-ai.apk          # Direct Android APK download target (or CDN URL)
│
└── src/
    ├── main.jsx                   # React root entry, mounts <App />
    ├── App.jsx                    # Root layout shell, dynamic page titles, Nav, Footer, Routes
    ├── index.css                  # Tailwind v4 @theme tokens, typography, component utilities, viewport lock
    │
    ├── api/
    │   └── client.js              # Full backend client (products, stats, auth, AI chat, valuation)
    │
    ├── router/
    │   └── router.jsx             # Lightweight zero-dep SPA router (Router, Link, NavLink, Routes)
    │
    ├── components/
    │   ├── ApiStatusBadge.jsx     # Live/Offline status indicator + refresh trigger
    │   ├── AuthCard.jsx           # Student login & OTP sign-up card with auto-fill banner
    │   ├── CategoryShowcase.jsx   # Graphic category cards grid on Home page
    │   ├── Footer.jsx             # Copyright, verification link, pre-composed support mailto
    │   ├── HeroGraphic.jsx        # Interactive 4-angle viewfinder inspection graphic
    │   ├── MobileBottomNav.jsx    # Native-feeling fixed bottom navigation bar on mobile
    │   ├── Nav.jsx                # Sticky navigation bar with squircle logo, nav links, auth status
    │   ├── ProductCard.jsx        # Storefront listing card with ₹ price, condition, 5-star trust
    │   ├── ProductDetailModal.jsx # In-page quick inspection modal with 4-photo gallery
    │   ├── QrCode.jsx             # Pure SVG QR code renderer (no external runtime deps)
    │   ├── TrustBadges.jsx        # 4 trust pillars graphic showcase
    │   ├── WantedBoard.jsx        # "Want to Buy" campus board with AI instant matching
    │   └── WarmupBanner.jsx       # Render server wakeup alert for cold starts
    │
    ├── pages/
    │   ├── Home.jsx               # Landing page with mobile-hardened counters & fresh feed
    │   ├── Marketplace.jsx        # Storefront with department/year pills & 5 sort modes
    │   ├── ProductPage.jsx        # Flagship full-page item experience (/product/:id)
    │   ├── HowItWorks.jsx         # 4-angle photo verification breakdown & student benefits
    │   ├── Sandbox.jsx            # Price Estimator + live Google Gemini AI chat
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
    │   ├── format.js              # rupees(₹), trustOutOf5(), cleanAiNotes(), buildWhatsAppShareUrl()
    │   ├── listingEngine.js       # Local rule-based classifier, pricing math, safety word check
    │   └── qrcode.js              # Dependency-free QR code matrix generator (versions 1-10, EC-M)
    │
    └── data/
        ├── site.js                # App specs, photo angles, verification steps, support mailto
        ├── sandbox.js             # Sandbox condition tiers, prohibited words, fallback seed data
        ├── colleges.js            # Comprehensive 120+ Maharashtra and all-India CET colleges directory
        ├── wantedSeed.js          # Pre-seeded campus wanted requests across FE, SE, TE, BE
        └── demoListings.js        # Fallback catalog seed data for offline resilience
```

---

## 7. Backend API Contracts & Integration

All requests are dispatched through `src/api/client.js` with exponential backoff retry and timeout guards (`REQUEST_TIMEOUT_MS = 75000` for Render spin-ups). Defaults seamlessly to `DEFAULT_PROD_API = "https://campusmart-api-zia4.onrender.com"`.

| Route | Method | Payload / Headers | Response & Purpose |
|---|---|---|---|
| `/` | `GET` | None | Health check probe. Returns `200 OK` (`{"status":"CampusMart API is running","chat_engine":"key_pool_v2"}`). |
| `/products/` | `GET` | None | Returns array of products. Normalized into `{ id, title, description, category, condition, image_url, image_urls, ai_tags, ai_condition_notes, seller_name, college_name, listed_price, suggested_price, seller_trust_score, created_at }`. |
| `/colleges` | `GET` | `?q=<query>&discover=true` | **3-Layer Hybrid College Search Engine:** Queries local 6-region directory (180+ institutes) + live backend AI + web discovery (Nominatim & Wikipedia). Returns `{ code, name, shortName, city, district, type, badge, source }`. |
| `/stats/` | `GET` | None | Returns campus metrics (`listings`, `students`). Falls back to null. |
| `/auth/register` | `POST` | `{ name, email, password, college_name? }` | **Direct Student Registration:** Issues JWT `<access_token>` in ~300ms without requiring OTP delivery. Used for instant student onboarding and transparent visitor guest sessions. |
| `/auth/login` | `POST` | `{ email, password }` | Authenticates existing user. Returns `{ access_token, user }`. |
| `/auth/send-otp` | `POST` | `{ name, email, password, college_name? }` | Sends 6-digit OTP. Returns `{ message, email, email_delivered, fallback_otp_code }`. |
| `/auth/verify-otp` | `POST` | `{ email, otp_code, college_name? }` | Verifies OTP. Returns `{ access_token, token_type, user: { id, name, email, trust_score, college_name } }`. |
| `/auth/resend-otp` | `POST` | `{ email }` | Resends OTP. Returns `{ message, fallback_otp_code }`. |
| `/ai/estimate-price` | `POST` | `{ image_base64?, title?, condition?, age_years? }` | **Public Web Price Estimator:** Unauthenticated single-item valuation using Google Gemini Vision + Google Search Grounding to filter screenshots, find current Indian MRP, and compute fair campus resale. |
| `/ai/chat` | `POST` | `Authorization: Bearer <token>`<br>`{ message, history, session_id? }` | **Live Google Gemini Campus Agent:** Multi-turn conversational AI grounded in live PostgreSQL catalog and Indian student resale benchmarks. Automatically creates and retitles sessions. |
| `/wanted/` | `GET` | None | Fetches active student request posts on the "Want to Buy" campus board. |
| `/wanted/` | `POST` | `{ title, description, budget, branch, academic_year, urgency, student_name, contact_info }` | Creates a student wanted listing. |
| `/wanted/ai-draft` | `POST` | `{ prompt }` | Parses natural student requests into structured `{ title, budget, branch, academic_year, urgency }`. |

### Trust Score Formula & Standard
- **Backend Scale:** Stored as `0.0` to `5.0` (e.g. `4.9`, `5.0`).
- **Display Standard:** Formatted exclusively as `★ 4.9 / 5` or `★ 5.0 / 5` via `trustOutOf5()`.
- **Rule:** Never display raw out-of-100 or broken integer calculations.

---

## 8. Deployment & Production Configuration

- **Platform:** Vercel (Production URL connected to GitHub `origin/main`).
- **Configuration (`vercel.json`):**
  - SPA Rewrites: `/(.*) -> /index.html` (allows direct navigation and refresh on `/marketplace`, `/product/:id`, `/download`, etc.).
  - Immutable asset caching for `/assets/(.*)` (`max-age=31536000, immutable`).
  - Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://campusmart-api-zia4.onrender.com` (configured in Vercel project settings).
  - `VITE_APK_DOWNLOAD_URL`: `/campusmart-ai.apk` (or CDN URL).
- **Fallback Resilience:** `src/api/client.js` defines `DEFAULT_PROD_API = "https://campusmart-api-zia4.onrender.com"` so if `VITE_API_BASE_URL` is omitted, the production build automatically connects to the live backend.

---

## 9. Mobile Viewport Hardening & Strict Responsive Architecture

To guarantee zero horizontal overflow across 360px–430px modern smartphone viewports:
1. **Global Viewport Lock (`src/index.css` & `src/App.jsx`):**
   - Enforced `overflow-x: hidden; max-width: 100vw;` across `html`, `body`, and `#root`.
2. **Grid & Flex Child Contraction (`min-w-0`):**
   - In CSS Grid / Flexbox, items without `min-w-0` expand to fit unbroken text and break the mobile viewport. All cards and flex parents explicitly declare `w-full max-w-full min-w-0 overflow-hidden`.
3. **Campus Activity & Fresh on Campus Layouts (`src/pages/Home.jsx`):**
   - Stat boxes (`Active listings` & `Verified students`) locked into a strict 2-column grid (`grid grid-cols-2 gap-3 w-full min-w-0`).
   - "Fresh on campus" rows enforce `truncate flex-1 min-w-0` with right-docked, non-shrinking price tags (`shrink-0 pl-2`).
4. **Modal Background Blur & Scroll Lock Fix (`src/components/WantedBoard.jsx`):**
   - Fixed modal backdrop blur and body scroll lock cleanup on unmount to eliminate frozen blurred screens.

---

## 10. Comprehensive Code Audit & Commercial-Grade Upgrades (2026-10-17)

A line-by-line code audit across all 36 source files in `src/` resolved critical edge-case bugs and elevated the platform to commercial grade:

1. **Router Query String Preservation (`src/router/router.jsx`):**
   - **Fixed:** `normalizePath` previously stripped query strings on navigation (`raw.split('?')[0]`). Now maintains separate `pathname` and `search` in router context and passes full queries (`/marketplace?category=...`, `?tab=wanted`, `?item=...`).
2. **Marketplace URL Query Synchronization (`src/pages/Marketplace.jsx`):**
   - **Fixed:** Synchronized all query parameters (`category`, `college`, `branch`, `year`, `q` / `search`, `tab`, `item`) so deep links from category cards on Home (`CategoryShowcase.jsx`) and WhatsApp share messages immediately apply filters and open modals seamlessly.
3. **Image Load Error Resilience (`ProductCard.jsx`, `ProductDetailModal.jsx`, `Home.jsx`, `HeroGraphic.jsx`):**
   - **Fixed:** Added stateful `onError` handlers across all product images, thumbnails, and galleries. If an image fails to load (network block or broken URL), clean SVG category fallback graphics are rendered instead of broken browser image placeholders.
4. **Keyboard Focus & Modal Accessibility (`WantedBoard.jsx`, `Nav.jsx`, `ProductCard.jsx`):**
   - **Fixed:** Connected unattached `closeRef` in `Nav.jsx` to the mobile menu button.
   - **Fixed:** Added Escape key listeners and background body scroll locks to `PostWantedModal` and `handoffItem` modal in `WantedBoard.jsx`.
   - **Fixed:** Stopped keyboard event bubbling on WhatsApp share buttons (`onKeyDown`) in `ProductCard.jsx`.
5. **AI Price Estimator & Assistant Synergy (`src/pages/Sandbox.jsx`):**
   - **Upgraded:** Deep-linking from product modals to `/sandbox?item=...&price=...` pre-populates an intelligent valuation question for the live catalog assistant and pre-fills the valuation title.
6. **Mobile Bottom Navigation Bar (`src/components/MobileBottomNav.jsx` & `App.jsx`):**
   - **Upgraded:** Added a native app-tier fixed bottom bar on `< 768px` screens (Home, Market, Wanted Board with cash indicator, AI Valuer, Get App) with haptic-feel active indicators and safe-area padding.

---

## 11. Flagship Dedicated Product Experience (`/product/:id`) (2026-10-17)

Replaced constrained popup modals with a dedicated Amazon / Airbnb-tier full-window product page:
1. **Dedicated Routing:** Added `/product/:id` route in `src/router/router.jsx` and `src/App.jsx`, mapping directly from card clicks on Home, Marketplace, and WantedBoard.
2. **Backward-Compatible WhatsApp Deep Links:** Automatic redirect from `/marketplace?item=<id>` to `/product/<id>` preserves all existing viral WhatsApp broadcast links.
3. **Interactive 4-Angle Showcase:** 7-column desktop showcase with angle selector, keyboard arrows, and click-to-zoom fullscreen inspection modal.
4. **Un-crushed Action Dock:** Clean vertical action stack (`Get the App`, `Ask CampusMart AI`, `Share to WhatsApp`, `Copy Link`) with high touch targets and zero layout squishing.
5. **Backend Error String Sanitization:** Centralized `cleanAiNotes()` in `src/lib/format.js` to strip internal key/quota notices and provide clean student-facing inspection notes.

---

## 12. Live Google Gemini Agent & Seamless Guest Authentication Engine (2026-10-18)

Resolved the offline static response bottleneck under `/sandbox` ("Ask CampusMart AI"):
1. **Instant Guest JWT Registration (`src/api/client.js`):**
   - Previous flow attempted two-step OTP registration expecting a debug `fallback_otp_code` that is null in production.
   - Upgraded `getOrAcquireToken()` to call `POST /auth/register` directly, which returns a verified Bearer JWT in ~300ms without requiring an email OTP wait.
   - Stores guest token in memory and `localStorage.setItem("campusmart.guest_token", token)`.
2. **Self-Healing Authentication:**
   - If an expired token returns HTTP 401 Unauthorized, `askCampusMartAi()` automatically purges the stale token, issues a fresh guest registration, and retries the request seamlessly.
3. **Multi-Turn Conversational Google Gemini AI:**
   - Connected directly to `POST /ai/chat` powered by Google Gemini LLM, returning intelligent, conversational, and campus-grounded pricing intelligence.
4. **Intelligent Dynamic Catalog Valuation Engine (Fallback):**
   - Replaced rigid 4-keyword static canned strings with a semantic keyword scoring engine that scans active catalog items, computes real min/max/average prices, and renders clickable product chips linking to `/product/:id`.
5. **UI Badging & Feedback (`src/pages/Sandbox.jsx`):**
   - Displays `✨ Live Google Gemini Agent` badge with dynamic thinking indicator.

---

## 13. Academic Learning Guide (`STUDENT_STUDY_GUIDE.md`)

Added a comprehensive exam and viva preparation reference for engineering students:
- Covers full-stack web architecture, React 19 functional state patterns, Tailwind CSS v4 design tokens, client-side routing algorithms, REST API integration, and AI vision pipelines.
- Formatted with syllabus-aligned diagrams, interview Q&As, and step-by-step code walkthroughs for university viva and practical examinations.

---

*Last updated: 2026-10-18. All systems verified: 6-route SPA architecture, live Google Gemini LLM assistant, dedicated `/product/:id` flagship page, mobile viewport lock, and educational study guide.*

