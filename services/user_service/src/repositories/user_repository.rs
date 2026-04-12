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

    async fn create_user(&self, user: &User) -> Result<User, RepositoryError> {
        let user = sqlx::query_as::<_, User>(
            "INSERT INTO users
                (id, username, email, telegram, max, password_hash)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, name")
            .bind(&user.id)
            .bind(&user.username)
            .bind(&user.email)
            .bind(&user.telegram)
            .bind(&user.max)
            .bind(&user.password_hash)
            .fetch_one(&self.pool).await?;
        Ok(user)
    }
}
