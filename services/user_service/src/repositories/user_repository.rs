use async_trait::async_trait;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::errors::repository_error::RepositoryError;
use crate::models::{UserModel, NotificationContext};
use crate::repositories::repository_traits::UserRepository;
use sqlx::types::Json;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
pub struct DbNotificationContext {
    pub email: Option<String>,
    pub telegram: Option<String>,
}

#[derive(Debug, Clone, FromRow)]
pub struct DbUserModel {
    pub id: Uuid,
    pub username: String,
    pub notification_context: Json<DbNotificationContext>,
    pub password_hash: String,
}

impl From<DbUserModel> for UserModel {
    fn from(db_user: DbUserModel) -> Self {
        Self {
            id: db_user.id.clone(),
            username: db_user.username.clone(),
            notification_context: NotificationContext {
                email: db_user.notification_context.email.clone(),
                telegram: db_user.notification_context.telegram.clone(),
            },
            password_hash: db_user.password_hash.clone(),
        }
    }
}

impl From<&UserModel> for DbUserModel {
    fn from(user: &UserModel) -> Self {
        Self {
            id: user.id.clone(),
            username: user.username.clone(),
            notification_context: Json(DbNotificationContext {
                email: user.notification_context.email.clone(),
                telegram: user.notification_context.telegram.clone(),
            }),
            password_hash: user.password_hash.clone(),
        }
    }
}

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
        let user = sqlx::query_as::<_, DbUserModel>(
            "SELECT * FROM users where id = $1"
        ).bind(id).fetch_optional(&self.pool).await?;
        Ok(user.map(UserModel::from))
    }

    async fn get_user_by_username(&self, username: &str) -> Result<Option<UserModel>, RepositoryError> {
        let user: Option<DbUserModel> = sqlx::query_as::<_, DbUserModel>(
            "SELECT * FROM users WHERE username = $1"
        )
            .bind(username)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user.map(UserModel::from))
    }

    async fn create_user(&self, user_model: &UserModel) -> Result<bool, RepositoryError> {
        let user = DbUserModel::from(user_model);
        let result = sqlx::query(
            "INSERT INTO users
                (id, username, notification_context, password_hash)
                VALUES ($1, $2, $3, $4)"
        )
            .bind(&user.id)
            .bind(&user.username)
            .bind(Json(&user.notification_context))
            .bind(&user.password_hash)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() == 1)
    }
}
