use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use uuid::Uuid;
use crate::dto::response::JsonResponse;
use crate::dto::user_requests::UserUpdateRequest;
use crate::dto::user_responses::{UserCreatedResponse, UserDto};
use crate::errors::api_error::ApiError;
use crate::state::AppState;

pub async fn get_user_by_id(State(app_state): State<AppState>, Path(id): Path<Uuid>) -> Result<JsonResponse<UserDto>, ApiError> {
    let user_dto = app_state.user_service.get_user_by_id(id).await?;
    Ok(JsonResponse::new(user_dto, StatusCode::OK))
}

pub async fn create_user(State(app_state): State<AppState>, Json(payload): Json<UserUpdateRequest>) -> Result<JsonResponse<UserCreatedResponse>, ApiError> {
    let response = app_state.user_service.create_user(payload).await?;
    Ok(JsonResponse::new(response, StatusCode::CREATED))
}
