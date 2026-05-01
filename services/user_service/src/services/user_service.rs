use std::sync::Arc;
use crate::dto::auth_requests::AuthUpdateRequest;
use crate::dto::user_requests::{UserCreateRequest, UserUpdateRequest};
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
        Ok(user.into())
    }

    pub async fn create_user(&self, user_data: UserCreateRequest) -> Result<UserCreatedResponse, DomainError> {
        let user = UserModel{
            id: uuid::Uuid::new_v4(),
            username: user_data.username,
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

    pub async fn update_user(&self, id: uuid::Uuid, user_data: UserUpdateRequest) -> Result<User, DomainError> {
        let user = self.user_repo.get_user(id).await?.ok_or(DomainError::NotFound("User not found".to_string()))?;
        let updated_user = self.update_user_model(user, user_data);
        self.user_repo.update_user(&updated_user).await?;
        Ok(updated_user.into())
    }

    pub async fn update_user_auth(&self, id: uuid::Uuid, auth_data: AuthUpdateRequest) -> Result<User, DomainError> {
        let user = self.user_repo.get_user(id).await?.ok_or(DomainError::NotFound("User not found".to_string()))?;
        let updated_user = self.update_user_model_auth(user, auth_data)?;
        self.user_repo.update_user(&updated_user).await?;
        Ok(updated_user.into())
    }

    fn update_user_model(&self, user: UserModel, update_data: UserUpdateRequest) -> UserModel {
        UserModel {
            id: user.id,
            username: update_data.username.unwrap_or(user.username),
            password_hash: user.password_hash,
        }
    }

    fn update_user_model_auth(&self, user: UserModel, update_data: AuthUpdateRequest) -> Result<UserModel, DomainError> {
        Ok(
            UserModel {
                id: user.id,
                username: user.username,
                password_hash: self.security_service.hash_password(&update_data.password)?
            }
        )
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
