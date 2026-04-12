use axum::Router;
use axum::routing::get;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::{Config, SwaggerUi};
use crate::openapi::ApiDoc;
use crate::routes::openapi_routes::openapi_yaml;
use crate::routes::user_routes::user_openapi_router;
use crate::state::AppState;

pub mod user_routes;
mod openapi_routes;

pub fn create_router(state: AppState) -> Router {
    let router = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .merge(user_openapi_router())
        .route("/api-docs/openapi.yaml", get(openapi_yaml))
        .with_state(state);

    let openapi = router.get_openapi().clone();
    let router: Router = router.into();

    router.merge(
        SwaggerUi::new("/swagger-ui")
            .url("/api-docs/openapi.json", openapi)
            .config(Config::new(["/api-docs/openapi.yaml"])),
    )
}
