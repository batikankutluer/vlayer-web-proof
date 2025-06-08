import type { WebProofRequest, WebProofResponse } from './types';

// Import native bindings
let nativeBinding: any;

try {
  // Use compiled .node file in production - from dist/src to ts folder
  nativeBinding = require('../../vlayer-web-proof.linux-x64-gnu.node');
} catch (e) {
  try {
    // Alternative path
    nativeBinding = require('../../../vlayer-web-proof.linux-x64-gnu.node');
  } catch (e2) {
    try {
      nativeBinding = require('./vlayer-web-proof.linux-x64-gnu.node');
    } catch (e3) {
      throw new Error(`Failed to load native binding: ${e3}`);
    }
  }
}

export async function callNativeWebProof(request: WebProofRequest): Promise<WebProofResponse> {
  try {
    // Call generate_web_proof function from NAPI binding
    const result = await nativeBinding.generateWebProof({
      url: request.url,
      host: request.host,
      notary: request.notary,
      method: request.method,
      headers: request.headers,
      data: request.data,
      maxSentData: request.max_sent_data ? Number(request.max_sent_data) : undefined,
      maxRecvData: request.max_recv_data ? Number(request.max_recv_data) : undefined,
    });
    
    return result;
  } catch (error) {
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : 'Unknown native error'
    };
  }
}

export async function callNativeSimpleWebProof(
  notaryHost: string,
  notaryPort: number,
  url: string
): Promise<string> {
  try {
    // Call generate_simple_web_proof function from NAPI binding
    const result = await nativeBinding.generateSimpleWebProof(
      notaryHost,
      notaryPort,
      url
    );
    
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown native error');
  }
}