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
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users where id = $1"
        ).bind(id).fetch_optional(&self.pool).await?;
        Ok(user)
    }

    async fn get_user_by_username(&self, username: &str) -> Result<Option<User>, RepositoryError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE username = $1"
        )
            .bind(username)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }

    async fn create_user(&self, user: &User) -> Result<bool, RepositoryError> {
        let result = sqlx::query(
            "INSERT INTO users
                (id, username, email, telegram, password_hash)
                VALUES ($1, $2, $3, $4, $5)"
        )
            .bind(&user.id)
            .bind(&user.username)
            .bind(&user.email)
            .bind(&user.telegram)
            .bind(&user.password_hash)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() == 1)
    }
}
