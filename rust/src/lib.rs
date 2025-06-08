mod notarize;
mod params;
mod presentation;
mod verify;

#[cfg(all(feature = "napi", target_arch = "wasm32"))]
compile_error!("napi and wasm32 are mutually exclusive");

#[cfg(feature = "napi")]
mod napi_bindings;

#[cfg(feature = "napi")]
pub use napi_bindings::*;

use anyhow::Result;
use constcat::concat;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use strum::EnumString;
use thiserror::Error;
use url::Url;

// Re-export from our modules
pub use notarize::notarize;
pub use params::{
    Method, NotarizeParams, NotarizeParamsBuilder, NotarizeParamsBuilderError, NotaryConfig,
    NotaryConfigBuilder, NotaryConfigBuilderError, RedactionConfigFn,
};
pub use presentation::create_presentation_with_redaction;
pub use verify::verify_presentation;

// TLSN imports
use rangeset::RangeSet;
use serde_json::Value;
use tlsn_core::transcript::Transcript;

pub const TLSN_VERSION: &str = "0.1.0-alpha.9";
pub const TLSN_VERSION_WITH_V_PREFIX: &str = concat!("v", TLSN_VERSION);

pub struct RedactionConfig {
    pub sent: RangeSet<usize>,
    pub recv: RangeSet<usize>,
}

pub fn no_redaction_config(transcript: &Transcript) -> RedactionConfig {
    RedactionConfig {
        sent: RangeSet::from(0..transcript.sent().len()),
        recv: RangeSet::from(0..transcript.received().len()),
    }
}

pub async fn generate_web_proof(notarize_params: NotarizeParams) -> Result<String> {
    let (attestation, secrets, redaction_config) = notarize(notarize_params.clone()).await?;
    let presentation =
        create_presentation_with_redaction(&attestation, &secrets, &redaction_config)?;
    let encoded_presentation = hex::encode(bincode::serialize(&presentation)?);

    let notary_config = notarize_params.notary_config;

    let json_response = to_json(&encoded_presentation, &notary_config.host, notary_config.port);

    Ok(serde_json::to_string(&json_response)?)
}

fn to_json(encoded_presentation: &str, notary_host: &str, notary_port: u16) -> Value {
    let notary_url = format!("https://{notary_host}:{notary_port}");

    let presentation_json = serde_json::json!({
        "presentationJson": {
            "version": TLSN_VERSION,
            "data": encoded_presentation,
            "meta": {
                "notaryUrl": notary_url,
                "websocketProxyUrl": "",
            },
        }
    });
    presentation_json
}

// v102 CLI'dan kopyalanan hata tipleri ve URL parsing
#[derive(Debug, PartialEq, Eq, EnumString)]
enum Scheme {
    #[strum(serialize = "http")]
    Http,
    #[strum(serialize = "https")]
    Https,
}

const DEFAULT_NOTARY_URL: &str = "https://test-notary.vlayer.xyz/";
const DEFAULT_MAX_SENT_DATA: usize = 1 << 12;
const DEFAULT_MAX_RECV_DATA: usize = 1 << 14;

#[derive(Debug, Error)]
pub enum InputError {
    #[error("URL has no host: {0}")]
    MissingUrlHost(String),
    #[error("Invalid URL format: {0}")]
    InvalidUrlFormat(String),
    #[error("Invalid URL protocol: {0}")]
    InvalidUrlProtocol(String),
    #[error("Invalid header format: {0}")]
    InvalidHeaderFormat(String),
    #[error("Invalid notarize params: {0}")]
    NotarizeParams(#[from] NotarizeParamsBuilderError),
    #[error("Invalid notary config: {0}")]
    NotaryConfig(#[from] NotaryConfigBuilderError),
}

#[derive(Debug)]
struct ValidatedUrl {
    url: Url,
    host: String,
    scheme: Scheme,
    port: u16,
}

#[derive(Debug)]
struct ProvenUrl {
    host: String,
    port: u16,
}

impl ValidatedUrl {
    fn try_from_url(url_str: &str, allowed_schemes: &[Scheme]) -> Result<Self, InputError> {
        let url =
            Url::parse(url_str).map_err(|_| InputError::InvalidUrlFormat(url_str.to_string()))?;
        let scheme = Scheme::from_str(url.scheme())
            .map_err(|_| InputError::InvalidUrlProtocol(url.scheme().to_string()))?;
        if !allowed_schemes.contains(&scheme) {
            return Err(InputError::InvalidUrlProtocol(url.scheme().to_string()));
        }
        let host = url
            .host_str()
            .ok_or_else(|| InputError::MissingUrlHost(url_str.to_string()))?
            .to_string();
        let port = url.port().unwrap_or(match scheme {
            Scheme::Https => 443,
            Scheme::Http => 80,
        });

        Ok(Self {
            url,
            host,
            scheme,
            port,
        })
    }
}

fn parse_proven_url(url_str: &str) -> Result<ProvenUrl, InputError> {
    // Only https is allowed for proven urls as it does not make sense to prove http urls (not tls => no tlsn)
    let ValidatedUrl { host, port, .. } = ValidatedUrl::try_from_url(url_str, &[Scheme::Https])?;

    let url = ProvenUrl { host, port };

    Ok(url)
}

fn parse_notary_url(url_str: &str) -> Result<NotaryConfig, InputError> {
    let ValidatedUrl {
        url,
        host,
        scheme,
        port,
    } = ValidatedUrl::try_from_url(url_str, &[Scheme::Https, Scheme::Http])?;

    let path_prefix = url.path().trim_matches('/');
    let enable_tls = scheme == Scheme::Https;

    let config = NotaryConfigBuilder::default()
        .host(host)
        .port(port)
        .path_prefix(path_prefix)
        .enable_tls(enable_tls)
        .build()?;

    Ok(config)
}

fn parse_header(header_str: impl AsRef<str>) -> Result<(String, String), InputError> {
    header_str
        .as_ref()
        .split_once(':')
        .map(|(key, value)| (key.trim().to_string(), value.trim().to_string()))
        .ok_or(InputError::InvalidHeaderFormat(header_str.as_ref().to_string()))
        .and_then(|(key, value)| {
            (!key.is_empty() && !value.is_empty())
                .then_some((key, value))
                .ok_or(InputError::InvalidHeaderFormat(header_str.as_ref().to_string()))
        })
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WebProofRequest {
    pub url: String,
    pub host: Option<String>,
    pub notary: Option<String>,
    pub method: Option<String>,
    pub headers: Vec<String>,
    pub data: Option<String>,
    pub max_sent_data: Option<usize>,
    pub max_recv_data: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebProofResponse {
    pub success: bool,
    pub data: Option<String>,
    pub error: Option<String>,
}

/// Main web_proof function - creates web proof asynchronously
pub async fn web_proof(request: WebProofRequest) -> Result<WebProofResponse> {
    match try_create_web_proof(request).await {
        Ok(proof) => Ok(WebProofResponse {
            success: true,
            data: Some(proof),
            error: None,
        }),
        Err(e) => Ok(WebProofResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

async fn try_create_web_proof(request: WebProofRequest) -> Result<String> {
    let params = convert_request_to_params(request)?;
    generate_web_proof(params).await
}

fn convert_request_to_params(request: WebProofRequest) -> Result<NotarizeParams, InputError> {
    let ProvenUrl { host, port } = parse_proven_url(&request.url)?;

    // For server_domain, always use the domain from URL (for TLS certificate)
    let server_domain = host.clone();
    
    // For server_host, use override if provided, otherwise use domain
    let server_host = request.host.clone().unwrap_or(host);
    
    // For server_port, if host is overridden, use standard HTTPS port, otherwise use URL port
    let server_port = if request.host.is_some() { 443 } else { port };

    let max_sent_data = request.max_sent_data.unwrap_or(DEFAULT_MAX_SENT_DATA);
    let max_recv_data = request.max_recv_data.unwrap_or(DEFAULT_MAX_RECV_DATA);

    let method = if let Some(method_str) = request.method {
        match method_str.to_uppercase().as_str() {
            "GET" => Method::GET,
            "POST" => Method::POST,
            "PUT" => Method::PUT,
            "DELETE" => Method::DELETE,
            "PATCH" => Method::PATCH,
            "HEAD" => Method::HEAD,
            "OPTIONS" => Method::OPTIONS,
            _ => Method::GET,
        }
    } else if request.data.is_some() {
        Method::POST
    } else {
        Method::GET
    };

    let notary_url = request.notary.as_deref().unwrap_or(DEFAULT_NOTARY_URL);
    let notary_config = parse_notary_url(notary_url)?;

    let parsed_url = Url::parse(&request.url)
        .map_err(|_| InputError::InvalidUrlFormat(request.url.clone()))?;

    let uri = format!("{}{}", parsed_url.path(), 
        parsed_url.query().map(|q| format!("?{}", q)).unwrap_or_default());

    let headers: Result<Vec<(String, String)>, _> = request.headers
        .iter()
        .map(|h| parse_header(h))
        .collect();

    let params = NotarizeParamsBuilder::default()
        .notary_config(notary_config)
        .server_domain(server_domain)
        .server_host(server_host)
        .server_port(server_port)
        .uri(uri)
        .method(method)
        .headers(headers?)
        .body(request.data.unwrap_or_default().as_bytes())
        .max_sent_data(max_sent_data)
        .max_recv_data(max_recv_data)
        .build()?;

    Ok(params)
}

/// Simple web_proof function - with minimum parameters
pub async fn simple_web_proof(
    notary_host: &str,
    notary_port: u16,
    url: &str,
) -> Result<String> {
    let request = WebProofRequest {
        url: url.to_string(),
        host: None,
        notary: Some(format!("http://{}:{}", notary_host, notary_port)),
        method: None,
        headers: vec![],
        data: None,
        max_sent_data: None,
        max_recv_data: None,
    };

    let response = web_proof(request).await?;
    
    if response.success {
        response.data.ok_or_else(|| anyhow::anyhow!("No data in successful response"))
    } else {
        Err(anyhow::anyhow!("Web proof failed: {}", response.error.unwrap_or_default()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_json_structure() {
        let json = to_json("48656c6c6f20576f726c64", "127.0.0.1", 7047);

        assert!(json.is_object());
        assert_eq!(json["presentationJson"]["version"], TLSN_VERSION);
        assert_eq!(json["presentationJson"]["data"], "48656c6c6f20576f726c64");
        assert_eq!(json["presentationJson"]["meta"]["notaryUrl"], "https://127.0.0.1:7047");
        assert_eq!(json["presentationJson"]["meta"]["websocketProxyUrl"], "");
    }

    #[test]
    fn test_parse_header_success() {
        let result = parse_header("Authorization: Bearer token123");
        assert!(result.is_ok());
        let (key, value) = result.unwrap();
        assert_eq!(key, "Authorization");
        assert_eq!(value, "Bearer token123");
    }

    #[test]
    fn test_parse_header_failure() {
        let result = parse_header("InvalidHeader");
        assert!(result.is_err());
    }
} 