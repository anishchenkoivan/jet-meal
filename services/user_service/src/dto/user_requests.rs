use serde::Deserialize;
use crate::models::NotificationContext;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct UserCreateRequest {
    pub username: String,
    pub notification_context: NotificationContext,
    pub password: String,
}
