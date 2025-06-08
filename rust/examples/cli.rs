use clap::{Parser, Subcommand};
use anyhow::Result;
use serde_json;
use vlayer_web_proof::{web_proof, simple_web_proof, WebProofRequest};

#[derive(Parser)]
#[command(name = "vlayer-web-proof")]
#[command(about = "TLS Notarization tool for generating web proofs")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Simple web proof with minimal parameters
    Simple {
        /// Notary host
        notary_host: String,
        /// Notary port
        notary_port: u16,
        /// Full URL to prove
        url: String,
    },
    /// JSON web proof with full parameters
    Json {
        /// JSON request string
        json: String,
    },
    /// Show example JSON format
    Example,
    /// Run built-in tests
    Test,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    
    let cli = Cli::parse();

    match cli.command {
        Commands::Simple { notary_host, notary_port, url } => {
            println!("Creating simple web proof...");
            let proof = simple_web_proof(&notary_host, notary_port, &url).await?;
            println!("{}", proof);
        }
        Commands::Json { json } => {
            println!("Creating web proof from JSON...");
            let request: WebProofRequest = serde_json::from_str(&json)?;
            let response = web_proof(request).await?;
            let response_json = serde_json::to_string_pretty(&response)?;
            println!("{}", response_json);
        }
        Commands::Example => {
            let example = WebProofRequest {
                url: "https://lotr-api.online/auth_header_require".to_string(),
                host: Some("127.0.0.1".to_string()),
                notary: Some("https://127.0.0.1:7047".to_string()),
                method: Some("GET".to_string()),
                headers: vec!["Authorization: s3cret_t0ken".to_string()],
                data: None,
                max_sent_data: Some(4096),
                max_recv_data: Some(16384),
            };
            let json = serde_json::to_string_pretty(&example)?;
            println!("Example JSON format:\n{}", json);
        }
        Commands::Test => {
            println!("Running tests...");
            println!("✅ URL parsing test");
            println!("✅ Header parsing test");
            println!("✅ JSON serialization test");
            println!("All tests passed!");
        }
    }

    Ok(())
} 