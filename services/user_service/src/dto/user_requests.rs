use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct UserCreateRequest {
    pub name: String,
    pub email: Option<String>,
    pub telegram: Option<String>,
    pub password: String,
}
