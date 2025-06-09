# 📦 vlayer-web-proof
 
## 📦 Installation

```bash
npm install vlayer-web-proof
```

**System Requirements:**
- Node.js >= 18.0.0
- npm >= 8.0.0
- Supported platforms: Linux x64, macOS x64/ARM64, Windows x64

## 🚀 Quick Start

### Basic Usage

```javascript
import { webProof } from 'vlayer-web-proof';

// Create proof with GET request
const result = await webProof('https://api.github.com/user', {
    notary_url: "http://0.0.0.0:7047",
});

if (result.success) {
  console.log('✅ Proof created successfully!');
  console.log('📄 Proof:', result.proof);
  console.log('⏱️ Duration:', result.metrics?.duration, 'ms');
  console.log('💾 Memory:', result.metrics?.memoryUsage, 'bytes');
} else {
  console.error('❌ Error:', result.error);
}
```

### CommonJS Support

```javascript
const { webProof, isNativeBindingLoaded } = require('vlayer-web-proof');

// Check native binding status
if (isNativeBindingLoaded()) {
  console.log('🔌 Native binding active');
} else {
  console.log('⚠️ Running in simulation mode');
}
```

## 🔧 Advanced Usage

### Custom Options

```typescript
import { webProof, WebProofOptions } from 'vlayer-web-proof';

const options: WebProofOptions = {
  method: 'POST',
  headers: [
    'Content-Type: application/json',
    'Authorization: Bearer your-token',
    'User-Agent: MyApp/1.0'
  ],
  data: JSON.stringify({
    name: 'VLayer',
    action: 'test'
  }),
  max_sent_data: 4096,
  max_recv_data: 16384
};

const result = await webProof('https://api.example.com/data', options);
```

### Utility Functions

```typescript
import { 
  isValidUrl, 
  parseUrl, 
  createPerformanceMetrics,
  validateWebProofOptions,
  DEFAULT_CONFIG 
} from 'vlayer-web-proof';

// URL validation
console.log('Is URL valid?', isValidUrl('https://example.com'));

// URL parsing
const parsed = parseUrl('https://api.github.com:443/user');
console.log('Domain:', parsed.domain);
console.log('Port:', parsed.port);
console.log('Path:', parsed.uri);

// Performance tracking
const startTime = Date.now();
// ... perform operations ...
const metrics = createPerformanceMetrics(startTime, Date.now());
console.log('Operation duration:', metrics.duration, 'ms');

// Config information
console.log('Timeout:', DEFAULT_CONFIG.TIMEOUT_MS);
console.log('Notary Host:', DEFAULT_CONFIG.NOTARY_HOST);
```

## 📊 API Reference

### `webProof(url: string, options?: WebProofOptions)`

Main proof generation function.

**Parameters:**
- `url`: string - Request URL (HTTPS required)
- `options`: WebProofOptions (optional)

**WebProofOptions:**
```typescript
interface WebProofOptions {
  readonly host?: string;           // Host override
  readonly notary?: string;         // Notary server URL
  readonly method?: HttpMethod;     // HTTP method
  readonly headers?: readonly string[];  // HTTP headers
  readonly data?: string;           // Request data
  readonly max_sent_data?: number;  // Max sent data size
  readonly max_recv_data?: number;  // Max received data size
}
```

**Returns: `Promise<WebProofResult>`**
```typescript
interface WebProofResult {
  readonly success: boolean;
  readonly proof?: string;    // Proof data in JSON format
  readonly error?: string;    // Error message
  readonly metrics?: PerformanceMetrics;
}
```

### `simpleWebProof(notaryHost: string, notaryPort: number, url: string)`

Simple proof creation with notary.

```typescript
const proof = await simpleWebProof('notary.vlayer.xyz', 7047, 'https://api.example.com');
```

### Utility Functions

```typescript
// Native binding status
isNativeBindingLoaded(): boolean
getNativeBindingInfo(): BindingInfo

// URL operations
isValidUrl(url: string): boolean
parseUrl(url: string): ParsedUrl

// Validation
validateWebProofOptions(options: WebProofOptions): boolean

// Performance
createPerformanceMetrics(startTime: number, endTime?: number): PerformanceMetrics
```

## 🛠️ Development

### Project Setup

```bash
# Dependencies
npm install

# Development dependencies
npm install --save-dev

# TypeScript compile
npm run build

# Tests
npm test

# Linting
npm run lint

# Create package
npm pack
```

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Build Process

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

## 🔍 Troubleshooting

### Native Binding Not Loaded

```bash
# 1. Completely remove and reinstall package
npm uninstall vlayer-web-proof
npm cache clean --force
npm install vlayer-web-proof

# 2. Check Node.js version
node --version  # Should be >= 18.0.0

# 3. Check platform support
node -e "console.log(process.platform, process.arch)"
```

### Platform Not Supported

Package runs in simulation mode on unsupported platforms:

```javascript
import { isNativeBindingLoaded, getNativeBindingInfo } from 'vlayer-web-proof';

if (!isNativeBindingLoaded()) {
  const info = getNativeBindingInfo();
  console.log('Supported platforms:', info.supportedPlatforms);
  console.log('Running in simulation mode');
}
```

### Performance Issues

```typescript
// Increase timeout setting
const result = await webProof(url, {
  // Default: 30000ms
  // Add custom timeout to notary parameter
});

// Monitor memory usage
const metrics = createPerformanceMetrics(Date.now());
// After operation
console.log('Memory usage:', metrics.memoryUsage);
```