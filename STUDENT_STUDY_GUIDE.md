# CampusMart AI — Comprehensive Engineering Study Guide & Project Handbook
> **A Complete Master Reference from Basics to Advanced for University Exams, Practical Viva, Project Reviews, and Technical Interviews.**
> **Author & Project Architecture:** CampusMart AI Engineering Team  
> **Tech Stack:** React 19 · JavaScript (ES6+) · Tailwind CSS v4 · Vite 8 · Google Gemini Multimodal Vision AI · REST APIs

---

## Table of Contents
1. [Project Overview & System Architecture](#1-project-overview--system-architecture)
2. [Web Fundamentals (HTML5, CSS3 & Modern JavaScript)](#2-web-fundamentals-html5-css3--modern-javascript)
3. [CSS3, Mobile Responsiveness & Tailwind CSS v4](#3-css3-mobile-responsiveness--tailwind-css-v4)
4. [React 19 Deep Dive & Component Architecture](#4-react-19-deep-dive--component-architecture)
5. [React Hooks Masterclass (With Real Project Code)](#5-react-hooks-masterclass-with-real-project-code)
6. [Single Page Application (SPA) & Zero-Dependency Client Router](#6-single-page-application-spa--zero-dependency-client-router)
7. [REST APIs, Client-Side Image Compression & Networking](#7-rest-apis-client-side-image-compression--networking)
8. [Multimodal Vision AI & Smart Pricing Algorithms](#8-multimodal-vision-ai--smart-pricing-algorithms)
9. [Growth Features: WhatsApp Viral Loop & Campus Request Board](#9-growth-features-whatsapp-viral-loop--campus-request-board)
10. [Build Systems, Tooling (Vite, npm) & CI/CD Deployment](#10-build-systems-tooling-vite-npm--cicd-deployment)
11. [Master Viva & Exam Q&A Bank (30 High-Yield Questions)](#11-master-viva--exam-qa-bank-30-high-yield-questions)

---

# 1. Project Overview & System Architecture

### 1.1 The Real-World Engineering Problem
In colleges and engineering universities across Maharashtra and India, students purchase expensive academic assets every semester:
- Scientific calculators (e.g. Casio fx-991CW / MS / EX) costing ₹1,200 – ₹1,800.
- Engineering drawing instruments (Mini drafters, roller scales, drawing boards) costing ₹800 – ₹1,500.
- Semester textbooks (B.S. Grewal, Nirali, TechMax) costing ₹500 – ₹900 each.
- Electronics project components (Arduino Uno, Raspberry Pi, sensors, breadboards).

After passing the semester, these items sit idle in hostel rooms. Meanwhile, juniors entering the next year buy the same items brand new at retail price. Existing platforms like OLX and Quikr fail in college environments because:
1. **Safety Risks:** Strangers and non-students contact sellers.
2. **Hidden Defects:** Buyers cannot verify whether a calculator screen has dead LCD segments or a drafter clamp is cracked.
3. **No Pricing Standard:** Sellers overcharge or undercharge arbitrarily.
4. **Distance & Logistics:** Meeting an unknown seller across the city is inconvenient compared to meeting in the college canteen or hostel lobby.

### 1.2 The CampusMart AI Solution
CampusMart AI is a hyper-local, peer-to-peer student marketplace with three technological pillars:
1. **4-Angle Multimodal Vision AI Verification:** Uses Google Gemini Vision to inspect 4 photos (Front, Back, Edges, Screen Test) to detect defects, verify serial QR codes, and classify condition.
2. **AI Fair ₹ Valuation:** Evaluates original Indian retail MRP, applies depreciation algorithms based on age and condition, and suggests a fair price in ₹.
3. **Campus Safe-Zone Handover & Viral Loop:** Verified student community with direct hostel/batch WhatsApp sharing and a "Want to Buy" matching engine.

### 1.3 System Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                  |
|                                                                                 |
|   +-------------------+    +--------------------+    +----------------------+   |
|   |   React 19 SPA    |    |  Zero-Dependency   |    |  Tailwind CSS v4     |   |
|   |  Components (JSX) |<-->|  Client Router     |<-->|  Editorial Design    |   |
|   | (Pages & Modals)  |    | (/product/:id)     |    |  (100vw Viewport)    |   |
|   +-------------------+    +--------------------+    +----------------------+   |
|             |                         |                         |               |
|             v                         v                         v               |
|   +-------------------------------------------------------------------------+   |
|   |                         State & Custom Hooks                            |   |
|   |   useLiveFeed()  ·  useStats()  ·  useWarmup()  ·  usePipeline()       |   |
|   +-------------------------------------------------------------------------+   |
|             |                         |                         |               |
|             v                         v                         v               |
|   +-------------------+    +--------------------+    +----------------------+   |
|   | Client Compressor |    |  LocalStorage V1   |    | WhatsApp Generator   |   |
|   | Canvas (<150KB)   |    | (Wanted / Auth)    |    | (wa.me/?text=...)    |   |
|   +-------------------+    +--------------------+    +----------------------+   |
+-------------|---------------------------------------------------|---------------+
              | (HTTPS REST / JSON)                               | (WhatsApp Web)
              v                                                   v
+-------------------------------+                   +-----------------------------+
|    Backend Node / Python API  |                   | Hostel & Class WhatsApp     |
| - /products (Live Catalog)    |                   | Group Viral Sharing         |
| - /colleges (CET Directory)   |                   +-----------------------------+
| - /ai/estimate-price          |
+-------------------------------+
              |
              v
+-------------------------------+
|  Google Gemini Multimodal AI  |
| - 4-Angle Visual Inspection   |
| - OCR Model/Serial Validation |
| - Indian Retail Market Engine |
+-------------------------------+
```

---

# 2. Web Fundamentals (HTML5, CSS3 & Modern JavaScript)

### 2.1 Semantic HTML5
Semantic HTML uses tags that explain their meaning to both the browser and the developer, rather than generic `<div>` containers.

| HTML5 Element | Purpose in CampusMart AI |
| :--- | :--- |
| `<header>` | Site top bar, page title banners, search & category filters. |
| `<nav>` | Navigation links, breadcrumbs (`Marketplace / Category / Title`), mobile bottom bar. |
| `<main>` | Core page contents, receives focus on route transition (`tabIndex={-1}`). |
| `<article>` | Self-contained cards (individual product listings, wanted request posts). |
| `<section>` | Grouped thematic blocks (Hero section, Trust Badges, Campus Activity). |
| `<dl>, <dt>, <dd>` | Description lists for statistics (`Active listings`, `Verified students`). |
| `<figure>, <figcaption>` | Product images with verified angle labels (`Front Face`, `Grade A+`). |

### 2.2 Modern JavaScript (ES6+ Features Used in Project)

#### 1. `let` and `const` vs `var`
- `var` is function-scoped and hoisted with `undefined`. Avoided in modern codebases.
- `const` creates block-scoped immutable bindings (the reference cannot change).
- `let` creates block-scoped mutable bindings for loop counters or re-assignable state.

#### 2. Arrow Functions (`() => {}`)
Arrow functions do not bind their own `this`, `arguments`, or `super`.
```javascript
// Concise implicit return used in filtering products:
const activeProducts = products.filter((p) => p.is_active && !p.is_sold);
```

#### 3. Destructuring Assignment
Unpacks values from arrays or properties from objects into distinct variables:
```javascript
// Object destructuring with default fallbacks:
const { title = "Untitled", listed_price: price = 0, condition } = product;

// Array destructuring from custom hooks:
const [query, setQuery] = useState("");
```

#### 4. Spread (`...`) and Rest Operators
```javascript
// Immutably updating state arrays:
setItems((prev) => [newItem, ...prev]);

// Shallow merging objects:
const updatedProduct = { ...product, condition: "mint", updated_at: new Date().toISOString() };
```

#### 5. Higher-Order Array Methods
- `map()`: Transforms an array into a new array of equal length (e.g. rendering lists in JSX).
- `filter()`: Returns a subset of items matching a predicate function.
- `reduce()`: Accumulates array items into a single computed value (e.g. total catalog valuation).
- `find()`: Returns the first item matching a condition (e.g. finding product by `:id`).
- `some()` / `every()`: Boolean validation across items.

```javascript
// Example from CampusMart search engine:
const filtered = source.filter((product) => {
  if (category !== "All" && product.category !== category) return false;
  if (college !== "All" && product.college_name !== college) return false;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    product.title.toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle)
  );
});
```

#### 6. Asynchronous JavaScript: Promises & `async/await`
A Promise represents an eventual completion (or failure) of an asynchronous operation:
```javascript
// async/await ensures sequential readability while keeping the UI non-blocking:
async function loadCatalog() {
  try {
    const res = await fetch("https://api.campusmart.in/products");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to load catalog, switching to offline fallback:", err);
    return demoListings;
  } finally {
    setLoading(false);
  }
}
```

---

# 3. CSS3, Mobile Responsiveness & Tailwind CSS v4

### 3.1 The CSS Box Model
Every element on a web page is a rectangular box made of 4 layers:
```
+------------------------------------------------+
|                   MARGIN                       |  (Transparent space outside element)
|  +------------------------------------------+  |
|  |                BORDER                    |  |  (Visible boundary stroke)
|  |  +------------------------------------+  |  |
|  |  |             PADDING                |  |  |  (Inner space between content & border)
|  |  |  +------------------------------+  |  |  |
|  |  |  |           CONTENT            |  |  |  |  (Text, image, or child element)
|  |  |  +------------------------------+  |  |  |
|  |  +------------------------------------+  |  |
|  +------------------------------------------+  |
+------------------------------------------------+
```
`box-sizing: border-box;` (default in Tailwind) ensures that padding and borders are included *inside* the element's specified width and height.

### 3.2 Flexbox vs CSS Grid

| Feature | CSS Flexbox (`flex`) | CSS Grid (`grid`) |
| :--- | :--- | :--- |
| **Dimensionality** | One-dimensional (Row OR Column). | Two-dimensional (Rows AND Columns simultaneously). |
| **Best Used For** | Navigation bars, badge clusters, button groups, row alignment. | Product catalogs, multi-column photo galleries, stat dashboards. |
| **CampusMart Example** | `PreviewRow`: thumbnail on left, title in middle, price on right. | `Marketplace`: 3-column product card grid (`sm:grid-cols-2 xl:grid-cols-3`). |

### 3.3 The Infamous CSS Grid / Flexbox Mobile Overflow Bug & `min-w-0`
> **Critical Concept for Exams:** In standard CSS, flex items and grid items default to `min-width: auto;`.  
> If a child contains long unbroken text (e.g. `Huawei 10W USB-A Power Adapter (Model HW-050200IP3)`), the element will **refuse to shrink** below the content's minimum width!  
> This pushes parent containers wider than the phone screen (`> 100vw`), causing horizontal scrollbars and breaking the layout.

**The Solution:**
Add `min-w-0` and `w-full` on every grid/flex child, combined with `truncate` or `break-words`:
```html
<!-- Broken: stretches grid wider than 100vw on mobile -->
<div class="grid grid-cols-2">
  <div><h3>SuperLongUnbrokenProductTitleHereThatBreaksPhoneScreen</h3></div>
</div>

<!-- Fixed: forces container to respect column boundaries and truncates text -->
<div class="grid grid-cols-2 w-full min-w-0">
  <div class="min-w-0">
    <h3 class="truncate font-medium text-sm">SuperLongUnbrokenProductTitle...</h3>
  </div>
</div>
```

### 3.4 Tailwind CSS v4 Modern Theme Architecture
In Tailwind CSS v4, configuration lives directly in CSS via the `@theme` directive, eliminating old `tailwind.config.js` files:

```css
@import "tailwindcss";

@theme {
  --color-paper: #faf9f6;       /* Editorial warm paper background */
  --color-card: #ffffff;        /* Crisp card surface */
  --color-ink: #1c1917;         /* Deep high-contrast stone charcoal */
  --color-accent: #1d4ed8;      /* Royal university blue */
  --color-positive: #15803d;    /* Verified trust emerald green */
  --color-warn: #b45309;        /* Urgent alert amber */

  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Newsreader", Georgia, serif;
}

@layer base {
  html, body, #root {
    overflow-x: hidden;
    max-width: 100vw;
    width: 100%;
  }
}
```

---

# 4. React 19 Deep Dive & Component Architecture

### 4.1 What is React and Why Do We Use It?
- **Imperative Programming (Plain JS / jQuery):** You manually select DOM nodes and mutate them (`document.getElementById('price').innerText = '₹500'`). Error-prone, slow, and hard to maintain as apps grow.
- **Declarative Programming (React):** You declare *what* the UI should look like based on the current *state* (`<h1>{rupees(price)}</h1>`). React handles updating the browser DOM efficiently.

### 4.2 Virtual DOM & Reconciliation
1. **Virtual DOM:** A lightweight in-memory JavaScript representation of the actual browser DOM.
2. **Diffing Algorithm:** When state changes, React creates a new Virtual DOM tree and compares ("diffs") it with the previous tree.
3. **Reconciliation:** React calculates the minimal set of changes and applies only those specific mutations to the real browser DOM in a single batch, maximizing frame rate.

### 4.3 Component Hierarchy in CampusMart AI
```
<App> (Root Router & Viewport Shell)
  ├── <Nav> (Desktop Sticky Header & Brand)
  ├── <main> (Dynamic Route Outlet)
  │     ├── <Home> (Hero, Activity Pulse, Fresh Listings, Category Showcase)
  │     ├── <Marketplace> (Filters, CET Selector, Product Grid, Request Strip)
  │     ├── <ProductPage> (Full-page flagship 2-column inspection gallery)
  │     ├── <Sandbox> (Multimodal AI Price Estimator & Chat Assistant)
  │     └── <Download> (CET Directory Auth & APK Download Card)
  ├── <Footer> (Support mailto & campus verified marks)
  └── <MobileBottomNav> (Native-tier fixed bottom app dock)
```

---

# 5. React Hooks Masterclass (With Real Project Code)

### 5.1 `useState`: Managing Reactive State
`useState` declares a state variable and a setter function:
```javascript
const [activeTab, setActiveTab] = useState("listings"); // default: "listings"
```
Whenever `setActiveTab("wanted")` is called, React schedules a re-render with the new value.

### 5.2 `useEffect`: Side Effects, Lifecycle & Cleanups
`useEffect` handles operations that interact outside of React's pure render cycle:
```javascript
// 1. Fetching data on component mount
// 2. Setting browser document title
// 3. Registering keyboard event listeners (Escape key)
// 4. Timer cleanups

useEffect(() => {
  const onKeyDown = (e) => {
    if (e.key === "Escape") setZoomOpen(false);
  };
  window.addEventListener("keydown", onKeyDown);

  // CRITICAL: Cleanup function runs when component unmounts
  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
}, []); // Empty dependency array = runs ONCE on mount
```

### 5.3 `useMemo`: Performance Optimization & Caching Computations
`useMemo` caches the result of an expensive calculation between re-renders unless its dependencies change:
```javascript
// Avoids re-sorting and re-filtering hundreds of products on every unrelated keystroke:
const filtered = useMemo(() => {
  return source.filter((product) => {
    if (category !== "All" && product.category !== category) return false;
    return product.title.toLowerCase().includes(query.toLowerCase());
  });
}, [source, category, query]); // Only recomputes when source, category, or query changes!
```

### 5.4 `useRef`: DOM References & Unchanging Mutables
Unlike state, changing a `ref` **does not trigger a re-render**.
```javascript
// 1. Storing reference to real DOM node for accessibility focus:
const mainRef = useRef(null);
useEffect(() => {
  mainRef.current?.focus({ preventScroll: true });
}, [pathname]);

// 2. Tracking file input without extra renders:
const fileInputRef = useRef(null);
```

### 5.5 React Portals (`createPortal`): Solving Z-Index & Stacking Context
> **Crucial Viva Topic:** Why not render modal popups inside the component where the button was clicked?  
> **Answer:** If a parent component has CSS `transform`, `filter`, or `overflow: hidden`, any inner element with `position: fixed` will position itself **relative to that parent instead of the browser viewport**, causing dialogs to render off-screen or freeze!

**The Solution with `createPortal`:**
```javascript
import { createPortal } from "react-dom";

// Renders the dialog directly into <body> while preserving React event bubbling:
{isPosting && typeof document !== "undefined" && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
      <h3>Post a Wanted Item</h3>
      {/* Modal contents */}
    </div>
  </div>,
  document.body
)}
```

---

# 6. Single Page Application (SPA) & Zero-Dependency Client Router

### 6.1 How Client-Side Routing Works
In traditional Multi-Page Applications (MPAs), clicking a link requests a completely new HTML page from the web server, causing a blank white flash.  
In a Single Page Application (SPA), the browser downloads one HTML bundle. When a user clicks a link:
1. `event.preventDefault()` stops browser reload.
2. `window.history.pushState({}, "", to)` updates the browser URL bar.
3. A custom event (`popstate`) notifies the router.
4. React conditionally renders the matching component for that URL path!

### 6.2 CampusMart AI's Custom Dynamic Route Matcher (`router.jsx`)
```javascript
// Matches static routes ("/") and dynamic segment routes ("/product/:id")
function matchPath(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const key = patternParts[i].slice(1);
      params[key] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
```

---

# 7. REST APIs, Client-Side Image Compression & Networking

### 7.1 What is a REST API?
**REpresentational State Transfer (REST)** is an architectural pattern for web services.
- **Stateless:** Every HTTP request contains all information needed to understand and process the request.
- **Resource-Oriented:** Endpoints represent entities (`/products`, `/colleges`, `/wanted`).
- **Standard HTTP Methods:**
  - `GET /products` -> Retrieve list of products.
  - `GET /products/123` -> Retrieve item details.
  - `POST /ai/estimate-price` -> Send image/parameters to receive AI pricing.
  - `POST /wanted` -> Create a new buyer request.

### 7.2 Why Compress Images on the Client Before Uploading?
A phone camera captures photos at 12–48 megapixels (5MB – 15MB per photo).  
Uploading four uncompressed photos:
- Wastes 40MB+ of mobile data per student.
- Takes 15–30 seconds on 4G campus networks.
- Overwhelms server memory and crashes API endpoints.

**Client-Side HTML5 Canvas Compression (`compressImageToBase64`):**
```javascript
export async function compressImageToBase64(file, maxDimension = 1024, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        // Scale down proportionally to max 1024px:
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG Base64 (<150KB):
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```
**Outcome:** Reduces image payload by **96%** (<150KB) and uploads in **under 300ms**!

---

# 8. Multimodal Vision AI & Smart Pricing Algorithms

### 8.1 What is Multimodal AI?
Traditional Language Models (LLMs) only process text tokens. **Multimodal AI** (such as Google Gemini 1.5/2.0 Flash & Vision) natively ingests **both visual pixels and textual context simultaneously**. It can read text in images (OCR), recognize 3D physical shapes, assess surface wear and scratches, and extract model identifiers.

### 8.2 The 4-Angle Inspection Protocol
| Angle Name | Target Inspection Area | Defect Detection Logic |
| :--- | :--- | :--- |
| **Angle 1: Front Face** | Screen & Buttons / Keypad | Dead LCD segments, missing keycaps, deep screen scratches. |
| **Angle 2: Back Housing** | Serial Number & Battery Seal | Model code authenticity, battery corrosion, opened casing. |
| **Angle 3: Edges & Clamps** | Mechanical joints, corners | Impact chips, cracked plastic, loose mini-drafter wing nuts. |
| **Angle 4: Self-Test / Detail** | Diagnostics / Inside Pages | Built-in matrix self-test pass, missing book pages, highlighting. |

### 8.3 Algorithmic Fair Resale Pricing Formula
The CampusMart AI pricing engine balances fair student savings against seller profit:

$$\text{Suggested Price} = \text{MRP} \times (1 - \text{Depreciation Rate})^{\text{Age}} \times \text{Condition Multiplier}$$

- **Condition Multipliers:**
  - `brand_new`: $0.85$ (15% instant unboxing discount)
  - `like_new`: $0.70$ (30% discount)
  - `good`: $0.55$ (45% discount)
  - `fair`: $0.40$ (60% discount)

---

# 9. Growth Features: WhatsApp Viral Loop & Campus Request Board

### 9.1 WhatsApp Viral Loop Architecture
In Indian universities, hostel wings and academic batches organize their daily communication through WhatsApp groups. CampusMart turns this into a viral acquisition engine:

```javascript
export function buildWhatsAppShareUrl(product) {
  const origin = window.location.origin;
  const link = `${origin}/product/${encodeURIComponent(product.id)}`;

  const message = [
    `🔥 *${product.title}* for sale on CampusMart AI`,
    `💰 Price: ₹${product.listed_price} (AI suggests fair value: ₹${product.suggested_price})`,
    `🎓 Dept: ${product.branch} · ${product.academic_year}`,
    `📍 Campus: ${product.college_name}`,
    `📸 See 4-angle verified inspection photos here:`,
    link,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
```
When clicked in WhatsApp, the deep link opens directly into `/product/:id` on CampusMart AI without requiring login!

### 9.2 The "Want to Buy" Instant Match Algorithm
When a buyer posts an urgent item needed (e.g. *"Need Casio fx-991CW under ₹700 for tomorrow's exam"*), the system parses the request and compares it against active seller inventory:

```javascript
function findMatchingListing(wanted, products = []) {
  const keywords = wanted.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  return products.find(p => {
    const text = `${p.title} ${p.description}`.toLowerCase();
    const hasMatch = keywords.some(k => text.includes(k));
    const price = Number(p.listed_price);
    return hasMatch && (!wanted.budget || price <= wanted.budget * 1.35);
  });
}
```

---

# 10. Build Systems, Tooling (Vite, npm) & CI/CD Deployment

### 10.1 Why Vite Over Traditional Webpack?
| Feature | Webpack (Legacy) | Vite (Modern Standard) |
| :--- | :--- | :--- |
| **Development Server** | Bundles entire application before serving. Slow starts (30s+). | Uses browser-native ES Modules (`<script type="module">`). Instant start (<300ms). |
| **Hot Module Replacement** | Re-bundles changed modules and dependents. | Replaces only the exact modified file in memory instantly. |
| **Production Build** | Complex plugin chains. | Highly optimized Rollup/Rolldown pipeline with gzip & treeshaking. |

### 10.2 Continuous Integration & Continuous Deployment (CI/CD)
1. **Developer Machine:** Code edits -> `git add -A; git commit -m "..."` -> `git push origin main`.
2. **GitHub Repository:** Receives commit webhook and notifies Vercel.
3. **Vercel Cloud Build Pipeline:**
   - Spawns build container.
   - Executes `npm run build` (running `vite build`).
   - Generates minified static assets in `dist/`.
   - Distributes assets across global Edge Content Delivery Networks (CDN) with automatic HTTPS.

---

# 11. Master Viva & Exam Q&A Bank (30 High-Yield Questions)

### Q1: What is a Single Page Application (SPA)?
**Answer:** An SPA is a web application that loads a single HTML document and dynamically updates the page content as the user interacts with the app, using JavaScript APIs like `fetch()` and HTML5 History (`pushState`), avoiding full page reloads.

### Q2: What is JSX in React?
**Answer:** JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows developers to write HTML-like structures directly inside JavaScript files. It compiles down to `React.createElement()` or React 19 JSX runtime function calls.

### Q3: What is the difference between State and Props?
**Answer:**
- **Props (Properties):** Read-only data passed from a parent component down to a child component. A component cannot modify its own props.
- **State:** Mutable data managed internally within a component that can change over time via its setter function (e.g. `setState`), triggering a re-render.

### Q4: Why is `key` prop required when rendering lists in React?
**Answer:** The `key` prop provides a stable identity for each element in an array. During the reconciliation (diffing) phase, React uses keys to quickly determine which items have been added, removed, or reordered, avoiding unnecessary DOM re-creations.

### Q5: What is the purpose of `useMemo` vs `useCallback`?
**Answer:**
- `useMemo`: Caches the **result** of a calculation (`const val = useMemo(() => compute(), [deps])`).
- `useCallback`: Caches the **function definition itself** between renders (`const fn = useCallback(() => {}, [deps])`).

### Q6: What caused the mobile overflow bug on small phone screens (360px), and how did we fix it?
**Answer:** In CSS Grid and Flexbox, children have `min-width: auto;` by default, meaning long unbroken strings of text prevent the box from shrinking below the text's width, pushing cards wider than `100vw`. We solved this by applying `w-full max-w-full min-w-0 overflow-hidden` and text `truncate` / `break-words`.

### Q7: Why do we use `createPortal` for modal dialogs?
**Answer:** `createPortal` renders dialog elements directly under `document.body` instead of inside nested component DOM trees. This prevents clipping by parent containers that have `overflow: hidden`, CSS transforms, or conflicting `z-index` stacking contexts.

### Q8: What does `useRef` do, and how does it differ from `useState`?
**Answer:** `useRef` returns a mutable object whose `.current` property persists across renders. Changing `.current` **does not** trigger a component re-render, whereas calling a `useState` setter always triggers a re-render.

### Q9: Explain how client-side image compression works using the HTML5 Canvas API.
**Answer:** We load the student's photo into a JavaScript `Image` object via `FileReader`, calculate proportional dimensions (clamped to max 1024px), draw the pixels onto an off-screen `<canvas>`, and export it with `canvas.toDataURL("image/jpeg", 0.78)`. This reduces 10MB images to <150KB.

### Q10: How does client-side routing match dynamic parameters like `/product/:id`?
**Answer:** The router splits the route pattern and current URL path by `/`. When it encounters a segment starting with `:`, it extracts the parameter name and stores the corresponding URL slice into a `params` object, accessible via the `useParams()` hook.

### Q11: What is the advantage of Tailwind CSS v4 over traditional CSS?
**Answer:** Tailwind CSS v4 provides a utility-first methodology directly compiled via `@theme` in CSS. It eliminates dead CSS code via automatic content scanning, prevents naming collisions, enforces consistent spacing scales, and keeps CSS bundles under 15KB gzipped.

### Q12: What is the role of Google Gemini Multimodal Vision AI in this project?
**Answer:** Gemini Vision analyzes four high-resolution photos of student gear simultaneously. It performs OCR to verify serial numbers, identifies the exact product category, assesses physical surface scratches, and flags screenshot fraud.

### Q13: What is the "Cold Start" problem in web hosting, and how does CampusMart handle it?
**Answer:** Free cloud hosting instances (like Render or Railway) spin down to sleep when idle. The first request takes 30–50 seconds to warm up. CampusMart uses a `useWarmup` hook that displays an animated progress bar with educational countdown text and serves verified offline `demoListings` instantly so the user never sees a broken page.

### Q14: How does CampusMart AI maintain seller trust without human moderators?
**Answer:** Trust scores are computed programmatically based on college email domain verification (`.ac.in` / `.edu.in`), 4-angle visual inspection completeness, user ratings normalized to a 5.0-star scale (`trustOutOf5`), and absence of scam keywords via NLP scans.

### Q15: What is a Viral Loop, and how is it implemented?
**Answer:** A viral loop occurs when existing users naturally bring new users to the platform through daily usage. CampusMart's `buildWhatsAppShareUrl` formats listings with markdown bolding, pricing details, and direct deep-links (`/product/:id`), enabling 1-click sharing to college WhatsApp groups.

### Q16: What is the difference between `==` and `===` in JavaScript?
**Answer:** `==` performs loose equality with type coercion (e.g. `'5' == 5` is `true`), whereas `===` performs strict equality without coercion, checking both type and value (e.g. `'5' === 5` is `false`). `===` is always preferred.

### Q17: What is an IIFE (Immediately Invoked Function Expression)?
**Answer:** A JavaScript function that runs as soon as it is defined: `(() => { /* code */ })()`. In JSX, IIFEs are often used to execute inline procedural logic, such as finding a matching listing inside a conditional render.

### Q18: What is the purpose of `useEffect`'s dependency array?
**Answer:**
- Omitted: Runs after *every* render.
- Empty `[]`: Runs *once* after initial mount.
- `[a, b]`: Runs on mount and whenever `a` or `b` changes value between renders.

### Q19: What is `localStorage`, and what are its limitations?
**Answer:** `localStorage` is a client-side synchronous key-value storage mechanism provided by web browsers. It persists data even after closing the tab. Limitations: limited to ~5MB, stores strings only (requires `JSON.stringify`/`JSON.parse`), and is accessible by client-side scripts.

### Q20: How does CampusMart prevent backend API developer notes from leaking to users?
**Answer:** The `cleanAiNotes(notes)` utility function screens incoming text for developer terms (e.g. `Vision AI key`, `Master Admin`, `offline pricing engine`). If detected, it replaces them with verified consumer-friendly inspection copy.

### Q21: What is a Closure in JavaScript?
**Answer:** A closure is the combination of a function bundled together with references to its surrounding lexical environment. It gives an inner function access to an outer function's scope even after the outer function has finished executing.

### Q22: What are CSS Media Queries and Breakpoints?
**Answer:** Media queries apply CSS rules based on device characteristics, such as viewport width (`@media (min-width: 640px)`). In Tailwind: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

### Q23: What is the difference between Synchronous and Asynchronous programming?
**Answer:** Synchronous code executes sequentially, blocking subsequent lines until the current line completes. Asynchronous code (e.g. `fetch`) executes in the background (via Web APIs and the event loop), allowing the UI thread to stay responsive.

### Q24: What is Tree Shaking?
**Answer:** Tree shaking is a dead-code elimination technique used by modern bundlers (like Rollup/Vite). By analyzing ES Module `import` and `export` statements, it strips away unused functions from third-party libraries (e.g. unused Lucide icons), drastically reducing bundle size.

### Q25: What is CORS (Cross-Origin Resource Sharing)?
**Answer:** A browser security mechanism that restricts HTTP requests made by client-side scripts from accessing resources at a different origin (domain, protocol, or port) unless the server sends explicit `Access-Control-Allow-Origin` headers.

### Q26: How does the "Want to Buy" board improve liquidity in the marketplace?
**Answer:** Most marketplaces are supply-driven (sellers list, buyers wait). The Want to Buy board is demand-driven: buyers state urgent needs, allowing seniors with dormant items to quickly monetize them within hours without creating elaborate listings.

### Q27: What is Gzip / Brotli compression in web deployments?
**Answer:** Compression algorithms applied by servers/CDNs to static text files (HTML, CSS, JS) before transmitting over the network. In CampusMart, a 467KB JavaScript bundle is compressed to 132KB (a 71% reduction), drastically improving first-load speed.

### Q28: What is semantic versioning in `package.json`?
**Answer:** SemVer uses the format `MAJOR.MINOR.PATCH` (e.g. `^19.3.1`).
- `^` (caret): Allows updates that do not modify the left-most non-zero digit (e.g. accepts `19.4.0` but not `20.0.0`).
- `~` (tilde): Allows patch-level updates only (e.g. `19.3.2`).

### Q29: What is Debouncing vs Throttling?
**Answer:**
- **Debouncing:** Delays execution until a certain amount of time has passed since the *last* event trigger (e.g. waiting 300ms after user stops typing in the search box).
- **Throttling:** Ensures a function is called at most once in a specified time interval (e.g. updating scroll position at most once every 100ms).

### Q30: How can this project be extended in the future?
**Answer:**
1. Unified Payments Interface (UPI) escrow integration for contactless payment holding until campus handover.
2. Web Push Notifications for instant alerts when a wanted item matches a student's hostel wing.
3. Offline PWA (Progressive Web App) service worker caching for complete offline functionality inside campus basements and labs with weak connectivity.

---
*Created for student excellence in Engineering examinations, Project Presentations, and Technical Viva.*
