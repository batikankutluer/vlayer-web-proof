import type { WebProofOptions, WebProofResult, PerformanceMetrics } from './types';
import { 
  buildWebProofRequest, 
  validateWebProofOptions, 
  createPerformanceMetrics, 
  isValidUrl 
} from './utils';
import { callNativeWebProof, callNativeSimpleWebProof } from './native-wrapper';

export async function webProof(
  url: string, 
  options: WebProofOptions = {}
): Promise<WebProofResult & { metrics?: PerformanceMetrics }> {
  const startTime = performance.now();
  
  try {
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL format: ${url}`);
    }
    
    validateWebProofOptions(options);
    
    const request = buildWebProofRequest(url, options);
    const response = await callNativeWebProof(request);
    
    const metrics = createPerformanceMetrics(startTime);
    
    if (response.success && response.data) {
      return {
        success: true,
        proof: response.data,
        metrics
      };
    } else {
      return {
        success: false,
        error: response.error || 'Unknown error occurred during proof generation',
        metrics
      };
    }
  } catch (error) {
    const metrics = createPerformanceMetrics(startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Web proof generation failed: ${errorMessage}`,
      metrics
    };
  }
}

export async function simpleWebProof(
  notaryHost: string,
  notaryPort: number,
  url: string
): Promise<string> {
  try {
    if (!notaryHost || typeof notaryHost !== 'string') {
      throw new Error('Notary host must be a non-empty string');
    }
    
    if (!Number.isInteger(notaryPort) || notaryPort < 1 || notaryPort > 65535) {
      throw new Error('Notary port must be a valid port number (1-65535)');
    }
    
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL format: ${url}`);
    }
    
    const result = await callNativeSimpleWebProof(notaryHost, notaryPort, url);
    
    if (!result || typeof result !== 'string') {
      throw new Error('Invalid response from native binding');
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Simple web proof generation failed: ${errorMessage}`);
  }
}

export function webProofSync(_url: string, _options: WebProofOptions = {}): void {
  throw new Error('Synchronous web proof generation is not supported. Use webProof() instead.');
} 