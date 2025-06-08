import type { WebProofOptions, WebProofRequest } from './types';

// Default configuration constants
const DEFAULT_NOTARY_HOST = 'test-notary.vlayer.xyz';
const DEFAULT_NOTARY_PORT = 443;
const DEFAULT_MAX_SENT_DATA = 1 << 12; // 4096
const DEFAULT_MAX_RECV_DATA = 1 << 14; // 16384

export function parseUrl(url: string): { domain: string; uri: string; protocol: string; port: number } {
  try {
    const urlObj = new URL(url);
    const port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80);
    return {
      domain: urlObj.hostname,
      uri: urlObj.pathname + urlObj.search + urlObj.hash,
      protocol: urlObj.protocol,
      port
    };
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

export function parseNotaryUrl(notaryUrl: string): { host: string; port: number; pathPrefix: string; enableTls: boolean } {
  try {
    const urlObj = new URL(notaryUrl);
    const host = urlObj.hostname;
    const port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80);
    const pathPrefix = urlObj.pathname.replace(/^\/+|\/+$/g, ''); // Trim leading/trailing slashes
    const enableTls = urlObj.protocol === 'https:';
    
    return { host, port, pathPrefix, enableTls };
  } catch (error) {
    throw new Error(`Invalid notary URL: ${notaryUrl}`);
  }
}

export function formatHeaders(headers?: string[]): string[] {
  if (!headers) return [];
  return headers;
}

export function buildWebProofRequest(url: string, options: WebProofOptions = {}): WebProofRequest {
  // Convert Record<string, string> to string[] format if needed
  let headersList: string[] = [];
  if (options.headers) {
    headersList = options.headers;
  }

  return {
    url: url,
    host: options.host,
    notary: options.notary,
    method: options.method,
    headers: headersList,
    data: options.data,
    max_sent_data: options.max_sent_data || DEFAULT_MAX_SENT_DATA,
    max_recv_data: options.max_recv_data || DEFAULT_MAX_RECV_DATA
  };
} 