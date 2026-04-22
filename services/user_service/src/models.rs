use chrono::NaiveDateTime;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
pub struct NotificationContext {
    pub email: Option<String>,
    pub telegram: Option<String>,
}

#[derive(Debug, Clone, FromRow)]
pub struct UserModel {
    pub id: Uuid,
    pub username: String,
    pub notification_context: NotificationContext,
    pub password_hash: String,
}

#[derive(Debug, Clone, FromRow)]
pub struct RefreshToken {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_hash: String,
    pub expires_at: NaiveDateTime,
    pub create_at: NaiveDateTime,
    pub revoked: bool,
}
