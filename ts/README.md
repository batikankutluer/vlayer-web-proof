# vlayer-web-proof

Web proof generation using TLS Notarization (TLSN) technology, created from vlayer repository.

## 🚀 Features

- ✅ **Native Performance** - Uses NAPI-RS for direct Rust integration
- ✅ **TypeScript Support** - Full TypeScript definitions
- ✅ **Simple API** - Easy to use interface
- ✅ **Async/Await** - Modern JavaScript patterns
- ✅ **Cross-Platform** - Works on Windows, macOS, and Linux

## 📦 Installation

```bash
npm install vlayer-web-proof
# or
bun add vlayer-web-proof
```

## 🔧 Usage

### Basic Usage (Default Notary)

```typescript
import { webProof, simpleWebProof } from 'vlayer-web-proof';

// Simplest usage - uses default notary
const result = await webProof('https://api.example.com/data');
if (result.success) {
  console.log('Proof:', result.proof);
} else {
  console.error('Error:', result.error);
}

// Or use simpleWebProof with local notary
const proof = await simpleWebProof('127.0.0.1', 7047, 'https://api.example.com/data');
console.log(proof);
```

### Advanced Usage

```typescript
import { webProof, simpleWebProof } from "vlayer-web-proof";
import type { WebProofOptions } from "vlayer-web-proof";

// With custom notary URL
const result = await webProof('https://api.example.com/data', {
  notary: 'http://127.0.0.1:7047',
  headers: [
    'Authorization: Bearer your-token',
    'Content-Type: application/json'
  ],
  method: 'POST',
  data: JSON.stringify({ key: 'value' })
});

// With different notary servers
const result2 = await webProof('https://api.example.com/data', {
  notary: 'https://test-notary.vlayer.xyz:443',
  method: 'GET'
});

// With custom host override for local testing
const result3 = await webProof('https://api.example.com/data', {
  notary: 'http://localhost:7047',
  host: '127.0.0.1',
  method: 'GET'
});
```

## 📋 API Reference

### `webProof(url: string, options?: WebProofOptions): Promise<WebProofResult>`

Main function for generating web proofs.

**Parameters:**
- `url: string` - Target URL to generate proof for
- `options?: WebProofOptions` - Configuration options

**Returns:** `Promise<WebProofResult>`

### `simpleWebProof(notaryHost: string, notaryPort: number, url: string): Promise<string>`

Simplified function that returns proof directly or throws on error.

**Parameters:**
- `notaryHost: string` - Notary server hostname
- `notaryPort: number` - Notary server port
- `url: string` - Target URL to generate proof for

**Returns:** `Promise<string>` - Raw proof data

### Types

```typescript
interface WebProofOptions {
  host?: string;
  notary?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: string[];
  data?: string;
  max_sent_data?: number;
  max_recv_data?: number;
}

interface WebProofResult {
  success: boolean;
  proof?: string;
  error?: string;
}
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun run test
```

## 📝 Requirements

- Node.js >= 18.0.0
- A running notary server (default: local server at 127.0.0.1:7047)
- Target HTTPS websites for proof generation

## 🔗 Related

This package is built on top of the TLSN (TLS Notarization) protocol and uses native Rust bindings for optimal performance.

## 📄 License

MIT
