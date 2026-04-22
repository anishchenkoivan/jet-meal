use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};

pub async fn openapi_yaml() -> Response {
    match crate::openapi::generate_openapi_yaml() {
        Ok(spec) => (
            [(header::CONTENT_TYPE, "application/yaml; charset=utf-8")],
            spec,
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to generate OpenAPI spec: {err}"),
        )
            .into_response(),
    }
}
