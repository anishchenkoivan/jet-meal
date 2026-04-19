use std::sync::Arc;
use user_service::config::AppConfig;
use user_service::database::setup_database;
use user_service::repositories::refresh_token_repository::PostgresRefreshTokenRepository;
use user_service::repositories::user_repository::PostgresUserRepository;
use user_service::routes::create_router;
use user_service::services::auth_service::AuthService;
use user_service::services::user_service::UserService;
use user_service::state::AppState;

#[tokio::main]
async fn main() {
    let config = AppConfig::new("config/config.toml");

    let server_config = config.server;
    let database_config = config.database;

    let pool = setup_database(database_config).await;

    let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
    let user_service = Arc::new(UserService::new(user_repo));
    let refresh_token_repo = Arc::new(PostgresRefreshTokenRepository::new(pool.clone()));
    let auth_service = Arc::new(AuthService::new(refresh_token_repo, user_service.clone()));

    let app_state = AppState {
        db_pool: pool,
        user_service,
        auth_service,
    };

    let app = create_router(app_state);

    let listener = tokio::net::TcpListener::bind(server_config.bind_address()).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
