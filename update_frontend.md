# LLB-Buddy — Frontend Features & Required Backend APIs

> **Purpose:** This document maps every frontend feature in LLB-Buddy to the exact backend API it requires. Use this as the specification to build the backend.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Authentication](#1-authentication)
3. [User Profile](#2-user-profile)
4. [Document Management (Dashboard)](#3-document-management-dashboard)
5. [Document Editor](#4-document-editor)
6. [Templates](#5-templates)
7. [AI Legal Analysis](#6-ai-legal-analysis)
8. [BD Legal Library](#7-bd-legal-library)
9. [Document Verification](#8-document-verification)
10. [File Export](#9-file-export)
11. [Data Schemas](#10-data-schemas)
12. [Auth & Session Rules](#11-auth--session-rules)
13. [Error Response Format](#12-error-response-format)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Tailwind CSS, Vanilla JavaScript |
| Auth storage (current) | `localStorage` key: `llb_user` |
| File handling | Drag-and-drop, FileReader API |
| Editor | `contenteditable` + `document.execCommand()` |
| Export (current) | Simulated — needs real backend |

All pages that require login call a local `requireAuth()` guard. The guard reads `llb_user` from localStorage. Replace this with JWT/session-based auth.

---

## 1. Authentication

**Pages:** `login.html`, `signup.html`

### Current Behavior
- Any email + any password is accepted (demo mode)
- User object is written to `localStorage` on login

### Required APIs

#### `POST /api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

**Success Response `201`:**
```json
{
  "token": "jwt_string",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801XXXXXXXXX",
    "plan": "Free",
    "createdAt": "2024-02-01T00:00:00Z"
  }
}
```

---

#### `POST /api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": true
}
```

**Success Response `200`:**
```json
{
  "token": "jwt_string",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801XXXXXXXXX",
    "plan": "Free",
    "createdAt": "2024-02-01T00:00:00Z"
  }
}
```

---

#### `POST /api/auth/logout`
Invalidate the session/token.

**Headers:** `Authorization: Bearer <token>`

**Success Response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

#### `POST /api/auth/social-login`
OAuth login via Google or Facebook (button exists on login page).

**Request Body:**
```json
{
  "provider": "google | facebook",
  "token": "oauth_token_from_provider"
}
```

**Success Response `200`:** Same shape as `/api/auth/login`.

---

#### `GET /api/auth/me`
Return the currently authenticated user (used on page load to restore session).

**Headers:** `Authorization: Bearer <token>`

**Success Response `200`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+8801XXXXXXXXX",
  "plan": "Free",
  "createdAt": "2024-02-01T00:00:00Z"
}
```

---

## 2. User Profile

**Pages:** `dashboard.html` (user menu), profile/settings pages (linked but not yet built)

### Required APIs

#### `PUT /api/users/me`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body (partial update accepted):**
```json
{
  "name": "string",
  "phone": "string",
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Success Response `200`:** Updated user object.

---

## 3. Document Management (Dashboard)

**Page:** `dashboard.html`

### Features
- List all documents in grid or list view
- Stats bar: Total, Drafts, Completed, Shared counts
- Search by title or tags
- Filter by category (`contract`, `employment`, `nda`, `lease`, `other`)
- Filter by status (`draft`, `completed`, `shared`)
- Delete, Duplicate, Share documents

### Required APIs

#### `GET /api/documents`
Fetch all documents for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by title or tags |
| `category` | string | `contract`, `employment`, `nda`, `lease`, `other` |
| `status` | string | `draft`, `completed`, `shared` |
| `page` | int | Pagination page (default: 1) |
| `limit` | int | Items per page (default: 20) |

**Success Response `200`:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Employment Contract - Sarah Johnson",
      "category": "employment",
      "status": "completed",
      "createdAt": "2024-02-01T00:00:00Z",
      "modifiedAt": "2024-02-05T00:00:00Z",
      "tags": ["HR", "Full-time"],
      "shared": true
    }
  ],
  "stats": {
    "total": 24,
    "drafts": 5,
    "completed": 18,
    "shared": 6
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24
  }
}
```

---

#### `DELETE /api/documents/:id`
Delete a document.

**Headers:** `Authorization: Bearer <token>`

**Success Response `200`:**
```json
{ "message": "Document deleted" }
```

---

#### `POST /api/documents/:id/duplicate`
Clone an existing document.

**Headers:** `Authorization: Bearer <token>`

**Success Response `201`:** The newly created duplicate document object.

---

#### `POST /api/documents/:id/share`
Share a document and get a shareable link.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "permission": "view | edit | comment",
  "email": "optional_email_to_notify@example.com"
}
```

**Success Response `200`:**
```json
{
  "shareUrl": "https://llb-buddy.app/shared/abc123",
  "expiresAt": "2024-03-01T00:00:00Z"
}
```

---

## 4. Document Editor

**Page:** `editor.html`

### Features
- Create new document from a template or blank
- Rich text editing (bold, italic, underline, headings, lists, alignment)
- Smart field autofill sidebar (party names, dates, addresses, amounts, signatures)
- Clause library sidebar (12+ prebuilt legal clauses)
- Word count display
- Auto-save every 2 seconds
- Manual save
- Export to PDF / DOCX / TXT

### Required APIs

#### `POST /api/documents`
Create a new document.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "category": "string",
  "templateId": "optional_int",
  "content": "<html string>"
}
```

**Success Response `201`:**
```json
{
  "id": 42,
  "title": "New Employment Contract",
  "category": "employment",
  "status": "draft",
  "content": "<html>...</html>",
  "createdAt": "2024-02-10T00:00:00Z",
  "modifiedAt": "2024-02-10T00:00:00Z"
}
```

---

#### `GET /api/documents/:id`
Load full document content for editing.

**Headers:** `Authorization: Bearer <token>`

**Success Response `200`:**
```json
{
  "id": 42,
  "title": "Employment Contract - Sarah Johnson",
  "category": "employment",
  "status": "draft",
  "content": "<html>...</html>",
  "tags": ["HR"],
  "shared": false,
  "createdAt": "2024-02-01T00:00:00Z",
  "modifiedAt": "2024-02-05T00:00:00Z"
}
```

---

#### `PUT /api/documents/:id`
Save document changes (auto-save + manual save both call this).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "content": "<html string>",
  "status": "draft | completed"
}
```

**Success Response `200`:**
```json
{
  "id": 42,
  "modifiedAt": "2024-02-10T12:34:56Z"
}
```

---

#### `GET /api/clauses`
Fetch the available legal clause library.

**Success Response `200`:**
```json
{
  "clauses": [
    {
      "id": 1,
      "title": "Confidentiality Clause",
      "category": "general",
      "content": "<h3>CONFIDENTIALITY</h3><p>...</p>"
    }
  ]
}
```

**Clause categories:** `general`, `employment`, `contract`

**Clause titles (12 minimum):**
1. Confidentiality
2. Indemnification
3. Force Majeure
4. Termination
5. Governing Law
6. Non-Compete
7. Intellectual Property
8. Limitation of Liability
9. Payment Terms
10. Warranty Disclaimer
11. Dispute Resolution
12. Entire Agreement

---

## 5. Templates

**Page:** `templates.html`

### Features
- Browse 50+ legal document templates
- Filter by category
- Preview template HTML content
- Open in editor (creates new document from template)

### Required APIs

#### `GET /api/templates`
Fetch all available templates.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `category` | string | `employment`, `contract`, `real-estate`, `business`, `personal` |
| `search` | string | Filter by title |

**Success Response `200`:**
```json
{
  "templates": [
    {
      "id": 1,
      "title": "Standard Employment Contract",
      "category": "employment",
      "description": "Comprehensive employment agreement...",
      "popularity": 95,
      "preview": "<html>...</html>"
    }
  ]
}
```

---

#### `GET /api/templates/:id`
Fetch full template content (called when user clicks "Use Template").

**Success Response `200`:** Single template object with full `content` HTML.

---

## 6. AI Legal Analysis

**Page:** `analysis.html` — "Upload & Analyze" tab

### Features
- Upload a legal document (PDF / DOC / DOCX / TXT, max 10 MB)
- Display extracted text or document summary
- Chat interface to ask questions about the uploaded document
- Quick question buttons (pre-built queries)
- Streaming or standard JSON response

### Required APIs

#### `POST /api/analysis/upload`
Upload a document for analysis.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Fields:**
| Field | Type | Description |
|---|---|---|
| `file` | File | PDF / DOC / DOCX / TXT, max 10 MB |

**Success Response `200`:**
```json
{
  "sessionId": "abc123",
  "fileName": "employment_contract.pdf",
  "pageCount": 5,
  "wordCount": 2400,
  "extractedText": "optional preview of extracted text"
}
```

---

#### `POST /api/analysis/query`
Send a user question about the uploaded document.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sessionId": "abc123",
  "query": "What are the termination conditions in this contract?",
  "language": "en | bn"
}
```

**Success Response `200`:**
```json
{
  "answer": "The contract specifies a 120-day notice period for termination under Section 3.2...",
  "references": [
    {
      "law": "Bangladesh Labour Act 2006",
      "section": "Section 20",
      "relevance": "Minimum notice requirement"
    }
  ],
  "confidence": 0.92
}
```

**Quick question templates (frontend has these buttons):**
- "What is the main purpose of this document?"
- "Who are the parties involved?"
- "What are the key obligations?"
- "Are there any penalty clauses?"
- "What is the governing law?"
- "What are the payment terms?"

---

## 7. BD Legal Library

**Page:** `analysis.html` — "BD Legal Library" tab

### Features
- Browse 12 major Bangladesh laws
- Filter by category
- Read full law content
- Search within laws

### Required APIs

#### `GET /api/legal-library`
Fetch the list of Bangladesh legal documents.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `category` | string | `constitution`, `criminal`, `civil`, `commercial`, `family`, `property`, `labor` |
| `search` | string | Search by title or content |

**Success Response `200`:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "The Constitution of Bangladesh",
      "category": "constitution",
      "year": 1972,
      "description": "The supreme law of the People's Republic of Bangladesh.",
      "icon": "📜"
    }
  ]
}
```

**Required laws (12 minimum):**

| # | Law | Year | Category |
|---|---|---|---|
| 1 | Constitution of Bangladesh | 1972 | constitution |
| 2 | Penal Code | 1860 | criminal |
| 3 | Code of Criminal Procedure | 1898 | criminal |
| 4 | Contract Act | 1872 | civil |
| 5 | Muslim Family Laws Ordinance | 1961 | family |
| 6 | Transfer of Property Act | 1882 | property |
| 7 | Bangladesh Labour Act | 2006 | labor |
| 8 | Companies Act | 1994 | commercial |
| 9 | Evidence Act | 1872 | civil |
| 10 | Specific Relief Act | 1877 | civil |
| 11 | Succession Act | 1865 | civil |
| 12 | Registration Act | 1908 | property |

---

#### `GET /api/legal-library/:id`
Fetch full content of a specific legal document.

**Success Response `200`:**
```json
{
  "id": 1,
  "title": "The Constitution of Bangladesh",
  "category": "constitution",
  "year": 1972,
  "content": "<html full text of the law...>",
  "sections": [
    { "id": "s1", "title": "Part I: The Republic", "anchor": "#part-1" }
  ]
}
```

---

## 8. Document Verification

**Page:** `analysis.html` — "Verify Document" tab

### Features
- Upload a document for legal compliance verification
- Returns color-coded results:
  - **Green** — compliant clause with relevant law citation
  - **Yellow** — warning / potential issue
  - **Red** — non-compliant / must fix
- Summary counts for each severity level

### Required APIs

#### `POST /api/analysis/verify`
Verify a document against Bangladesh laws.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Fields:**
| Field | Type | Description |
|---|---|---|
| `file` | File | Document to verify |
| `documentType` | string | `employment`, `lease`, `nda`, `contract`, `other` |

**Success Response `200`:**
```json
{
  "documentType": "employment",
  "summary": {
    "valid": 8,
    "warnings": 3,
    "issues": 2
  },
  "results": {
    "valid": [
      {
        "section": "Working Hours",
        "text": "8 hours per day, 6 days per week",
        "law": "Bangladesh Labour Act 2006",
        "lawSection": "Section 100",
        "suggestion": "Complies with the maximum working hours provision."
      }
    ],
    "warnings": [
      {
        "section": "Salary Payment",
        "text": "Salary disbursed on the 5th of each month",
        "law": "Bangladesh Labour Act 2006",
        "lawSection": "Section 122",
        "suggestion": "Ensure payment within 7 working days of month end."
      }
    ],
    "issues": [
      {
        "section": "Termination Notice",
        "text": "15 days notice period",
        "law": "Bangladesh Labour Act 2006",
        "lawSection": "Section 20",
        "suggestion": "Non-compliant. Minimum notice period is 120 days for permanent employees."
      }
    ]
  }
}
```

---

## 9. File Export

**Page:** `editor.html` (Export modal)

### Features
- Export current document as **PDF**, **DOCX**, or **TXT**
- File downloads directly in the browser

### Required APIs

#### `POST /api/documents/:id/export`
Generate and return a downloadable file.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "format": "pdf | docx | txt"
}
```

**Success Response `200`:**
- `Content-Type`: `application/pdf` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `text/plain`
- `Content-Disposition`: `attachment; filename="document-title.pdf"`
- Body: binary file stream

---

## 10. Data Schemas

### User
```json
{
  "id": "int",
  "name": "string",
  "email": "string",
  "phone": "string (BD format: +8801XXXXXXXXX)",
  "plan": "Free | Professional | Enterprise",
  "createdAt": "ISO 8601 datetime"
}
```

### Document
```json
{
  "id": "int",
  "userId": "int",
  "title": "string",
  "category": "contract | employment | nda | lease | other",
  "status": "draft | completed | shared",
  "content": "HTML string",
  "tags": ["string"],
  "shared": "boolean",
  "shareUrl": "string | null",
  "createdAt": "ISO 8601 datetime",
  "modifiedAt": "ISO 8601 datetime"
}
```

### Template
```json
{
  "id": "int",
  "title": "string",
  "category": "employment | contract | real-estate | business | personal",
  "description": "string",
  "popularity": "int (0–100)",
  "content": "HTML string",
  "preview": "HTML string (first ~500 chars)"
}
```

### Clause
```json
{
  "id": "int",
  "title": "string",
  "category": "general | employment | contract",
  "content": "HTML string"
}
```

### Legal Library Entry
```json
{
  "id": "int",
  "title": "string",
  "category": "constitution | criminal | civil | commercial | family | property | labor",
  "year": "int",
  "description": "string",
  "content": "HTML string",
  "icon": "emoji string"
}
```

---

## 11. Auth & Session Rules

- All protected endpoints require `Authorization: Bearer <token>` header.
- Protected pages: `dashboard.html`, `editor.html`, `analysis.html`
- Public pages: `index.html`, `login.html`, `signup.html`, `templates.html`
- On `401 Unauthorized`, the frontend redirects to `login.html`.
- After login, the frontend redirects to the originally requested page (stored in `sessionStorage` key: `redirectAfterLogin`).
- Token must be stored in `localStorage` key: `llb_user` as `{ token, user }` object (or adjust `auth.js` to read from wherever the backend sets it).

---

## 12. Error Response Format

All error responses must follow this shape:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The requested document does not exist or you do not have permission to access it."
  }
}
```

### Common Error Codes

| HTTP Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Valid token but no permission |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Email already registered |
| 413 | `FILE_TOO_LARGE` | Upload exceeds 10 MB |
| 415 | `UNSUPPORTED_FILE_TYPE` | File type not allowed |
| 500 | `INTERNAL_ERROR` | Server error |

---

## API Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Register user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/social-login` | No | Google/Facebook login |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/users/me` | Yes | Update profile |
| GET | `/api/documents` | Yes | List documents |
| POST | `/api/documents` | Yes | Create document |
| GET | `/api/documents/:id` | Yes | Get document |
| PUT | `/api/documents/:id` | Yes | Update document |
| DELETE | `/api/documents/:id` | Yes | Delete document |
| POST | `/api/documents/:id/duplicate` | Yes | Duplicate document |
| POST | `/api/documents/:id/share` | Yes | Share document |
| POST | `/api/documents/:id/export` | Yes | Export as PDF/DOCX/TXT |
| GET | `/api/clauses` | No | List clause library |
| GET | `/api/templates` | No | List templates |
| GET | `/api/templates/:id` | No | Get template content |
| POST | `/api/analysis/upload` | Yes | Upload doc for analysis |
| POST | `/api/analysis/query` | Yes | AI query on doc |
| POST | `/api/analysis/verify` | Yes | Verify doc compliance |
| GET | `/api/legal-library` | No | List BD laws |
| GET | `/api/legal-library/:id` | No | Get full law content |
