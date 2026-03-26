use std::sync::Arc;
use sqlx::postgres::PgPoolOptions;
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

#[tokio::main]
async fn main() {
    // TODO: remove unwraps
    let database_url = std::env::var("DATABASE_URL").unwrap();

    // TODO: add config struct

    // TODO: optionally move database setup away from main
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await.unwrap();

    let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
    let user_service = Arc::new(UserService::new(user_repo));

    let app_state = AppState {
        db_pool: pool,
        user_service,
    };

    let app = create_router(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
