use sqlx::migrate::Migrator;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use crate::config::DatabaseConfig;

static MIGRATOR: Migrator = sqlx::migrate!();

pub async fn setup_database(database_config: DatabaseConfig) -> PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(database_config.max_connections)
        .connect(&database_config.url)
        .await.unwrap();

    MIGRATOR.run(&pool).await.unwrap();

    pool
}
