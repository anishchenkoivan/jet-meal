use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::repository_error::RepositoryError;
use crate::models::UserModel;
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
    async fn get_user(&self, id: Uuid) -> Result<Option<UserModel>, RepositoryError> {
        let user = sqlx::query_as::<_, UserModel>(
            "SELECT * FROM users where id = $1"
        ).bind(id).fetch_optional(&self.pool).await?;
        Ok(user.map(UserModel::from))
    }

    async fn get_user_by_username(&self, username: &str) -> Result<Option<UserModel>, RepositoryError> {
        let user: Option<UserModel> = sqlx::query_as::<_, UserModel>(
            "SELECT * FROM users WHERE username = $1"
        )
            .bind(username)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user.map(UserModel::from))
    }

    async fn create_user(&self, user_model: &UserModel) -> Result<bool, RepositoryError> {
        let result = sqlx::query(
            "INSERT INTO users
                (id, username, password_hash)
                VALUES ($1, $2, $3)"
        )
            .bind(&user_model.id)
            .bind(&user_model.username)
            .bind(&user_model.password_hash)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() == 1)
    }

    async fn update_user(&self, user: &UserModel) -> Result<bool, RepositoryError> {
        let result = sqlx::query(
            "UPDATE users SET
                 username = $1,
                 password_hash = $2
            WHERE id = $3"
        )
            .bind(&user.username)
            .bind(&user.password_hash)
            .bind(&user.id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() == 1)
    }
}
