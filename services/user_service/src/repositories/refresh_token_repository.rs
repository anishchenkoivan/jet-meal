use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::repository_error::RepositoryError;
use crate::models::RefreshToken;
use crate::repositories::repository_traits::RefreshTokenRepository;

pub struct PostgresRefreshTokenRepository {
    pool: PgPool,
}

impl PostgresRefreshTokenRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl RefreshTokenRepository for PostgresRefreshTokenRepository {
    async fn get_refresh_token_by_id(&self, id: Uuid) -> Result<Option<RefreshToken>, RepositoryError> {
        let token = sqlx::query_as::<_, RefreshToken>(
            "SELECT id, user_id, token_hash, expires_at, created_at AS create_at, revoked
            FROM refresh_tokens
            WHERE id = $1"
        )
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(token)
    }

    async fn create_refresh_token(&self, refresh_token: &RefreshToken) -> Result<RefreshToken, RepositoryError> {
        let token = sqlx::query_as::<_, RefreshToken>(
            "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, token_hash, expires_at, created_at AS create_at, revoked"
        )
            .bind(refresh_token.id)
            .bind(refresh_token.user_id)
            .bind(&refresh_token.token_hash)
            .bind(refresh_token.expires_at)
            .bind(refresh_token.create_at)
            .bind(refresh_token.revoked)
            .fetch_one(&self.pool)
            .await?;
        Ok(token)
    }

    async fn revoke_refresh_token(&self, id: Uuid) -> Result<(), RepositoryError> {
        sqlx::query("UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
