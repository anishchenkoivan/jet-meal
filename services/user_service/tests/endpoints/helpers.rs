use serde_json::{json, Value};

use crate::TestApp;

pub fn unique_username() -> String {
    format!("user-{}", uuid::Uuid::new_v4())
}

pub async fn create_user(app: &TestApp, username: &str, password: &str) -> String {
    let response = app
        .client
        .post(format!("{}/users/create", app.base_url))
        .json(&json!({
            "name": username,
            "email": format!("{username}@example.com"),
            "telegram": format!("tg_{username}"),
            "password": password,
        }))
        .send()
        .await
        .expect("failed to call create user endpoint");

    assert_eq!(response.status(), reqwest::StatusCode::CREATED);
    let body: Value = response
        .json()
        .await
        .expect("create user response is not valid json");

    body["id"]
        .as_str()
        .expect("create user response should contain string id")
        .to_string()
}
