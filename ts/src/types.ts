export interface WebProofOptions {
  readonly host?: string;
  readonly notary?: string;
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  readonly headers?: readonly string[];
  readonly data?: string;
  readonly max_sent_data?: number;
  readonly max_recv_data?: number;
}

export interface WebProofRequest {
  readonly url: string;
  readonly host: string | undefined;
  readonly notary: string | undefined;
  readonly method: string | undefined;
  readonly headers: readonly string[];
  readonly data: string | undefined;
  readonly max_sent_data: number | undefined;
  readonly max_recv_data: number | undefined;
}

export interface WebProofResponse {
  readonly success: boolean;
  readonly data?: string;
  readonly error?: string;
}

export interface WebProofResult {
  readonly success: boolean;
  readonly proof?: string;
  readonly error?: string;
}

export interface ParsedUrl {
  readonly domain: string;
  readonly uri: string;
  readonly protocol: string;
  readonly port: number;
}

export interface NotaryConfig {
  readonly host: string;
  readonly port: number;
  readonly pathPrefix: string;
  readonly enableTls: boolean;
}

export interface PerformanceMetrics {
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly memoryUsage?: number;
}

export const DEFAULT_CONFIG = {
  NOTARY_HOST: 'test-notary.vlayer.xyz',
  NOTARY_PORT: 443,
  MAX_SENT_DATA: 1 << 12, // 4096
  MAX_RECV_DATA: 1 << 14, // 16384
  TIMEOUT_MS: 30000,
} as const;

export type HttpMethod = WebProofOptions['method'];
export type WebProofError = string | Error; 