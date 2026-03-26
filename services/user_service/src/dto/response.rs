use axum::http::StatusCode;
use axum::Json;
use axum::response::{IntoResponse, Response};
use serde::Serialize;

// Unsure if it's a good way to fix the return type or if the return type should be fixed at all
pub struct JsonResponse<T: Serialize> {
    body: T,
    status: StatusCode
}

impl <T:Serialize> JsonResponse<T> {
    pub fn new(body: T, status: StatusCode) -> Self {
        Self { body, status }
    }
}

impl <T:Serialize> IntoResponse for JsonResponse<T> {
    fn into_response(self) -> Response {
        (self.status, Json(self.body)).into_response()
    }
}
