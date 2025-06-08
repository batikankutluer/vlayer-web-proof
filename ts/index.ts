export { webProof, simpleWebProof, webProofSync } from './src/web-proof';
export { 
  isNativeBindingLoaded, 
  getNativeBindingInfo 
} from './src/native-wrapper';
export { 
  parseUrl, 
  parseNotaryUrl, 
  isValidUrl,
  validateWebProofOptions,
  createPerformanceMetrics 
} from './src/utils';
export type { 
  WebProofOptions, 
  WebProofResult, 
  WebProofRequest, 
  WebProofResponse,
  ParsedUrl,
  NotaryConfig,
  PerformanceMetrics,
  HttpMethod,
  WebProofError
} from './src/types';
export { DEFAULT_CONFIG } from './src/types';

import { webProof } from './src/web-proof';
export default webProof;