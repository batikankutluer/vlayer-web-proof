import type { 
  WebProofOptions, 
  WebProofRequest, 
  ParsedUrl, 
  NotaryConfig, 
  PerformanceMetrics
} from './types';

export function parseUrl(url: string): ParsedUrl {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }
  
  try {
    const urlObj = new URL(url);
    const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === 'https:' ? 443 : 80);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${urlObj.port}`);
    }
    
    return {
      domain: urlObj.hostname,
      uri: urlObj.pathname + urlObj.search + urlObj.hash,
      protocol: urlObj.protocol,
      port
    };
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}. ${error instanceof Error ? error.message : ''}`);
  }
}

export function parseNotaryUrl(notaryUrl: string): NotaryConfig {
  if (!notaryUrl || typeof notaryUrl !== 'string') {
    throw new Error('Notary URL must be a non-empty string');
  }
  
  try {
    const urlObj = new URL(notaryUrl);
    const host = urlObj.hostname;
    const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === 'https:' ? 443 : 80);
    const pathPrefix = urlObj.pathname.replace(/^\/+|\/+$/g, '');
    const enableTls = urlObj.protocol === 'https:';
    
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid notary port number: ${urlObj.port}`);
    }
    
    if (!host) {
      throw new Error('Notary URL must contain a valid hostname');
    }
    
    return { host, port, pathPrefix, enableTls };
  } catch (error) {
    throw new Error(`Invalid notary URL format: ${notaryUrl}. ${error instanceof Error ? error.message : ''}`);
  }
}

export function formatHeaders(headers?: readonly string[]): readonly string[] {
  if (!headers) return [];
  
  return headers.filter(header => 
    typeof header === 'string' && header.trim().length > 0
  );
}

export function buildWebProofRequest(url: string, options: WebProofOptions = {}): WebProofRequest {
  const headersList = formatHeaders(options.headers);

  return {
    url,
    host: options.host ?? undefined,
    notary_url: options.notary_url ?? undefined,
    method: options.method ?? undefined,
    headers: headersList,
    data: options.data ?? undefined,
    max_sent_data: options.max_sent_data ?? undefined,
    max_recv_data: options.max_recv_data ?? undefined
  };
}

export function createPerformanceMetrics(startTime: number, endTime?: number): PerformanceMetrics {
  const end = endTime ?? performance.now();
  return {
    startTime,
    endTime: end,
    duration: end - startTime,
    memoryUsage: process.memoryUsage?.()?.heapUsed
  };
}

export function validateWebProofOptions(options: WebProofOptions): void {
  if (options.max_sent_data !== undefined) {
    if (!Number.isInteger(options.max_sent_data) || options.max_sent_data <= 0) {
      throw new Error('max_sent_data must be a positive integer');
    }
  }
  
  if (options.max_recv_data !== undefined) {
    if (!Number.isInteger(options.max_recv_data) || options.max_recv_data <= 0) {
      throw new Error('max_recv_data must be a positive integer');
    }
  }
  
  if (options.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(options.method)) {
    throw new Error(`Invalid HTTP method: ${options.method}`);
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 