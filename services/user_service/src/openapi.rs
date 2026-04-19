use std::fs;
use std::io;
use std::path::Path;
use utoipa::OpenApi;
use utoipa::openapi::OpenApi as OpenApiSpec;
use utoipa_axum::router::OpenApiRouter;
use crate::routes::auth_routes::auth_openapi_router;
use crate::routes::user_routes::user_openapi_router;

#[derive(OpenApi)]
#[openapi(
    tags(
        (name = "users", description = "User management endpoints"),
        (name = "auth", description = "Authentication endpoints")
    )
)]
pub struct ApiDoc;

fn build_openapi() -> OpenApiSpec {
    OpenApiRouter::with_openapi(ApiDoc::openapi())
        .merge(user_openapi_router())
        .merge(auth_openapi_router())
        .into_openapi()
}

pub fn generate_openapi_yaml() -> Result<String, serde_yaml::Error> {
    serde_yaml::to_string(&build_openapi())
}

pub fn write_openapi_yaml_file(path: &str) -> Result<(), io::Error> {
    let yaml = generate_openapi_yaml()
        .map_err(|err| io::Error::other(format!("Failed to serialize OpenAPI to YAML: {err}")))?;

    if let Some(parent) = Path::new(path).parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(path, yaml)
}
