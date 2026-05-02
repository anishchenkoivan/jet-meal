use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema, Clone)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct AuthUpdateRequest {
    pub password: String,
}
