use serde::Serialize;
use crate::models::NotificationContext;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Serialize, ToSchema)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub notification_context: NotificationContext,
}

#[derive(Serialize, ToSchema)]
pub struct UserCreatedResponse {
    pub id: Uuid
}
