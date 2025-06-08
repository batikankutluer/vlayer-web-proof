# 📦 vlayer-web-proof

🚀 **Production-ready TypeScript NPM package** - Web proof generation with TLS Notarization

High-performance cryptographic proof creation using native Rust bindings. This package is an optimized wrapper of the Rust core implementation for the TypeScript/Node.js ecosystem.

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
const result = await webProof('https://api.github.com/user');

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

## 📋 Package Contents

```
vlayer-web-proof/
├── dist/                    # Compiled JavaScript
│   ├── index.js            # CommonJS entry
│   ├── index.esm.js        # ESM entry  
│   ├── index.d.ts          # Type definitions
│   └── src/                # Source modules
├── scripts/                 # Build scripts
│   └── postinstall.js      # Installation verification
├── package.json            # Package metadata
├── tsconfig.json           # TypeScript config
├── .npmignore              # NPM ignore rules
└── README.md               # This file
```

## 🧪 Test Coverage

- ✅ **32 Tests** passing
- ✅ **94 Assertions** verified
- ✅ **Unit Tests**: Utility functions, validation, URL parsing
- ✅ **Integration Tests**: Native binding, error handling
- ✅ **TypeScript Tests**: Type safety, interface compliance
- ✅ **Performance Tests**: Memory usage, timing

## 📊 Package Information

- **Size**: 4.8MB (compressed), 14.1MB (unpacked)
- **Dependencies**: Production dependencies only, minimal footprint
- **TypeScript**: Full type definitions included
- **Node.js**: >= 18.0.0 support
- **Formats**: Dual ESM/CommonJS builds

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Native Rust bindings
- ✅ TypeScript definitions
- ✅ Comprehensive testing
- ✅ Performance monitoring
- ✅ Cross-platform support

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

1. Fork the main repository
2. Make changes in the `ts/` directory
3. Run tests: `npm test`
4. Check build: `npm run build`
5. Create a Pull Request

## 🆘 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/vlayer-xyz/vlayer-web-proof/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/vlayer-xyz/vlayer-web-proof/discussions)
- 📧 **Email**: support@vlayer.xyz
- 📚 **Docs**: [vlayer.xyz/docs](https://vlayer.xyz/docs)

---

**Developed by VLayer** • [vlayer.xyz](https://vlayer.xyz)
