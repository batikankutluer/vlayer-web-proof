import type { WebProofOptions, WebProofResult } from './types';
import { buildWebProofRequest } from './utils';
import { callNativeWebProof, callNativeSimpleWebProof } from './native-wrapper';

export async function webProof(url: string, options: WebProofOptions = {}): Promise<WebProofResult> {
  try {
    const request = buildWebProofRequest(url, options);
    const response = await callNativeWebProof(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        proof: response.data
      };
    } else {
      return {
        success: false,
        error: response.error || 'Unknown error occurred'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function simpleWebProof(
  notaryHost: string,
  notaryPort: number,
  url: string
): Promise<string> {
  try {
    return await callNativeSimpleWebProof(notaryHost, notaryPort, url);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to generate web proof');
  }
} 