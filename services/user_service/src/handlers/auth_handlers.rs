use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use crate::dto::auth_requests::{LoginRequest, RefreshTokenRequest};
use crate::dto::auth_responses::{LoginResponse, RefreshTokenResponse};
use crate::dto::response::JsonResponse;
use crate::errors::api_error::{ApiError, ErrorResponse};
use crate::state::AppState;

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "User created successfully", body = LoginResponse),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
        (status = 401, description = "Access denied", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub async fn login(State(app_state): State<AppState>, Json(payload): Json<LoginRequest>) -> Result<JsonResponse<LoginResponse>, ApiError> {
    let response = app_state.auth_service.issue_token(payload).await?;
    Ok(JsonResponse::new(response, StatusCode::OK))
}

#[utoipa::path(
    post,
    path = "/auth/refresh",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "User created successfully", body = RefreshTokenResponse),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
        (status = 401, description = "Access denied", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub async fn refresh_token(State(app_state): State<AppState>, Json(payload): Json<RefreshTokenRequest>) -> Result<JsonResponse<RefreshTokenResponse>, ApiError> {
    let response = app_state.auth_service.refresh_token(payload).await?;
    Ok(JsonResponse::new(response, StatusCode::OK))
}
