use serde::Deserialize;

#[derive(Deserialize)]
pub struct UserUpdateRequest {
    pub name: String,
}
