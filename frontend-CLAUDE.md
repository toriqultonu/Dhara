# CLAUDE.md — Dhara Frontend (Next.js 15)

> **Service:** `frontend/` — Next.js 15 + TypeScript + Tailwind CSS
> **Role:** SSR web app — search, AI Q&A, statute/judgment browser, document management, subscriptions, i18n
> **Port:** 3000

---

## 📌 Service Responsibilities

1. **Landing Page** — Product intro, feature showcase, CTA to signup
2. **Legal Search** — Core feature: bilingual search bar with AI-powered results
3. **AI Q&A Chat** — Chat interface for legal questions with cited answers
4. **Statute Browser** — Browse Acts/Ordinances, drill into sections, amendment history
5. **Judgment Viewer** — Case details, full text, citation mapping, related cases
6. **Auth** — Login, register, profile management
7. **Subscriptions** — Pricing page, plan selection, SSLCommerz/bKash payment
8. **i18n** — Full Bengali (bn) + English (en) support with language toggle
9. **Document Management** — User creates/edits legal documents with rich text editor, clause library, smart fields, auto-save
10. **Legal Document Templates** — 50+ templates (employment, contract, NDA, real-estate, business, personal) to start from
11. **Document Analysis** — Upload PDF/DOC/TXT, run AI Q&A against the document content
12. **Document Verification** — Check uploaded document compliance against Bangladesh laws (green/yellow/red results)
13. **File Export** — Export user documents as PDF, DOCX, or TXT

---

## 🏗️ Directory Structure

```
frontend/
├── CLAUDE.md                    ← YOU ARE HERE
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json                # strict: true
│
├── app/
│   ├── layout.tsx               # Root layout: fonts, providers, metadata
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Tailwind @layer base styles only
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── search/
│   │   └── page.tsx             # ★ Core feature — legal search results
│   │
│   ├── ask/
│   │   └── page.tsx             # AI Q&A chat interface
│   │
│   ├── statutes/
│   │   ├── page.tsx             # Browse all Acts (filterable, paginated)
│   │   └── [id]/
│   │       └── page.tsx         # Single statute with sections navigation
│   │
│   ├── judgments/
│   │   ├── page.tsx             # Browse judgments (filterable, paginated)
│   │   └── [id]/
│   │       └── page.tsx         # Single judgment viewer
│   │
│   ├── pricing/
│   │   └── page.tsx             # Subscription plans + payment
│   │
│   ├── profile/
│   │   └── page.tsx             # User profile, subscription status, usage
│   │
│   ├── documents/
│   │   ├── page.tsx             # ★ Document management dashboard (list, stats, filter)
│   │   └── [id]/
│   │       └── page.tsx         # Document editor (rich text, clause library, auto-save, export)
│   │
│   ├── templates/
│   │   └── page.tsx             # ★ Legal document templates browser (50+ templates)
│   │
│   └── analysis/
│       └── page.tsx             # ★ 3-tab: Upload&Analyze | Verify | BD Legal Library
│
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx        # Bilingual input with autocomplete
│   │   ├── SearchResults.tsx    # Results list container
│   │   ├── ResultCard.tsx       # Individual result card with snippet
│   │   └── FilterPanel.tsx      # Filter by type (statute/judgment/sro), year, court
│   │
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Full chat layout
│   │   ├── MessageBubble.tsx    # User/AI message bubble
│   │   ├── CitationLink.tsx     # Clickable citation → statute/judgment page
│   │   └── TypingIndicator.tsx  # AI thinking animation
│   │
│   ├── legal/
│   │   ├── StatuteViewer.tsx    # Full statute with section sidebar
│   │   ├── SectionNav.tsx       # Section navigation sidebar
│   │   ├── JudgmentViewer.tsx   # Full judgment with metadata header
│   │   ├── CitationMap.tsx      # Visual citation network
│   │   └── AmendmentHistory.tsx # Timeline of amendments
│   │
│   ├── layout/
│   │   ├── Header.tsx           # Nav + language toggle + auth buttons
│   │   ├── Footer.tsx           # Links, copyright
│   │   ├── Sidebar.tsx          # Mobile navigation drawer
│   │   └── LanguageToggle.tsx   # bn ↔ en switch
│   │
│   ├── documents/               # Document management components
│   │   ├── DocumentCard.tsx     # Document list card with actions (delete/duplicate/share)
│   │   ├── DocumentEditor.tsx   # Rich text editor (toolbar, auto-save, word count)
│   │   ├── ClauseLibrarySidebar.tsx  # 12+ prebuilt legal clauses — insert into editor
│   │   ├── SmartFieldsSidebar.tsx    # Placeholder fields (party names, dates, amounts)
│   │   └── ExportModal.tsx      # Export PDF/DOCX/TXT modal
│   │
│   ├── templates/               # Template browser components
│   │   ├── TemplateCard.tsx     # Template card with preview & use buttons
│   │   └── TemplatePreviewModal.tsx  # Full template preview in modal
│   │
│   ├── analysis/                # Document analysis components
│   │   ├── DocumentUploadZone.tsx    # Drag-and-drop file upload
│   │   ├── AnalysisChat.tsx     # Chat interface for AI Q&A on uploaded document
│   │   └── VerificationResults.tsx  # Color-coded compliance results (green/yellow/red)
│   │
│   └── ui/                      # Shared design system primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx            # Supports both `open` and `isOpen` props, optional `title`
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       ├── Loading.tsx
│       ├── Pagination.tsx
│       └── Toast.tsx
│
├── lib/
│   ├── api.ts                   # API client (fetch/axios) to Spring Boot backend
│   ├── auth.ts                  # JWT token management, auth context
│   ├── i18n.ts                  # next-intl configuration
│   ├── types.ts                 # Shared TypeScript interfaces
│   └── utils.ts                 # Helper functions
│
├── hooks/
│   ├── useAuth.ts               # Auth state hook
│   ├── useSearch.ts             # Search state + debounce
│   └── useSubscription.ts      # Subscription status hook
│
├── messages/
│   ├── en.json                  # English translations
│   └── bn.json                  # Bengali translations
│
└── public/
    ├── logo.svg                 # Dhara brand logo
    └── favicon.ico
```

---

## 📐 Code Conventions

### TypeScript

```typescript
// ✅ Use interfaces for object shapes
interface StatuteResponse {
  id: number;
  actNumber: string;
  titleEn: string;
  titleBn: string;
  year: number;
  category: string;
  status: string;
  effectiveDate: string | null;
  sourceUrl: string | null;
}

// ✅ Use interface for component props
interface ResultCardProps {
  result: SearchResult;
  language: "bn" | "en";
  onCitationClick: (id: number, type: string) => void;
}

// ❌ NEVER use `any`
const data: any = await response.json();  // WRONG

// ✅ Type everything
const data: ApiResponse<StatuteResponse> = await response.json();
```

### API Response Types

```typescript
// Must match backend's ApiResponse<T>
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Usage
const response = await api.get<ApiResponse<PagedResponse<StatuteResponse>>>("/api/statutes?page=0&size=20");
if (response.data.success) {
  const statutes = response.data.data.items;
}
```

### Components

```typescript
// ✅ Server Component (default) — for data fetching
// app/statutes/page.tsx
export default async function StatutesPage() {
  const statutes = await fetchStatutes();
  return <StatuteList statutes={statutes} />;
}

// ✅ Client Component — for interactivity
// components/search/SearchBar.tsx
"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function SearchBar({ onSearch }: SearchBarProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(() => {
    if (query.trim()) onSearch(query);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")} // i18n: "আইনি প্রশ্ন লিখুন..." or "Type your legal question..."
        className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
        dir="auto" // Auto RTL/LTR for Bengali/English
      />
    </div>
  );
}
```

### Styling (Tailwind Only)

```typescript
// ✅ Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">

// ❌ NEVER use inline styles or CSS modules
<div style={{ display: "flex" }}>           // WRONG
import styles from "./Card.module.css";      // WRONG

// Exception: globals.css for @layer base styles
```

---

## 🌐 Internationalization (i18n)

### Setup with `next-intl`

```typescript
// messages/en.json
{
  "common": {
    "appName": "Dhara",
    "tagline": "AI flowing through the law"
  },
  "search": {
    "placeholder": "Type your legal question...",
    "results": "{count} results found",
    "noResults": "No results found for your query."
  },
  "legal": {
    "statute": "Statute",
    "judgment": "Judgment",
    "section": "Section",
    "activeLaw": "Active Law",
    "repealed": "Repealed"
  }
}

// messages/bn.json
{
  "common": {
    "appName": "ধারা",
    "tagline": "আইনের ধারায় AI"
  },
  "search": {
    "placeholder": "আইনি প্রশ্ন লিখুন...",
    "results": "{count}টি ফলাফল পাওয়া গেছে",
    "noResults": "আপনার প্রশ্নের কোনো ফলাফল পাওয়া যায়নি।"
  },
  "legal": {
    "statute": "আইন",
    "judgment": "রায়",
    "section": "ধারা",
    "activeLaw": "বলবৎ আইন",
    "repealed": "বাতিল"
  }
}
```

### Usage in Components

```typescript
"use client";
import { useTranslations } from "next-intl";

export default function SomeComponent() {
  const t = useTranslations("search");

  return <p>{t("results", { count: 42 })}</p>;
  // en → "42 results found"
  // bn → "৪২টি ফলাফল পাওয়া গেছে"
}
```

### Rules

- **NEVER hardcode user-facing text** — always use `t("key")`
- **Legal terms:** Maintain translations in `legal` namespace
- **Numbers:** Bengali numerals are handled by `next-intl` formatting
- **Direction:** Use `dir="auto"` on text inputs for Bengali/English
- **Font:** Use a font that supports Bengali (e.g., Noto Sans Bengali + Inter)

---

## 🔗 API Client (`lib/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiClient {
  private token: string | null = null;

  setToken(token: string) { this.token = token; }
  clearToken() { this.token = null; }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new ApiError(response.status, error.error || "Request failed");
    }

    return response.json();
  }

  // Typed convenience methods
  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }
}

export const api = new ApiClient();
```

---

## 🎨 Design System

### Color Palette

```
Primary:    #1E3A5F (Deep navy — legal authority)
Secondary:  #2D7D46 (Bangladesh green)
Accent:     #D4A853 (Gold — premium feel)
Background: #F8F9FA (Light gray)
Text:       #1A1A2E (Near black)
Muted:      #6B7280 (Gray-500)
```

### Typography

```
Headings: Inter (Latin) + Noto Sans Bengali (Bangla)
Body:     Inter (Latin) + Noto Sans Bengali (Bangla)
Code:     JetBrains Mono
```

### Key UI Components

- **SearchBar:** Large, centered, prominent — this is the core UX. Auto-detects Bengali/English.
- **ResultCard:** Shows source type badge (Statute/Judgment/SRO), title, snippet, relevance score.
- **ChatInterface:** WhatsApp-style bubbles, citations appear as inline links.
- **StatuteViewer:** Left sidebar for section nav, main area for section content.
- **JudgmentViewer:** Metadata header (case name, bench, date), full text with highlighted citations.

---

## 🧪 Testing

```bash
npm test                    # Run all tests (Vitest)
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Test Examples

```typescript
// components/search/__tests__/SearchBar.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import SearchBar from "../SearchBar";
import messages from "@/messages/en.json";

describe("SearchBar", () => {
  const onSearch = vi.fn();

  it("renders with English placeholder", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SearchBar onSearch={onSearch} />
      </NextIntlClientProvider>
    );
    expect(screen.getByPlaceholderText("Type your legal question...")).toBeInTheDocument();
  });

  it("calls onSearch when submitted", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SearchBar onSearch={onSearch} />
      </NextIntlClientProvider>
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Section 302" } });
    fireEvent.submit(input.closest("form")!);
    expect(onSearch).toHaveBeenCalledWith("Section 302");
  });
});
```

---

## 🗺️ Codebase Knowledge Graph (RAG Reference)

Use `graphify-out/` at the project root as a fast lookup index before reading frontend files cold.

**Frontend-relevant communities in `graphify-out/GRAPH_REPORT.md`:**
- **Community 0 — Frontend API Client:** `ApiClient`, `ApiError` — maps to `frontend/lib/api.ts`
- **Community 2 — RAG Ask Pipeline:** `AskRequest`, `AskResponse`, `Citation` — the types consumed by `app/ask/page.tsx` and `components/chat/`

**Key frontend files indexed in `graphify-out/manifest.json`** (use timestamps to detect staleness):
- All `frontend/app/**` pages, `frontend/components/**`, `frontend/lib/**`, `frontend/hooks/**`

To find which component files relate to a UI concept (e.g. `SearchBar`, `CitationLink`), search `graphify-out/graph.json` by `label`. Filter edges by `source` path prefix `frontend\\` to stay scoped to frontend nodes only.

---

## ⚠️ Common Pitfalls

1. **Server vs Client Components** — Default is Server Component. Only add `"use client"` for interactivity (useState, event handlers, browser APIs).
2. **Bengali font loading** — Include Noto Sans Bengali in `next/font` config. Without it, Bengali text may render incorrectly.
3. **`dir="auto"` on inputs** — Critical for Bengali text input to display correctly.
4. **API calls from Server Components** — Use `fetch()` directly (not the ApiClient class, which is for client components).
5. **Environment variables** — Client-side vars must be prefixed `NEXT_PUBLIC_`. Server-only vars have no prefix.
6. **next-intl SSR** — Ensure locale provider wraps the entire app in `layout.tsx`.
7. **Hydration mismatches** — Don't use `Date.now()` or `Math.random()` in Server Components.
8. **Image optimization** — Use `next/image` for all images (auto WebP, lazy loading).


## Important Notes:
- Memory Updates(THIS FILE): This file is my persistent memory. Always update this file with new knowledge, insights, lessons learned, and, or context gained  during our conversations -
  even if I don't explicitly ask you to. The only time you should NOT update it is if I explicitly tell you not to. Condense new information into the appropriate section, or create a new section if needed.Keep it organized and non-redundant.
