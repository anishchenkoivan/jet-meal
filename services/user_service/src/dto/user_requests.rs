use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema, Clone)]
pub struct UserCreateRequest {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct UserUpdateRequest {
    pub username: Option<String>,
}
