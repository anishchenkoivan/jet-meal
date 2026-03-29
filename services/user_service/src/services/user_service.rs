use std::sync::Arc;
use crate::dto::user_requests::UserUpdateRequest;
use crate::dto::user_responses::{UserCreatedResponse, UserDto};
use crate::errors::domain_error::DomainError;
use crate::models::User;
use crate::repositories::repository_traits::UserRepository;

pub struct UserService {
    user_repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub async fn get_user_by_id(&self, id: uuid::Uuid) -> Result<UserDto, DomainError> {
        let user: User = self.user_repo.get_user(id).await?.ok_or(DomainError::NotFound("User not found".to_string()))?;
        Ok(UserDto{
            id: user.id,
            name: user.name,
        })
    }

    pub async fn create_user(&self, user_data: UserUpdateRequest) -> Result<UserCreatedResponse, DomainError> {
        // TODO: add proper error handling here
        let user = self.user_repo.create_user(&user_data.name).await?;
        Ok(UserCreatedResponse{
            id: user.id,
        })
    }
}

impl UserService {
    pub fn new(user_repo: Arc<dyn UserRepository>) -> Self {
        Self {
            user_repo,
        }
    }
}
