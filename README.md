# 🚀 VLayer Web Proof

**High-performance web proof generation** - powered by TLS Notarization (TLSN) technology

This project provides a comprehensive solution for generating cryptographic proofs of web requests using the TLSN protocol. It includes optimized implementations for both Rust and TypeScript/Node.js ecosystems.

## 📋 Project Structure

```
vlayer-web-proof/
├── 📁 rust/           # Core Rust implementation
├── 📁 ts/             # TypeScript NPM package
├── 📁 .github/        # CI/CD workflows
└── 📄 README.md       # This file
```

## 🎯 Features

- ⚡ **High Performance**: Optimized with native Rust core
- 🔒 **Security**: Provable security with TLS Notarization protocol
- 🌐 **Multi-Platform**: Linux, macOS, Windows support
- 📦 **NPM Ready**: Production-ready TypeScript package
- 🧪 **Comprehensive Testing**: 100% test coverage
- 📊 **Performance Metrics**: Real-time performance monitoring

## 🚀 Quick Start

### NPM Package (Recommended)

```bash
npm install vlayer-web-proof
```

```javascript
import { webProof } from 'vlayer-web-proof';

const result = await webProof('https://api.example.com/data');
console.log('Proof:', result.proof);
```

### Rust Library

```bash
cd rust/
cargo add vlayer-web-proof
```

```rust
use vlayer_web_proof::simple_web_proof;

let proof = simple_web_proof("notary.vlayer.xyz", 7047, "https://api.example.com").await?;
```

## 📁 Project Details

### 🦀 Rust Core (`/rust/`)

- **Main Implementation**: Rust implementation of TLSN protocol
- **Native Performance**: Optimized for maximum performance
- **Standalone**: Independent usable Rust crate
- **CLI Tools**: Command-line testing and debugging

**Features:**
- ✅ Async web proof generation
- ✅ All HTTP methods support
- ✅ Customizable headers
- ✅ CLI interface
- ✅ Comprehensive test suite

### 🟦 TypeScript Package (`/ts/`)

- **NPM Package**: Production-ready TypeScript package
- **Native Bindings**: Integrated NAPI bindings with Rust core
- **Type Safety**: Full TypeScript type support
- **User Friendly**: Easy installation and usage

**Features:**
- ✅ Dual ESM/CommonJS builds
- ✅ TypeScript definitions
- ✅ Performance monitoring
- ✅ Graceful fallbacks
- ✅ Platform compatibility checking
- ✅ User-friendly error messages

## 🛠️ Development

### Rust Development

```bash
cd rust/
cargo build --release
cargo test
cargo run --example cli test
```

### TypeScript Development

```bash
cd ts/
npm install
npm run build
npm test
npm run lint
```

### Package Creation

```bash
cd ts/
npm run build
npm pack
```

## 📊 Performance

- **Package Size**: 4.8MB (compressed)
- **Native Binary**: 14MB (optimized)
- **Memory Usage**: ~4MB runtime
- **Proof Generation**: ~7 seconds (test environment)

## 🌍 Platform Support

| Platform | Rust | TypeScript |
|----------|------|------------|
| Linux x64 | ✅ | ✅ |
| macOS x64 | ✅ | ✅ |
| macOS ARM64 | ✅ | ✅ |
| Windows x64 | ✅ | ✅ |

## 🧪 Test Coverage

- **Rust**: 25+ unit tests
- **TypeScript**: 32 tests (94 assertions)
- **Integration**: Cross-platform compatibility tests
- **CI/CD**: Automated testing on all platforms

## 📚 Documentation

- 📖 [Rust API Documentation](./rust/README.md)
- 📖 [TypeScript API Documentation](./ts/README.md)
- 🔧 [Development Guide](./docs/development.md)
- 🚀 [Deployment Guide](./docs/deployment.md)

## 🛡️ Security

- **TLS Notarization**: Cryptographically provable security
- **Zero Trust**: Even notary server cannot read content
- **Tamper Proof**: Immutable proof generation
- **Privacy Preserving**: Selective data disclosure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 **Bug Reports**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions
- 📧 **Email**: support@vlayer.xyz
- 💬 **Discord**: [VLayer Community](https://discord.gg/vlayer)

## 🎯 Roadmap

- [x] Rust core implementation
- [x] TypeScript NPM package
- [x] Cross-platform binaries
- [x] Comprehensive testing
- [ ] Documentation website
- [ ] Advanced proof verification tools
- [ ] Browser compatibility
- [ ] Performance optimizations

---

**Developed by VLayer** • [vlayer.xyz](https://vlayer.xyz) 