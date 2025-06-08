use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};

use crate::{web_proof, simple_web_proof, WebProofRequest as InternalWebProofRequest, WebProofResponse as InternalWebProofResponse};

#[napi(object)]
#[derive(Debug, Serialize, Deserialize)]
pub struct WebProofRequest {
  pub url: String,
  pub host: Option<String>,
  pub notary: Option<String>,
  pub method: Option<String>,
  pub headers: Vec<String>,
  pub data: Option<String>,
  #[napi(js_name = "maxSentData")]
  pub max_sent_data: Option<u32>,
  #[napi(js_name = "maxRecvData")]
  pub max_recv_data: Option<u32>,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize)]
pub struct WebProofResponse {
  pub success: bool,
  pub data: Option<String>,
  pub error: Option<String>,
}

impl From<WebProofRequest> for InternalWebProofRequest {
  fn from(req: WebProofRequest) -> Self {
    InternalWebProofRequest {
      url: req.url,
      host: req.host,
      notary: req.notary,
      method: req.method,
      headers: req.headers,
      data: req.data,
      max_sent_data: req.max_sent_data.map(|x| x as usize),
      max_recv_data: req.max_recv_data.map(|x| x as usize),
    }
  }
}

impl From<InternalWebProofResponse> for WebProofResponse {
  fn from(resp: InternalWebProofResponse) -> Self {
    WebProofResponse {
      success: resp.success,
      data: resp.data,
      error: resp.error,
    }
  }
}

#[napi]
pub async fn generate_web_proof(request: WebProofRequest) -> Result<WebProofResponse> {
  let internal_request: InternalWebProofRequest = request.into();
  
  match web_proof(internal_request).await {
    Ok(response) => Ok(response.into()),
    Err(e) => Ok(WebProofResponse {
      success: false,
      data: None,
      error: Some(e.to_string()),
    }),
  }
}

#[napi]
pub async fn generate_simple_web_proof(
  notary_host: String,
  notary_port: u16,
  url: String,
) -> Result<String> {
  match simple_web_proof(&notary_host, notary_port, &url).await {
    Ok(proof) => Ok(proof),
    Err(e) => Err(Error::new(Status::GenericFailure, e.to_string())),
  }
} 