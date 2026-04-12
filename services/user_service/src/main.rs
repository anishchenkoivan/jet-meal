use std::sync::Arc;
use sqlx::postgres::PgPoolOptions;
use user_service::config::AppConfig;
use user_service::repositories::user_repository::PostgresUserRepository;
use user_service::routes::create_router;
use user_service::services::user_service::UserService;
use user_service::state::AppState;

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
