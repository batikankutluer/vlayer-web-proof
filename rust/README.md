# Web Proof Generator - v102 Compatible Rust Library

This project is a **standalone** Rust implementation for generating web proofs using TLS Notarization (TLSN) technology. Developed by referencing the latest code from the v102 repository.

## 🚀 Features

- ✅ **v102 Compatible** - Uses current TLSN implementation from vlayer v102
- ✅ **Standalone** - No external dependencies required
- ✅ Async `web_proof` function
- ✅ Simple `simple_web_proof` function
- ✅ JSON-based request/response structure
- ✅ All HTTP methods support (GET, POST, PUT, DELETE, etc.)
- ✅ Customizable headers
- ✅ Command-line interface (CLI example)
- ✅ Comprehensive test suite
- ✅ Self-contained TLSN implementation

## 📦 Installation

```bash
cd vlayer-web-proof/rust
cargo build --release
```

## 🔧 Usage

### CLI Example

#### Simple Usage
```bash
cargo run --example cli simple 127.0.0.1 7047 https://httpbin.org/get
```

#### JSON Usage
```bash
cargo run --example cli json '{
  "url": "https://httpbin.org/get",
  "host": null,
  "notary": "http://127.0.0.1:7047",
  "method": "GET",
  "headers": ["Authorization: Bearer token123"],
  "data": null,
  "max_sent_data": 4096,
  "max_recv_data": 16384
}'
```

#### View Example JSON Format
```bash
cargo run --example cli example
```

#### Run Tests
```bash
cargo run --example cli test
cargo test
```

### Code Usage

```rust
use vlayer_web_proof::{web_proof, simple_web_proof, WebProofRequest};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Simple usage
    let proof = simple_web_proof(
        "127.0.0.1", 
        7047, 
        "https://httpbin.org/get"
    ).await?;
    
    println!("Proof: {}", proof);
    
    // Detailed usage
    let request = WebProofRequest {
        url: "https://httpbin.org/post".to_string(),
        host: None, // Automatically extracted from URL
        notary: Some("http://127.0.0.1:7047".to_string()),
        method: Some("POST".to_string()),
        headers: vec![
            "Authorization: Bearer token123".to_string(),
            "Content-Type: application/json".to_string(),
        ],
        data: Some(r#"{"name": "Vlayer"}"#.to_string()),
        max_sent_data: Some(4096),
        max_recv_data: Some(16384),
    };
    
    let response = web_proof(request).await?;
    
    if response.success {
        println!("Proof generated: {}", response.data.unwrap());
    } else {
        println!("Error: {}", response.error.unwrap());
    }
    
    Ok(())
}
```

## 📋 API Reference

### `web_proof(request: WebProofRequest) -> Result<WebProofResponse>`

Main web proof generation function.

**WebProofRequest:**
- `url: String` - Full URL (https://example.com/path)
- `host: Option<String>` - Optional host override
- `notary: Option<String>` - Notary server URL
- `method: Option<String>` - HTTP method ("GET", "POST", etc.)
- `headers: Vec<String>` - HTTP headers in "Header-Name: Header-Value" format
- `data: Option<String>` - Request body
- `max_sent_data: Option<usize>` - Maximum sent data size
- `max_recv_data: Option<usize>` - Maximum received data size

**WebProofResponse:**
- `success: bool` - Was the operation successful?
- `data: Option<String>` - Proof data (JSON string)
- `error: Option<String>` - Error message

### `simple_web_proof(notary_host, notary_port, url) -> Result<String>`

Simple web proof generation function. Makes a GET request with minimal parameters.

## 🧪 Tests

```bash
# Run unit tests
cargo test

# Run CLI tests
cargo run --example cli test
```

## 🛠️ Development

```bash
# Run in development mode
cargo run --example cli test

# Build in release mode
cargo build --release

# Linting
cargo clippy

# Formatting
cargo fmt
```

## 📝 Architecture

This project includes the current TLSN implementation from the v102 repository:

- **`lib.rs`** - Main library interface, URL parsing and web proof generation
- **`notarize.rs`** - Core notarization logic and MPC-TLS
- **`params.rs`** - Configuration parameters and builders
- **`presentation.rs`** - Proof presentation generation
- **`verify.rs`** - Proof verification functions
- **`napi_bindings.rs`** - Node.js integration (optional)

## 🔗 Dependencies

Main v102 compatible dependencies:
- `tlsn-core`, `tlsn-prover`, `tlsn-common` - Core TLSN protocol
- `notary-client` - Notary server communication
- `hyper`, `hyper-util` - HTTP client functionality
- `tokio` - Async runtime
- `rangeset` - Data range management for redaction

## 📝 Notes

- **v102 Compatible**: Uses the current code structure from vlayer v102
- **Notary server**: A notary server must be running for actual proof generation
- **HTTPS Only**: Only HTTPS URLs are supported (TLSN is not possible with HTTP due to lack of TLS)
- **Node.js Ready**: Ready to be ported to Node.js with NAPI feature

## 🔄 Node.js Port Plan

1. ✅ **Phase 1**: Standalone Rust version (current)
2. ✅ **Phase 2**: NAPI integration with Node.js
3. ✅ **Phase 3**: TypeScript bindings
4. 🔄 **Phase 4**: NPM package publication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request 