export interface WebProofOptions {
  host?: string;
  notary?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: string[];
  data?: string;
  max_sent_data?: number;
  max_recv_data?: number;
}

export interface WebProofRequest {
  url: string;
  host?: string;
  notary?: string;
  method?: string;
  headers: string[];
  data?: string;
  max_sent_data?: number;
  max_recv_data?: number;
}

export interface WebProofResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface WebProofResult {
  success: boolean;
  proof?: string;
  error?: string;
} 