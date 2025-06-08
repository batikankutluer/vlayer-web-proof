import type { WebProofRequest, WebProofResponse } from './types';
import { DEFAULT_CONFIG } from './types';
import Module from "node:module";

let nativeBinding: any;
let bindingLoadAttempts = 0;
let bindingLoadError: Error | null = null;
const MAX_BINDING_LOAD_ATTEMPTS = 3;

// Runtime'da environment detect et
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
      `Native binding yüklenemedi. Bu paket native Rust bileşeni gerektirir.\n` +
      `Lütfen şunları kontrol edin:\n` +
      `1. İşletim sisteminiz destekleniyor mu? (Linux x64, macOS, Windows)\n` +
      `2. Package doğru şekilde yüklendi mi?\n` +
      `3. Gerekli sistem bağımlılıkları var mı?\n\n` +
      `Detaylı hata: ${lastError?.message || 'Bilinmeyen hata'}`
    );
    throw bindingLoadError;
  }

  throw lastError || new Error('Native binding yüklenemedi');
}

function validateNativeBinding(binding: any): void {
  if (!binding) {
    throw new Error('Native binding yüklenemedi');
  }
  
  if (typeof binding.generateWebProof !== 'function') {
    throw new Error('Native binding eksik: generateWebProof fonksiyonu bulunamadı');
  }
  
  if (typeof binding.generateSimpleWebProof !== 'function') {
    throw new Error('Native binding eksik: generateSimpleWebProof fonksiyonu bulunamadı');
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
      notary: request.notary,
      method: request.method,
      headers: Array.from(request.headers),
      data: request.data,
      maxSentData: request.max_sent_data ? Number(request.max_sent_data) : undefined,
      maxRecvData: request.max_recv_data ? Number(request.max_recv_data) : undefined,
    });

    const result = await Promise.race([proofPromise, timeoutPromise]);
    
    if (!result || typeof result !== 'object') {
      throw new Error('Native binding\'den geçersiz yanıt formatı');
    }
    
    return result as WebProofResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen native hata';
    
    if (errorMessage.includes('Native binding yüklenemedi')) {
      return {
        success: false,
        error: `❌ ${errorMessage}\n\n💡 Çözüm önerileri:\n- Package'ı yeniden yükleyin: npm uninstall vlayer-web-proof && npm install vlayer-web-proof\n- Node.js sürümünüzü kontrol edin (>=18.0.0 gerekli)\n- İşletim sistemi desteğini kontrol edin`
      };
    }
    
    return {
      success: false,
      error: `Web proof oluşturma başarısız: ${errorMessage}`
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
      throw new Error('Native binding\'den geçersiz yanıt formatı - string bekleniyor');
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen native hata';
    
    if (errorMessage.includes('Native binding yüklenemedi')) {
      throw new Error(`❌ ${errorMessage}\n\n💡 Package'ı yeniden kurmayı deneyin: npm install vlayer-web-proof`);
    }
    
    throw new Error(`Simple web proof oluşturma başarısız: ${errorMessage}`);
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