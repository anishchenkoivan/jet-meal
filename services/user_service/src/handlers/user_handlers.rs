use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use uuid::Uuid;
use crate::dto::response::JsonResponse;
use crate::dto::user_requests::UserUpdateRequest;
use crate::dto::user_responses::{UserCreatedResponse, UserDto};
use crate::errors::api_error::{ApiError, ErrorResponse};
use crate::state::AppState;

#[utoipa::path(
    get,
    path = "/users/{id}",
    params(
        ("id" = Uuid, Path, description = "User's unique identifier")
    ),
    responses(
        (status = 200, description = "User found successfully", body = UserDto),
        (status = 404, description = "User not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "users"
)]
pub async fn get_user_by_id(State(app_state): State<AppState>, Path(id): Path<Uuid>) -> Result<JsonResponse<UserDto>, ApiError> {
    let user_dto = app_state.user_service.get_user_by_id(id).await?;
    Ok(JsonResponse::new(user_dto, StatusCode::OK))
}

#[utoipa::path(
    post,
    path = "/users/create",
    request_body = UserUpdateRequest,
    responses(
        (status = 201, description = "User created successfully", body = UserCreatedResponse),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
        (status = 409, description = "User already exists", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "users"
)]
pub async fn create_user(State(app_state): State<AppState>, Json(payload): Json<UserUpdateRequest>) -> Result<JsonResponse<UserCreatedResponse>, ApiError> {
    let response = app_state.user_service.create_user(payload).await?;
    Ok(JsonResponse::new(response, StatusCode::CREATED))
}
