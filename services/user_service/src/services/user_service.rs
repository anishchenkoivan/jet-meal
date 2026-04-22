use std::sync::Arc;
use crate::dto::user_requests::UserCreateRequest;
use crate::dto::user_responses::{UserCreatedResponse, User};
use crate::errors::domain_error::DomainError;
use crate::models::UserModel;
use crate::repositories::repository_traits::UserRepository;
use crate::services::security_service::SecurityService;

pub struct UserService {
    user_repo: Arc<dyn UserRepository>,
    security_service: SecurityService,
}

impl UserService {
    pub async fn get_user_by_id(&self, id: uuid::Uuid) -> Result<User, DomainError> {
        let user: UserModel = self.user_repo.get_user(id).await?.ok_or(DomainError::NotFound("User not found".to_string()))?;
        Ok(User{
            id: user.id,
            username: user.username,
            notification_context: user.notification_context,
        })
    }

    pub async fn create_user(&self, user_data: UserCreateRequest) -> Result<UserCreatedResponse, DomainError> {
        let user = UserModel{
            id: uuid::Uuid::new_v4(),
            username: user_data.username,
            notification_context: user_data.notification_context,
            password_hash: self.security_service.hash_password(&user_data.password)?,
        };
        self.user_repo.create_user(&user).await?;
        Ok(UserCreatedResponse{
            id: user.id,
        })
    }

    pub async fn get_user_by_username(&self, username: &str) -> Result<UserModel, DomainError> {
        self.user_repo
            .get_user_by_username(username)
            .await?
            .ok_or(DomainError::NotFound("User not found".to_string()))
    }
}

impl UserService {
    pub fn new(user_repo: Arc<dyn UserRepository>) -> Self {
        Self {
            user_repo,
            security_service: SecurityService::new(),
        }
    }
}
