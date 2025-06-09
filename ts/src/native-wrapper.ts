import type { WebProofRequest, WebProofResponse } from './types';
import { DEFAULT_CONFIG } from './types';
import Module from "node:module";

let nativeBinding: any;
let bindingLoadAttempts = 0;
let bindingLoadError: Error | null = null;
const MAX_BINDING_LOAD_ATTEMPTS = 3;

// Detect environment at runtime
function getRequireFunction() {
  if (typeof require !== 'undefined') {
    // CJS environment
    return require;
  }
  
  // ESM environment
  try {
    const { createRequire } = Module;
    return createRequire(process.cwd() + '/package.json');
  } catch {
    throw new Error('Cannot create require function in this environment');
  }
}

function loadNativeBinding(): any {
  if (nativeBinding) {
    return nativeBinding;
  }

  if (bindingLoadError && bindingLoadAttempts >= MAX_BINDING_LOAD_ATTEMPTS) {
    throw bindingLoadError;
  }

  const bindingPaths = [
    '../../vlayer-web-proof.linux-x64-gnu.node',
    '../vlayer-web-proof.linux-x64-gnu.node', 
    './vlayer-web-proof.linux-x64-gnu.node',
    '../../../vlayer-web-proof.linux-x64-gnu.node'
  ];

  let lastError: Error | undefined;
  const requireFn = getRequireFunction();

  for (const path of bindingPaths) {
    try {
      nativeBinding = requireFn(path);
      bindingLoadError = null;
      return nativeBinding;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  bindingLoadAttempts++;
  
  if (bindingLoadAttempts >= MAX_BINDING_LOAD_ATTEMPTS) {
    bindingLoadError = new Error(
      `Failed to load native binding. This package requires a native Rust component.\n` +
      `Please check the following:\n` +
      `1. Is your operating system supported? (Linux x64, macOS, Windows)\n` +
      `2. Is the package installed correctly?\n` +
      `3. Are the required system dependencies available?\n\n` +
      `Detailed error: ${lastError?.message || 'Unknown error'}`
    );
    throw bindingLoadError;
  }

  throw lastError || new Error('Failed to load native binding');
}

function validateNativeBinding(binding: any): void {
  if (!binding) {
    throw new Error('Failed to load native binding');
  }
  
  if (typeof binding.generateWebProof !== 'function') {
    throw new Error('Native binding missing: generateWebProof function not found');
  }
  
  if (typeof binding.generateSimpleWebProof !== 'function') {
    throw new Error('Native binding missing: generateSimpleWebProof function not found');
  }
}

export async function callNativeWebProof(request: WebProofRequest): Promise<WebProofResponse> {
  try {
    const binding = loadNativeBinding();
    validateNativeBinding(binding);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Web proof generation timed out after ${DEFAULT_CONFIG.TIMEOUT_MS}ms`));
      }, DEFAULT_CONFIG.TIMEOUT_MS);
    });

    const proofPromise = binding.generateWebProof({
      url: request.url,
      host: request.host,
      notaryUrl: request.notary_url,
      method: request.method,
      headers: Array.from(request.headers),
      data: request.data,
      maxSentData: request.max_sent_data ? Number(request.max_sent_data) : undefined,
      maxRecvData: request.max_recv_data ? Number(request.max_recv_data) : undefined,
    });

    const result = await Promise.race([proofPromise, timeoutPromise]);
    
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from native binding');
    }
    
    return result as WebProofResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown native error';
    
    if (errorMessage.includes('Failed to load native binding')) {
      return {
        success: false,
        error: `❌ ${errorMessage}\n\n💡 Solution suggestions:\n- Reinstall the package: npm uninstall vlayer-web-proof && npm install vlayer-web-proof\n- Check your Node.js version (>=18.0.0 required)\n- Verify operating system support`
      };
    }
    
    return {
      success: false,
      error: `Web proof generation failed: ${errorMessage}`
    };
  }
}

export async function callNativeSimpleWebProof(
  notaryHost: string,
  notaryPort: number,
  url: string
): Promise<string> {
  try {
    const binding = loadNativeBinding();
    validateNativeBinding(binding);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Simple web proof generation timed out after ${DEFAULT_CONFIG.TIMEOUT_MS}ms`));
      }, DEFAULT_CONFIG.TIMEOUT_MS);
    });

    const proofPromise = binding.generateSimpleWebProof(
      notaryHost,
      notaryPort,
      url
    );

    const result = await Promise.race([proofPromise, timeoutPromise]);
    
    if (!result || typeof result !== 'string') {
      throw new Error('Invalid response format from native binding - string expected');
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown native error';
    
    if (errorMessage.includes('Failed to load native binding')) {
      throw new Error(`❌ ${errorMessage}\n\n💡 Try reinstalling the package: npm install vlayer-web-proof`);
    }
    
    throw new Error(`Simple web proof generation failed: ${errorMessage}`);
  }
}

export function isNativeBindingLoaded(): boolean {
  return !!nativeBinding;
}

export function getNativeBindingInfo(): { 
  loaded: boolean; 
  attempts: number; 
  error: string | null;
  supportedPlatforms: string[];
} {
  return {
    loaded: !!nativeBinding,
    attempts: bindingLoadAttempts,
    error: bindingLoadError?.message || null,
    supportedPlatforms: ['linux-x64', 'darwin-x64', 'darwin-arm64', 'win32-x64']
  };
}