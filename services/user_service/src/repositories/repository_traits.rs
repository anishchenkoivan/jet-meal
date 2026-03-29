use async_trait::async_trait;
use uuid::Uuid;
use crate::errors::repository_error::RepositoryError;
use crate::models::User;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn get_user(&self, id: Uuid) -> Result<Option<User>, RepositoryError>;
    async fn create_user(&self, name: &str) -> Result<User, RepositoryError>;
}
