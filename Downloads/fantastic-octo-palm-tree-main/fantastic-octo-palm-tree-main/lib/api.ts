/**
 * Aadhaar Intelligence Platform - API Client
 *
 * This module provides typed API functions for interacting with the backend services.
 * Each framework (ADIF, IRF, AMF, AFIF, PROF, PPAF) has its own set of endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ============================================================================
// Types
// ============================================================================

// ADIF - Aadhaar Data Integrity Framework
export interface NormalizeRequest {
  records: AadhaarRecord[]
}

export interface AadhaarRecord {
  uid: string
  name: string
  address: string
  dob: string
  biometric_hash?: string
  created_at?: string
}

export interface NormalizeResponse {
  normalized_records: AadhaarRecord[]
  normalization_report: {
    total_processed: number
    fields_corrected: number
    confidence_scores: Record<string, number>
  }
}

export interface DeduplicateRequest {
  records: AadhaarRecord[]
  threshold?: number
}

export interface DeduplicateResponse {
  unique_records: AadhaarRecord[]
  duplicates: {
    original_uid: string
    duplicate_uid: string
    similarity_score: number
  }[]
  deduplication_stats: {
    original_count: number
    unique_count: number
    duplicates_found: number
  }
}

export interface ConfidenceScore {
  uid: string
  overall_score: number
  field_scores: {
    name: number
    address: number
    dob: number
    biometric: number
  }
  last_verified: string
}

// IRF - Identity Resolution Framework
export interface MatchRequest {
  query_record: Partial<AadhaarRecord>
  match_threshold?: number
  max_results?: number
}

export interface MatchResponse {
  matches: {
    uid: string
    similarity_score: number
    match_fields: string[]
    record: AadhaarRecord
  }[]
  query_time_ms: number
}

export interface LinkedIdentity {
  primary_uid: string
  linked_uids: string[]
  link_type: "family" | "address" | "employment" | "other"
  confidence: number
}

// AMF - Anomaly & Migration Framework
export interface MigrationPattern {
  corridor_id: string
  origin_state: string
  destination_state: string
  volume: number
  trend: "increasing" | "decreasing" | "stable"
  pattern_type: "economic" | "seasonal" | "education" | "employment"
  time_period: string
}

export interface MobilityScore {
  uid: string
  score: number
  movement_count: number
  primary_locations: string[]
  risk_indicators: string[]
}

// AFIF - Aadhaar Fraud Intelligence Framework
export interface Anomaly {
  id: string
  type: string
  uid: string
  region: string
  fraud_score: number
  status: "pending" | "investigating" | "confirmed" | "resolved"
  detected_at: string
  details: Record<string, unknown>
}

export interface FraudScore {
  uid: string
  score: number
  risk_level: "low" | "medium" | "high" | "critical"
  risk_factors: string[]
  last_updated: string
}

export interface FlagRequest {
  uid: string
  reason: string
  evidence?: Record<string, unknown>
}

// PROF - Policy & Regional Operations Framework
export interface RegionalStats {
  state: string
  population: number
  coverage_percentage: number
  active_services: number
  last_updated: string
}

export interface PolicyRecommendation {
  id: string
  title: string
  description: string
  impact: "low" | "medium" | "high"
  status: "proposed" | "approved" | "implementing" | "completed"
  affected_population: number
  created_at: string
}

// PPAF - Privacy Preserving Analytics Framework
export interface PrivacyQuery {
  query_type: string
  parameters: Record<string, unknown>
  epsilon?: number
  delta?: number
}

export interface PrivacyQueryResponse {
  query_id: string
  result: unknown
  epsilon_used: number
  remaining_budget: number
  noise_added: boolean
}

export interface AuditLogEntry {
  id: string
  query_id: string
  query_description: string
  epsilon_used: number
  user: string
  status: "completed" | "denied" | "pending"
  timestamp: string
}

// ============================================================================
// API Client Functions
// ============================================================================

class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new APIError(response.status, `API Error: ${response.statusText}`)
  }

  return response.json()
}

// ============================================================================
// ADIF - Aadhaar Data Integrity Framework
// ============================================================================

export const adif = {
  /**
   * Normalize Aadhaar records by standardizing formats and correcting inconsistencies
   */
  normalize: (data: NormalizeRequest): Promise<NormalizeResponse> =>
    fetchAPI("/adif/normalize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Find and remove duplicate records based on similarity threshold
   */
  deduplicate: (data: DeduplicateRequest): Promise<DeduplicateResponse> =>
    fetchAPI("/adif/deduplicate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Get confidence score for a specific UID
   */
  getConfidenceScore: (uid: string): Promise<ConfidenceScore> => fetchAPI(`/adif/confidence/${uid}`),
}

// ============================================================================
// IRF - Identity Resolution Framework
// ============================================================================

export const irf = {
  /**
   * Find matching identities based on query parameters
   */
  match: (data: MatchRequest): Promise<MatchResponse> =>
    fetchAPI("/irf/match", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Get all linked identities for a given UID
   */
  getLinkedIdentities: (uid: string): Promise<LinkedIdentity[]> => fetchAPI(`/irf/linked-identities/${uid}`),
}

// ============================================================================
// AMF - Anomaly & Migration Framework
// ============================================================================

export const amf = {
  /**
   * Get migration patterns with optional filters
   */
  getMigrationPatterns: (params?: {
    origin?: string
    destination?: string
    pattern_type?: string
    limit?: number
  }): Promise<MigrationPattern[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return fetchAPI(`/amf/migration-patterns${query ? `?${query}` : ""}`)
  },

  /**
   * Get mobility score for a specific UID
   */
  getMobilityScore: (uid: string): Promise<MobilityScore> => fetchAPI(`/amf/mobility-score/${uid}`),
}

// ============================================================================
// AFIF - Aadhaar Fraud Intelligence Framework
// ============================================================================

export const afif = {
  /**
   * Get list of detected anomalies with optional filters
   */
  getAnomalies: (params?: {
    status?: string
    type?: string
    region?: string
    min_score?: number
    limit?: number
  }): Promise<Anomaly[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return fetchAPI(`/afif/anomalies${query ? `?${query}` : ""}`)
  },

  /**
   * Get fraud score for a specific UID
   */
  getFraudScore: (uid: string): Promise<FraudScore> => fetchAPI(`/afif/fraud-score/${uid}`),

  /**
   * Flag a record for investigation
   */
  flag: (data: FlagRequest): Promise<{ success: boolean; case_id: string }> =>
    fetchAPI("/afif/flag", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// ============================================================================
// PROF - Policy & Regional Operations Framework
// ============================================================================

export const prof = {
  /**
   * Get regional statistics with optional state filter
   */
  getRegionalStats: (state?: string): Promise<RegionalStats[]> => {
    const query = state ? `?state=${state}` : ""
    return fetchAPI(`/prof/regional-stats${query}`)
  },

  /**
   * Get policy recommendations with optional filters
   */
  getPolicyRecommendations: (params?: { status?: string; impact?: string }): Promise<PolicyRecommendation[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return fetchAPI(`/prof/policy-recommendations${query ? `?${query}` : ""}`)
  },
}

// ============================================================================
// PPAF - Privacy Preserving Analytics Framework
// ============================================================================

export const ppaf = {
  /**
   * Execute a differentially private query
   */
  query: (data: PrivacyQuery): Promise<PrivacyQueryResponse> =>
    fetchAPI("/ppaf/query", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Get audit log of privacy queries
   */
  getAuditLog: (params?: { limit?: number; user?: string }): Promise<AuditLogEntry[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return fetchAPI(`/ppaf/audit-log${query ? `?${query}` : ""}`)
  },
}

// Export all framework APIs
export const api = {
  adif,
  irf,
  amf,
  afif,
  prof,
  ppaf,
}
