use async_trait::async_trait;
use uuid::Uuid;
use crate::errors::repository_error::RepositoryError;
use crate::models::{RefreshToken, User};

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn get_user(&self, id: Uuid) -> Result<Option<User>, RepositoryError>;
    async fn create_user(&self, user: &User) -> Result<User, RepositoryError>;
}

#[async_trait]
pub trait RefreshTokenRepository {
    async fn get_refresh_token_by_id(&self, id: Uuid) -> Result<Option<RefreshToken>, RepositoryError>;
    async fn create_refresh_token(&self, refresh_token: &RefreshToken) -> Result<RefreshToken, RepositoryError>;
}
