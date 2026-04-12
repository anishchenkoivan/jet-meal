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
        todo!()
    }

    async fn create_refresh_token(&self, refresh_token: &RefreshToken) -> Result<RefreshToken, RepositoryError> {
        todo!()
    }
}
