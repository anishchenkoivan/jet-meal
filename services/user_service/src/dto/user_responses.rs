use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct UserDto {
    pub id: Uuid,
    pub name: String
}

#[derive(Serialize)]
pub struct UserCreatedResponse {
    pub id: Uuid
}
