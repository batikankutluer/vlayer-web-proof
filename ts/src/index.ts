export { webProof, simpleWebProof, webProofSync } from './web-proof';
export { 
  isNativeBindingLoaded, 
  getNativeBindingInfo 
} from './native-wrapper';
export { 
  parseUrl, 
  parseNotaryUrl, 
  isValidUrl,
  validateWebProofOptions,
  createPerformanceMetrics 
} from './utils';
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
} from './types';
export { DEFAULT_CONFIG } from './types';

import { webProof } from './web-proof';
export default webProof;