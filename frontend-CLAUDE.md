# CLAUDE.md — Dhara Frontend (Next.js 15)

> **Service:** `frontend/` — Next.js 15 + TypeScript + Tailwind CSS
> **Role:** SSR web app — search, AI Q&A, statute/judgment browser, subscriptions, i18n
> **Port:** 3000

---

## 📌 Service Responsibilities

1. **Landing Page** — Hero with embedded search, feature grid, stats strip, how-it-works, CTA
2. **Legal Search** — Bilingual search bar with AI-powered results, filter sidebar, skeleton loaders
3. **AI Q&A Chat** — Document-style legal memo responses with citation block, session sidebar
4. **Statute Browser** — Filterable/searchable list with category tabs, bilingual titles
5. **Judgment Viewer** — Case cards with court filter, gold-accented design
6. **Auth** — Login, register (with role selector), profile management
7. **Subscriptions** — Pricing page with monthly/annual toggle, plan comparison
8. **i18n** — English-primary UI with Bengali as secondary; full bn/en support

---

## 🏗️ Directory Structure

```
frontend/
├── package.json
├── next.config.ts
├── tailwind.config.ts           # Design tokens — colors, shadows, radii
├── tsconfig.json                # strict: true
│
├── app/
│   ├── layout.tsx               # Root layout: fonts, providers, metadata
│   ├── globals.css              # Tailwind base + page-enter / shimmer / bounce-dot animations
│   │
│   └── [locale]/
│       ├── layout.tsx           # Locale layout: NextIntlClientProvider, Header, Footer
│       ├── page.tsx             # Landing page
│       │
│       ├── (auth)/
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       │
│       ├── search/page.tsx      # ★ Core feature — legal search results
│       ├── ask/page.tsx         # AI Q&A chat interface
│       ├── statutes/
│       │   ├── page.tsx         # Browse all Acts (filterable, paginated)
│       │   └── [id]/page.tsx    # Single statute with sections navigation
│       ├── judgments/
│       │   ├── page.tsx         # Browse judgments (filterable, paginated)
│       │   └── [id]/page.tsx    # Single judgment viewer
│       ├── pricing/page.tsx     # Subscription plans + payment
│       └── profile/page.tsx     # User profile, subscription status, usage
│
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx        # Bilingual input, focus-ring, submit button inline
│   │   ├── SearchResults.tsx    # Results list with skeleton loader state
│   │   ├── ResultCard.tsx       # Left-border accent, relevance bar, hover shadow
│   │   └── FilterPanel.tsx      # Checkbox filters + quick access links
│   │
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Session sidebar + full chat layout
│   │   ├── MessageBubble.tsx    # User bubble (navy) + AI legal memo card
│   │   ├── CitationLink.tsx     # Numbered citation → statute/judgment page
│   │   └── TypingIndicator.tsx  # Animated dots "Analysing law…"
│   │
│   ├── legal/
│   │   ├── StatuteViewer.tsx    # Full statute with section sidebar
│   │   ├── SectionNav.tsx       # Section navigation sidebar
│   │   ├── JudgmentViewer.tsx   # Full judgment with metadata header
│   │   ├── CitationMap.tsx      # Visual citation network
│   │   └── AmendmentHistory.tsx # Timeline of amendments
│   │
│   ├── layout/
│   │   ├── Header.tsx           # White sticky nav, scroll shadow, SVG scales logo
│   │   ├── Footer.tsx           # Dark navy footer, inverted gold logo, 4-column grid
│   │   ├── Sidebar.tsx          # Mobile navigation drawer
│   │   └── LanguageToggle.tsx   # bn ↔ en switch via next-intl router
│   │
│   └── ui/
│       ├── Button.tsx           # primary / secondary / accent / outline / ghost
│       ├── Badge.tsx            # 10 variants: statute, judgment, sro, active, repealed,
│       │                        #   criminal, civil, family, commercial, default
│       ├── Card.tsx             # hoverable prop → shadow + translate-y on hover
│       ├── Input.tsx            # focus-ring, error state, optional suffix slot
│       ├── Loading.tsx          # Skeleton + animated dot loader
│       ├── Modal.tsx
│       ├── Pagination.tsx
│       ├── Select.tsx
│       └── Toast.tsx
│
├── lib/
│   ├── api.ts                   # ApiClient class — JWT bearer, typed get/post
│   ├── auth.ts                  # JWT token management, auth context
│   ├── i18n.ts                  # next-intl configuration
│   ├── types.ts                 # Shared TypeScript interfaces
│   └── utils.ts                 # cn() helper + misc utils
│
├── hooks/
│   ├── useAuth.ts               # Auth state hook
│   ├── useSearch.ts             # Search state + debounce
│   └── useSubscription.ts       # Subscription status hook
│
├── messages/
│   ├── en.json                  # English translations (primary)
│   └── bn.json                  # Bengali translations (secondary)
│
└── public/
    ├── logo.svg
    └── favicon.ico
```

---

## 🎨 Design System

### Visual Direction
**Clean & minimal SaaS** — white-dominant, subtle shadows, professional. Navy is the authority color used for headers and primary actions. Gold is the accent/CTA color. Green signals success/active states.

### Color Palette

```
Primary:    #1E3A5F  (Deep navy)       → bg-primary, text-primary
            #2A5080  (Light navy)      → bg-primary-light (hover)
            #142840  (Dark navy)       → bg-primary-dark, footer bg
Secondary:  #2D7D46  (Bangladesh green) → success, active badges, checkmarks
            #3A9958  (Light green)     → hover states
Accent:     #D4A853  (Gold)           → CTA buttons, logo on dark bg
            #B8903A  (Dark gold)      → hover state
Background: #F8F9FA                   → page bg
Text:       #1A1A2E                   → primary text
Muted:      #6B7280                   → secondary text, placeholders
Border:     #E5E7EB                   → card/input borders
```

### Typography

```
Headings: Inter 800 (extrabold), tracking-tight (-0.025em to -0.03em)
Body:     Inter 400–600
Bengali:  Noto Sans Bengali (applied via font-bengali class)
```

### Spacing & Sizing Scale

```
Header height:     62px  (h-[62px])
Max content width: 1200px (max-w-[1200px])  for header/footer
                   1100px (max-w-[1100px])  for page content
Card padding:      p-5 (20px) or p-6 (24px)
Section padding:   py-[72px] hero sections, py-16 content sections
Border radius:     rounded-xl (12px) cards, rounded-lg (8px) inputs/buttons
```

### Shadows

```css
shadow-card:       0 1px 4px rgba(0,0,0,0.04)         /* resting card */
shadow-card-hover: 0 4px 20px rgba(30,58,95,0.10)     /* card on hover */
shadow-search:     0 8px 40px rgba(0,0,0,0.25)        /* hero search bar */
```

### Logo

The Dhara logo is an **inline SVG** (scales of justice + flowing water lines):
- **Light background** (header): navy `#1E3A5F` rect, gold `#D4A853` scales, green `#2D7D46` flow lines
- **Dark background** (footer): gold `#D4A853` rect, navy `#1E3A5F` "ধ" letter — **inverted**

```tsx
// Header logo — navy bg, gold icon
<svg width="36" height="36" viewBox="0 0 36 36">
  <rect width="36" height="36" rx="9" fill="#1E3A5F"/>
  <line x1="18" y1="10" x2="18" y2="26" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round"/>
  <line x1="10" y1="13" x2="26" y2="13" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M10 13 Q8 17 10 19 Q12 21 14 19 Q16 17 14 13" stroke="#D4A853" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  <path d="M22 13 Q20 17 22 19 Q24 21 26 19 Q28 17 26 13" stroke="#D4A853" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  <path d="M11 27 Q14 25.5 18 27 Q22 28.5 25 27" stroke="#2D7D46" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
</svg>

// Footer logo — gold bg, navy "ধ" letter (inverted)
<div className="w-[34px] h-[34px] bg-accent rounded-[9px] flex items-center justify-center">
  <span className="text-primary font-extrabold text-[17px]">ধ</span>
</div>
```

### Animations (defined in `globals.css`)

```css
.page-enter        /* fade + translateY(10px→0) on page navigation */
.animate-shimmer   /* skeleton pulse */
.animate-bounce-dot /* typing indicator dots */
```

---

## 🧩 Key Component Patterns

### Button variants
```tsx
<Button variant="primary">   // navy bg → used for primary actions
<Button variant="accent">    // gold bg, navy text → used for CTAs
<Button variant="outline">   // transparent, navy border → secondary actions
<Button variant="ghost">     // no border, muted text → tertiary
<Button size="sm|md|lg" full> // full = w-full
```

### Badge variants
```tsx
<Badge variant="statute">    // blue
<Badge variant="judgment">   // orange
<Badge variant="sro">        // violet
<Badge variant="active">     // green
<Badge variant="repealed">   // gray
<Badge variant="criminal">   // red
<Badge variant="civil">      // blue
<Badge variant="family">     // fuchsia
<Badge variant="commercial"> // amber
<Badge variant="default">    // gray
```

### Card
```tsx
<Card hoverable>          // adds hover shadow + -translate-y-px
<Card onClick={fn}>       // cursor-pointer
<Card className="p-6">    // default has no padding — add it per usage
```

### ResultCard design pattern
- Left border `border-l-4` with source-type color (blue=statute, amber=judgment, violet=sro)
- Relevance bar: `w-[60px] h-[5px]` filled with `bg-secondary`
- Title changes to `text-primary` on hover via `group-hover:text-primary`

### AI Chat — Legal Memo Style
AI responses render as a **document card** (not a chat bubble):
```
┌─ navy header bar ──────────────────────────────────┐
│  LEGAL ANALYSIS MEMO                    REF-XXXX  │
│  Legal Analysis — {first 48 chars of answer}       │
├────────────────────────────────────────────────────┤
│  Answer paragraphs (split on \n\n)                 │
│                                                    │
│  SOURCES & CITATIONS                               │
│  [1]  Penal Code 1860, § 302                       │
│  [2]  State vs. Rafiqul Islam, Cr. Appeal 2214/2022│
└────────────────────────────────────────────────────┘
```
User messages render as navy right-aligned bubbles (`rounded-[12px_12px_3px_12px]`).

### Header pattern
- `sticky top-0 z-50 bg-white`
- Border + shadow appear only after scroll (`scrolled` state via `window.scrollY > 8`)
- Active nav link: `bg-blue-50 text-primary font-semibold rounded-lg`
- Inactive: `text-muted hover:text-foreground hover:bg-gray-50`

### Footer pattern
- Background: `bg-[#142840]` (primary-dark)
- 4-column grid: brand column + 3 link columns
- Bottom bar: `border-t border-primary` (slightly lighter than footer bg)

---

## 📐 Code Conventions

### TypeScript

```typescript
// ✅ Use interfaces for object shapes
interface ResultCardProps {
  result: SearchResult;
}

// ❌ NEVER use `any`
const data: any = await response.json();  // WRONG

// ✅ Type everything
const data: ApiResponse<StatuteResponse> = await response.json();
```

### Styling (Tailwind Only)

```typescript
// ✅ Tailwind utility classes only
<div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-card">

// ❌ NEVER use inline styles or CSS modules
<div style={{ display: "flex" }}>           // WRONG
import styles from "./Card.module.css";      // WRONG

// ✅ Exception: pixel-precise one-off values use bracket notation
<div className="max-w-[1100px] h-[62px] text-[13px]">

// ✅ Exception: globals.css for @layer base and @keyframes only
```

### Server vs Client Components

```typescript
// ✅ Server Component (default) — data fetching pages
export default async function StatutesPage() {
  const statutes = await fetchStatutes();   // direct fetch, no ApiClient
  return <StatuteList statutes={statutes} />;
}

// ✅ Client Component — interactivity
"use client";
export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  // ...
}
```

### API calls

```typescript
// Server Components → use fetch() directly
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/statutes?page=0&size=50`,
  { next: { revalidate: 60 } }
);

// Client Components → use ApiClient (sets JWT bearer automatically)
import { api } from "@/lib/api";
const data = await api.post<ApiResponse<AskResponse>>("/api/ask", { question });
```

---

## 🌐 Internationalization (i18n)

- **Language priority:** English-primary UI, Bengali secondary
- **NEVER hardcode user-facing text** — always use `t("key")`
- **`dir="auto"`** on all text inputs (critical for Bengali RTL detection)
- **`font-bengali`** class on Bengali-specific text nodes

```typescript
"use client";
import { useTranslations } from "next-intl";

export default function SomeComponent() {
  const t = useTranslations("search");
  return <p>{t("results", { count: 42 })}</p>;
}
```

### i18n namespaces in use
| Namespace   | Usage |
|-------------|-------|
| `common`    | appName, tagline |
| `nav`       | search, ask, statutes, judgments, pricing, login, register |
| `search`    | placeholder, startSearching, results, noResults |
| `ask`       | placeholder |
| `features`  | title, aiSearch.title/description, caseAnalysis, bilingual, citations |
| `legal`     | statute, judgment, section, activeLaw, repealed, sections, browseSections, fullText |
| `pricing`   | title, subtitle, subscribe, {plan}.name/price/period/features |
| `auth`      | login, register form labels |

---

## 🔗 API Client (`lib/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiClient {
  private token: string | null = null;

  setToken(token: string) { this.token = token; }
  clearToken() { this.token = null; }

  async get<T>(path: string): Promise<ApiResponse<T>> { ... }
  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> { ... }
}

export const api = new ApiClient();
```

Auth tokens are stored in `localStorage` as `"access_token"` and set on `api` via `api.setToken(token)`.

---

## ⚠️ Common Pitfalls

1. **Server vs Client Components** — Default is Server. Only add `"use client"` for interactivity.
2. **Bengali font** — Use `font-bengali` class on Bengali text nodes. Without it text may render incorrectly.
3. **`dir="auto"` on inputs** — Critical for Bengali text input to display correctly.
4. **API calls from Server Components** — Use `fetch()` directly, NOT the `ApiClient` class.
5. **Environment variables** — Client-side vars must be `NEXT_PUBLIC_` prefixed.
6. **next-intl SSR** — Locale provider must wrap the entire app in `[locale]/layout.tsx`.
7. **Hydration mismatches** — No `Date.now()` or `Math.random()` in Server Components.
8. **Image optimization** — Use `next/image` for all images.
9. **Card padding** — `Card` component has no default padding; always add `className="p-5"` or `p-6`.
10. **Logo on dark backgrounds** — Use inverted logo (gold bg + navy "ধ"), not the SVG scales version.
11. **Page transitions** — Add `page-enter` class to `<main>` wrapper in locale layout for fade-in effect.

---

## 🗺️ Codebase Knowledge Graph (RAG Reference)

Use `graphify-out/` at the project root as a fast lookup index before reading frontend files cold.

**Frontend-relevant communities in `graphify-out/GRAPH_REPORT.md`:**
- **Community 0 — Frontend API Client:** `ApiClient`, `ApiError` — maps to `frontend/lib/api.ts`
- **Community 2 — RAG Ask Pipeline:** `AskRequest`, `AskResponse`, `Citation` — consumed by `app/ask/page.tsx` and `components/chat/`

---

## 🧪 Testing

```bash
npm test                    # Vitest
npm run test:watch
npm run test:coverage
```

---

## Important Notes
- **Memory Updates (THIS FILE):** Always update with new knowledge, design decisions, and lessons learned — even if not explicitly asked. Condense into appropriate sections. Keep organized and non-redundant.
- **Design system is locked** — Do not deviate from the color palette, shadow scale, or component patterns above without updating this file.
- **Redesign applied April 2026** — All components in `frontend-redesign/` folder are the canonical new versions. The visual direction is Clean & Minimal SaaS (white-dominant, navy authority, gold accent).
