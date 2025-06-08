# 🦀 VLayer Web Proof - Rust Core

## 🎯 Features

- ⚡ **Native Performance**: Maximum performance with Rust
- 🔒 **TLSN Protocol**: Provable security with TLS Notarization
- 🚀 **Async/Await**: Modern Rust async programming
- 🧪 **Comprehensive Tests**: 100% test coverage
- 📦 **Standalone**: Independent usable crate
- 🔧 **CLI Tools**: Command-line interface
- 🌐 **NAPI Ready**: Ready for Node.js bindings

## 📦 Installation

### With Cargo

```bash
cd rust/
cargo build --release
```

### As Dependency

```toml
[dependencies]
vlayer-web-proof = { path = "../rust" }
# or
vlayer-web-proof = "1.0.0"  # from crates.io (future)
```

## 🚀 Quick Start

### CLI Usage

```bash
# Simple GET request
cargo run --example cli simple 127.0.0.1 7047 https://httpbin.org/json

# Detailed request with JSON config
cargo run --example cli json '{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": ["Content-Type: application/json"],
  "data": "{\"test\": \"data\"}",
  "max_sent_data": 4096,
  "max_recv_data": 16384
}'

# Show example JSON format
cargo run --example cli example

# Run test suite
cargo run --example cli test
```

### Rust Code Usage

```rust
use vlayer_web_proof::{web_proof, simple_web_proof, WebProofRequest};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Simple usage
    let proof = simple_web_proof(
        "notary.vlayer.xyz", 
        7047, 
        "https://api.github.com/user"
    ).await?;
    
    println!("🔐 Proof: {}", proof);
    
    // Detailed usage
    let request = WebProofRequest {
        url: "https://httpbin.org/post".to_string(),
        host: None,
        notary: Some("https://notary.vlayer.xyz:7047".to_string()),
        method: Some("POST".to_string()),
        headers: vec![
            "Authorization: Bearer token123".to_string(),
            "Content-Type: application/json".to_string(),
        ],
        data: Some(r#"{"action": "test", "data": "sample"}"#.to_string()),
        max_sent_data: Some(4096),
        max_recv_data: Some(16384),
    };
    
    let response = web_proof(request).await?;
    
    if response.success {
        println!("✅ Proof created successfully!");
        println!("📄 Data: {}", response.data.unwrap());
    } else {
        println!("❌ Error: {}", response.error.unwrap());
    }
    
    Ok(())
}
```

## 📊 API Reference

### Core Functions

#### `web_proof(request: WebProofRequest) -> Result<WebProofResponse>`

Main web proof generation function.

**WebProofRequest:**
```rust
pub struct WebProofRequest {
    pub url: String,                    // Full URL (https://example.com/path)
    pub host: Option<String>,           // Host override
    pub notary: Option<String>,         // Notary server URL
    pub method: Option<String>,         // HTTP method
    pub headers: Vec<String>,           // HTTP headers
    pub data: Option<String>,           // Request body
    pub max_sent_data: Option<usize>,   // Max sent data size
    pub max_recv_data: Option<usize>,   // Max received data size
}
```

**WebProofResponse:**
```rust
pub struct WebProofResponse {
    pub success: bool,              // Operation success
    pub data: Option<String>,       // Proof JSON string
    pub error: Option<String>,      // Error message
}
```

#### `simple_web_proof(notary_host: &str, notary_port: u16, url: &str) -> Result<String>`

Simple proof creation with GET request.

### Utility Functions

```rust
// URL parsing and validation
pub fn parse_url(url: &str) -> Result<ParsedUrl>;
pub fn is_valid_url(url: &str) -> bool;

// Notary client utilities
pub fn create_notary_client(host: &str, port: u16) -> NotaryClient;

// Error handling
pub fn format_error(error: &anyhow::Error) -> String;
```

## 🛠️ Development

### Build Commands

```bash
# Development build
cargo build

# Release build (optimized)
cargo build --release

# Run tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_simple_web_proof

# Benchmark tests
cargo bench

# Documentation
cargo doc --open
```

### Linting & Formatting

```bash
# Format code
cargo fmt

# Lint code
cargo clippy

# Fix lint issues
cargo clippy --fix

# Check without building
cargo check
```

### CLI Development

```bash
# CLI help
cargo run --example cli help

# Test all CLI functions
cargo run --example cli test

# Debug mode with extra output
RUST_LOG=debug cargo run --example cli json '{"url": "https://httpbin.org/get"}'
```

## 🧪 Testing

### Test Suite

```bash
# Run all tests
cargo test

# Unit tests only
cargo test --lib

# Integration tests only
cargo test --test integration

# Example tests
cargo test --example cli

# With coverage
cargo tarpaulin --out Html
```

### Test Categories

- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflow testing
- **CLI Tests**: Command-line interface testing
- **Performance Tests**: Benchmarking and performance validation

### Test Configuration

```rust
// Test with real notary (requires setup)
#[tokio::test]
#[ignore = "requires_notary_server"]
async fn test_real_notary() {
    // Real notary test
}

// Mock test (default)
#[tokio::test]
async fn test_mock_proof() {
    // Mock test
}
```

## 📁 Project Structure

```
rust/
├── src/
│   ├── lib.rs              # Main library interface
│   ├── notarize.rs         # Core TLSN notarization
│   ├── params.rs           # Configuration parameters
│   ├── presentation.rs     # Proof presentation
│   ├── verify.rs           # Proof verification
│   └── napi_bindings.rs    # Node.js NAPI bindings
├── examples/
│   └── cli.rs              # Command-line interface
├── tests/
│   ├── integration.rs      # Integration tests
│   └── common/             # Test utilities
├── benches/
│   └── performance.rs      # Performance benchmarks
├── Cargo.toml              # Project configuration
├── Cargo.lock              # Dependency lock file
└── README.md               # This file
```

## 🔧 Configuration

### Cargo.toml Features

```toml
[features]
default = ["async"]
async = ["tokio"]
napi = ["napi-build", "napi-derive"]
cli = ["clap", "serde_json"]
benchmark = ["criterion"]
```

### Environment Variables

```bash
# Notary server configuration
export NOTARY_HOST="notary.vlayer.xyz"
export NOTARY_PORT="7047"

# Debug logging
export RUST_LOG="debug"
export RUST_BACKTRACE=1

# Performance tuning
export RUST_MIN_STACK=8388608  # 8MB stack
```

## 🚀 Performance

### Benchmarks

```bash
# Run all benchmarks
cargo bench

# Specific benchmark
cargo bench proof_generation

# Compare with baseline
cargo bench -- --save-baseline main
cargo bench -- --baseline main
```

### Optimization Tips

- **Release builds**: Always use `--release` for production
- **LTO**: Link-time optimization enabled
- **CPU-specific**: Use `RUSTFLAGS="-C target-cpu=native"`
- **Memory**: Tune stack size for large proofs

### Performance Metrics

- **Proof Generation**: ~5-10 seconds (depending on response size)
- **Memory Usage**: ~10-50MB (depending on data size)
- **Binary Size**: ~14MB (stripped release build)
- **CPU Usage**: High during crypto operations

## 🌐 NAPI Bindings

### Node.js Integration

```bash
# Build NAPI bindings
cargo build --features napi --release

# Test bindings
node -e "const binding = require('./target/release/vlayer_web_proof.node'); console.log(binding)"
```

### NAPI Features

- ✅ Async function exports
- ✅ Error handling with JS exceptions
- ✅ JSON serialization/deserialization
- ✅ TypeScript definitions generation
- ✅ Cross-platform compilation

## 🔍 Troubleshooting

### Build Issues

```bash
# Clean build artifacts
cargo clean

# Update dependencies
cargo update

# Check toolchain
rustc --version
cargo --version

# Install required tools
rustup component add clippy rustfmt
```

### Runtime Issues

```bash
# Enable debug logging
RUST_LOG=debug cargo run --example cli test

# Check notary connectivity
cargo run --example cli simple notary.vlayer.xyz 7047 https://httpbin.org/get

# Memory debugging
valgrind --tool=memcheck cargo run --example cli test
```

### Common Problems

1. **Notary Connection Failed**: Check network and notary server status
2. **TLS Handshake Error**: Verify HTTPS URL and certificate validity
3. **Memory Issues**: Increase stack size or reduce data limits
4. **Compilation Errors**: Update Rust toolchain and dependencies

## 📚 Dependencies

### Core Dependencies

```toml
[dependencies]
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
url = "2.4"
hyper = { version = "1.0", features = ["full"] }
```

### TLSN Dependencies

```toml
tlsn-core = "0.1.0-alpha.9"
tlsn-prover = "0.1.0-alpha.9"
tlsn-common = "0.1.0-alpha.9"
notary-client = "0.1.0-alpha.9"
```

### Development Dependencies

```toml
[dev-dependencies]
criterion = "0.5"
tokio-test = "0.4"
tempfile = "3.8"
env_logger = "0.10"
```
