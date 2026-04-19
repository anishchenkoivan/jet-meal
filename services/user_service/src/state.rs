use std::sync::Arc;
use sqlx::PgPool;
use crate::services::auth_service::AuthService;
use crate::services::user_service::UserService;

#[derive(Clone)]
pub struct AppState {
    pub user_service: Arc<UserService>,
    pub auth_service: Arc<AuthService>,
    pub db_pool: PgPool,
}
