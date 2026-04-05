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
