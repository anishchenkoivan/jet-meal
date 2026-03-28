use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::repository_error::RepositoryError;
use crate::models::User;
use crate::repositories::repository_traits::UserRepository;

pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool
        }
    }
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn get_user(&self, id: Uuid) -> Result<Option<User>, RepositoryError> {
        let user = sqlx::query_as!(
            User,
            "SELECT id, name FROM users where id = $1",
            id
        ).fetch_optional(&self.pool).await?;
        Ok(user)
    }

    async fn create_user(&self, name: &str) -> Result<User, RepositoryError> {
        let id = Uuid::new_v4();

        let user = sqlx::query_as!(
            User,
            "INSERT INTO users (id, name) VALUES ($1, $2) RETURNING id, name",
            id,
            name,
        ).fetch_one(&self.pool).await?;
        Ok(user)
    }
}
