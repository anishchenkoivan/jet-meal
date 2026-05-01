use std::sync::Arc;
use chrono::{Duration, Utc};
use jsonwebtoken::{EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::config::SecurityConfig;
use crate::dto::auth_requests::{AuthUpdateRequest, LoginRequest, RefreshTokenRequest};
use crate::dto::auth_responses::{LoginResponse, RefreshTokenResponse};
use crate::errors::domain_error::DomainError;
use crate::models::RefreshToken;
use crate::repositories::repository_traits::RefreshTokenRepository;
use crate::services::security_service::SecurityService;
use crate::services::user_service::UserService;

#[derive(Debug, Serialize, Deserialize)]
struct AccessTokenClaims {
    sub: String,
    exp: usize,
    iat: usize,
}

pub struct AuthService {
    token_repo: Arc<dyn RefreshTokenRepository>,
    user_service: Arc<UserService>,
    security_service: Arc<SecurityService>,
    security_config: SecurityConfig,
}

impl AuthService {
    pub async fn issue_token(&self, login_request: LoginRequest) -> Result<LoginResponse, DomainError> {
        let user = self.user_service.get_user_by_username(&login_request.username).await?;

        if !self.security_service.verify_password(&login_request.password, &user.password_hash) {
            return Err(DomainError::AccessError("Invalid credentials".to_string()));
        }

        let access_token = self.issue_jwt(user.id).await?;

        let refresh_id = Uuid::new_v4();
        let refresh_secret = self.security_service.generate_secure_token(64);
        let refresh_token_db = RefreshToken {
            id: refresh_id,
            user_id: user.id,
            token_hash: self.security_service.hash_password(&refresh_secret)?,
            expires_at: (Utc::now() + Duration::days(self.security_config.refresh_token_ttl_days)).naive_utc(),
            create_at: Utc::now().naive_utc(),
            revoked: false,
        };

        self.token_repo.create_refresh_token(&refresh_token_db).await?;

        Ok(LoginResponse {
            access_token,
            refresh_token: format!("{}.{}", refresh_id, refresh_secret),
        })
    }

    pub async fn refresh_token(&self, refresh_token_request: RefreshTokenRequest) -> Result<RefreshTokenResponse, DomainError> {
        let (token_id, secret) = refresh_token_request.refresh_token
            .split_once('.')
            .ok_or_else(|| DomainError::AccessError("Invalid refresh token format".to_string()))?;

        let refresh_id = Uuid::parse_str(token_id)
            .map_err(|_| DomainError::AccessError("Invalid refresh token id".to_string()))?;

        let db_token = self.token_repo
            .get_refresh_token_by_id(refresh_id)
            .await?
            .ok_or_else(|| DomainError::AccessError("Refresh token not found".to_string()))?;

        if db_token.revoked {
            return Err(DomainError::AccessError("Refresh token revoked".to_string()));
        }

        if db_token.expires_at <= Utc::now().naive_utc() {
            self.token_repo.revoke_refresh_token(db_token.id).await?;
            return Err(DomainError::AccessError("Refresh token expired".to_string()));
        }

        if !self.security_service.verify_password(secret, &db_token.token_hash) {
            return Err(DomainError::AccessError("Invalid refresh token".to_string()));
        }

        let access_token = self.issue_jwt(db_token.user_id).await?;

        Ok(RefreshTokenResponse { access_token })
    }

    pub async fn update_auth_details(&self, user_id: Uuid, updated_details: AuthUpdateRequest) -> Result<LoginResponse, DomainError> {
        let user = self.user_service.update_user_auth(user_id, updated_details.clone()).await?;
        self.invalidate_all_tokens_for_user(user_id).await?;
        self.issue_token(LoginRequest{
            username: user.username,
            password: updated_details.password,
        }).await
    }

    async fn issue_jwt(&self, user_id: Uuid) -> Result<String, DomainError> {
        let now = Utc::now();
        let exp = (now + Duration::minutes(self.security_config.access_token_ttl_minutes)).timestamp() as usize;
        let claims = AccessTokenClaims {
            sub: user_id.to_string(),
            exp,
            iat: now.timestamp() as usize,
        };

        let secret = self.security_config.jwt_secret.clone();

        encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
            .map_err(|e| DomainError::Internal(format!("JWT encode failed: {e}")))
    }

    async fn invalidate_all_tokens_for_user(&self, user_id: Uuid) -> Result<(), DomainError> {
        self.token_repo.revoke_refresh_tokens_for_user(user_id).await?;
        Ok(())
    }
}

impl AuthService {
    pub fn new(
        token_repo: Arc<dyn RefreshTokenRepository>,
        user_service: Arc<UserService>,
        security_config: SecurityConfig
    ) -> Self {
        Self {
            token_repo,
            user_service,
            security_service: Arc::new(SecurityService::new()),
            security_config,
        }
    }
}
