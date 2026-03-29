use axum::Router;
use crate::routes::user_routes::user_route;
use crate::state::AppState;

mod user_routes;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .nest("/users", user_route(state.clone()))
        .with_state(state)
}
