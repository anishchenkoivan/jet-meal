use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;
use crate::state::AppState;

pub fn auth_openapi_router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(crate::handlers::auth_handlers::login))
        .routes(routes!(crate::handlers::auth_handlers::refresh_token))
        .routes(routes!(crate::handlers::auth_handlers::update_auth_details))
}
