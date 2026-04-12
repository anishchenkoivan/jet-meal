use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Serialize, ToSchema)]
pub struct UserDto {
    pub id: Uuid,
    pub name: String
}

#[derive(Serialize, ToSchema)]
pub struct UserCreatedResponse {
    pub id: Uuid
}
