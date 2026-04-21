export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface StatuteListResponse {
  id: number;
  actNumber: string;
  titleEn: string;
  titleBn: string;
  year: number;
  category: string;
  status: string;
}

export interface StatuteResponse {
  id: number;
  actNumber: string;
  titleEn: string;
  titleBn: string;
  year: number;
  category: string;
  status: string;
  effectiveDate: string | null;
  sourceUrl: string | null;
  createdAt: string;
}

export interface SectionResponse {
  id: number;
  sectionNumber: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  status: string;
}

export interface JudgmentListResponse {
  id: number;
  caseName: string;
  citation: string;
  court: string;
  judgmentDate: string | null;
  status: string;
}

export interface JudgmentResponse {
  id: number;
  caseName: string;
  citation: string;
  court: string;
  bench: string;
  judgmentDate: string | null;
  headnotesEn: string;
  headnotesBn: string;
  fullText: string;
  sourceUrl: string | null;
  status: string;
  createdAt: string;
}

export interface SroResponse {
  id: number;
  sroNumber: string;
  titleEn: string;
  titleBn: string;
  gazetteDate: string | null;
  issuingMinistry: string;
  sourceUrl: string | null;
  status: string;
}

export interface SearchResult {
  sourceType: string;
  sourceId: number;
  title: string;
  snippet: string;
  score: number;
  metadata: Record<string, string>;
}

export interface SearchResponse {
  results: SearchResult[];
  searchTimeMs: number;
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
  llmProvider: string;
  tokensUsed: number;
  costUsd: number;
}

export interface Citation {
  sourceType: string;
  sourceId: number;
  title: string;
  sectionNumber?: string;
  snippet: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  barCouncilId?: string;
}

export interface PlanResponse {
  id: number;
  name: string;
  displayNameEn: string;
  displayNameBn: string;
  priceBdt: number;
  aiQueriesPerDay: number;
  features: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export type ChatMode = "rag" | "document" | "statute";

export interface LawSection {
  id: number;
  name: string;
  nameEn: string;
  year: number;
}

export interface UploadedDocument {
  sessionId: string;
  fileName: string;
  wordCount: number;
}

// ─── Document Management ───────────────────────────────────────────────────

export type DocumentCategory = "contract" | "employment" | "nda" | "real-estate" | "business" | "personal" | "other";
export type DocumentStatus = "draft" | "completed" | "shared";

export interface DocumentListResponse {
  id: number;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  tags: string[] | null;
  shared: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface DocumentResponse {
  id: number;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  content: string | null;
  tags: string[] | null;
  shared: boolean;
  shareUrl: string | null;
  templateId: number | null;
  createdAt: string;
  modifiedAt: string;
}

export interface DocumentStatsResponse {
  total: number;
  drafts: number;
  completed: number;
  shared: number;
}

export interface ShareDocumentResponse {
  shareUrl: string;
  expiresAt: string;
}

// ─── Templates ────────────────────────────────────────────────────────────

export type TemplateCategory = "employment" | "contract" | "nda" | "real-estate" | "business" | "personal";

export interface TemplateListResponse {
  id: number;
  title: string;
  category: TemplateCategory;
  description: string;
  popularity: number;
  preview: string | null;
}

export interface TemplateResponse extends TemplateListResponse {
  content: string;
}

// ─── Clauses ──────────────────────────────────────────────────────────────

export interface ClauseResponse {
  id: number;
  title: string;
  category: string;
  content: string;
}

// ─── Analysis ─────────────────────────────────────────────────────────────

export interface AnalysisUploadResponse {
  sessionId: string;
  fileName: string;
  pageCount: number;
  wordCount: number;
  extractedText: string;
}

export interface AnalysisQueryResponse {
  answer: string;
  references: LegalReference[];
  confidence: number;
}

export interface LegalReference {
  law: string;
  section: string;
  relevance: string;
}

export interface VerifyResponse {
  documentType: string;
  summary: { valid: number; warnings: number; issues: number };
  results: {
    valid: VerifyItem[];
    warnings: VerifyItem[];
    issues: VerifyItem[];
  };
}

export interface VerifyItem {
  section: string;
  text: string;
  law: string;
  lawSection: string;
  suggestion: string;
}
