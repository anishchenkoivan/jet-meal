use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;
use crate::models::UserModel;

#[derive(Serialize, ToSchema)]
pub struct User {
    pub id: Uuid,
    pub username: String,
}

#[derive(Serialize, ToSchema)]
pub struct UserCreatedResponse {
    pub id: Uuid
}

impl From<UserModel> for User {
    fn from(model: UserModel) -> Self {
        Self {
            id: model.id,
            username: model.username,
        }
    }
}
