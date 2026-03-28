use std::sync::Arc;
use sqlx::postgres::PgPoolOptions;
use crate::config::AppConfig;
use crate::repositories::user_repository::PostgresUserRepository;
use crate::routes::create_router;
use crate::services::user_service::UserService;
use crate::state::AppState;

pub mod routes;
pub mod handlers;
pub mod dto;
pub mod services;
pub mod repositories;
pub mod models;
pub mod errors;
mod state;
mod config;

#[tokio::main]
async fn main() {
    let config = AppConfig::new("config/config.toml");

    let server_config = config.server;
    let database_config = config.database;

    // TODO: optionally move database setup away from main
    let pool = PgPoolOptions::new()
        .max_connections(database_config.max_connections)
        .connect(&database_config.url)
        .await.unwrap();

    let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
    let user_service = Arc::new(UserService::new(user_repo));

    let app_state = AppState {
        db_pool: pool,
        user_service,
    };

    let app = create_router(app_state);

    let listener = tokio::net::TcpListener::bind(server_config.bind_address()).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
