use std::sync::Arc;
use crate::repositories::repository_traits::{RefreshTokenRepository, UserRepository};

pub struct AuthService {
    token_repo: Arc<dyn RefreshTokenRepository>,
    user_repo: Arc<dyn UserRepository>
}

impl AuthService {
    pub async fn issue_jwt() {}
    pub async fn login() {}
}

impl AuthService {
    pub fn new(token_repo: Arc<dyn RefreshTokenRepository>, user_repo: Arc<dyn UserRepository>) -> Self {
        Self {
            token_repo,
            user_repo
        }
    }
}