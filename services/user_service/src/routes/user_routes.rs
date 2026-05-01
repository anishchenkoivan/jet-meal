use crate::state::AppState;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

pub fn user_openapi_router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(crate::handlers::user_handlers::get_user_by_id))
        .routes(routes!(crate::handlers::user_handlers::create_user))
        .routes(routes!(crate::handlers::user_handlers::update_user))
}
