use axum::Router;
use axum::routing::{get, post};
use crate::handlers::user_handlers::{create_user, get_user_by_id};
use crate::state::AppState;

pub fn user_route(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/{id}", get(get_user_by_id))
        .route("/create", post(create_user))
        .with_state(state)
}
