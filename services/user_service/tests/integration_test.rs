use std::net::SocketAddr;
use std::sync::Arc;

use reqwest::Client;
use testcontainers_modules::postgres::Postgres;
use testcontainers_modules::testcontainers::core::IntoContainerPort;
use testcontainers_modules::testcontainers::runners::AsyncRunner;
use testcontainers_modules::testcontainers::ImageExt;
use tokio::net::TcpListener;
use tokio::task::JoinHandle;
use user_service::config::{DatabaseConfig, SecurityConfig};
use user_service::database::setup_database;
use user_service::repositories::refresh_token_repository::PostgresRefreshTokenRepository;
use user_service::repositories::user_repository::PostgresUserRepository;
use user_service::routes::create_router;
use user_service::services::auth_service::AuthService;
use user_service::services::user_service::UserService;
use user_service::state::AppState;

#[path = "endpoints/module.rs"]
mod endpoints;

pub(crate) struct TestApp {
    pub(crate) client: Client,
    pub(crate) base_url: String,
    pub(crate) _server_task: JoinHandle<()>,
    pub(crate) _postgres: testcontainers_modules::testcontainers::ContainerAsync<Postgres>,
}

pub(crate) async fn spawn_app() -> TestApp {
    let mapped_port = allocate_free_port();

    let postgres = Postgres::default()
        .with_mapped_port(mapped_port, 5432.tcp())
        .start()
        .await
        .expect("failed to start postgres container");

    let host = postgres
        .get_host()
        .await
        .expect("failed to get container host");
    let port = postgres
        .get_host_port_ipv4(5432)
        .await
        .expect("failed to get postgres mapped port");

    let db_url = format!("postgresql://postgres:postgres@{host}:{port}/postgres");

    let pool = setup_database(DatabaseConfig {
        url: db_url,
        max_connections: 5,
    })
    .await;

    let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
    let user_service = Arc::new(UserService::new(user_repo));

    let refresh_token_repo = Arc::new(PostgresRefreshTokenRepository::new(pool.clone()));
    let auth_service = Arc::new(AuthService::new(
        refresh_token_repo,
        user_service.clone(),
        SecurityConfig {
            access_token_ttl_minutes: 15,
            refresh_token_ttl_days: 30,
            jwt_secret: "integration-test-secret".to_string(),
        },
    ));

    let app_state = AppState {
        db_pool: pool,
        user_service,
        auth_service,
    };

    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("failed to bind random local port");
    let address: SocketAddr = listener.local_addr().expect("failed to get listener address");
    let base_url = format!("http://{address}");

    let app = create_router(app_state);
    let server_task = tokio::spawn(async move {
        axum::serve(listener, app)
            .await
            .expect("axum server failed in integration test");
    });

    TestApp {
        client: Client::builder()
            .no_proxy()
            .build()
            .expect("failed to build HTTP client"),
        base_url,
        _server_task: server_task,
        _postgres: postgres,
    }
}

fn allocate_free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0")
        .expect("failed to allocate a free local port")
        .local_addr()
        .expect("failed to read allocated local port")
        .port()
}
