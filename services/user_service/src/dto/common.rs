use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToScema)]
pub struct NotificationContext {
    pub email: Option<String>,
    pub telegram: Option<String>
}
