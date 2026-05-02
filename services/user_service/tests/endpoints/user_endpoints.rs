use serde_json::{json, Value};

use super::helpers::{create_user, unique_username};
use crate::spawn_app;

#[tokio::test(flavor = "multi_thread")]
async fn create_user_endpoint_creates_new_user() {
    let app = spawn_app().await;

    let username = unique_username();
    let response = app
        .client
        .post(format!("{}/users/create", app.base_url))
        .json(&json!({
            "username": username,
            "password": "s3cret"
        }))
        .send()
        .await
        .expect("failed to call create user endpoint");

    assert_eq!(response.status(), reqwest::StatusCode::CREATED);

    let body: Value = response
        .json()
        .await
        .expect("create user response is not valid json");

    let id = body["id"].as_str().expect("id field should be present");
    assert!(!id.is_empty(), "created user id should not be empty");
}

#[tokio::test(flavor = "multi_thread")]
async fn get_user_by_id_endpoint_returns_created_user() {
    let app = spawn_app().await;

    let username = unique_username();
    let user_id = create_user(&app, &username, "s3cret").await;

    let response = app
        .client
        .get(format!("{}/users/{user_id}", app.base_url))
        .send()
        .await
        .expect("failed to call get user endpoint");

    assert_eq!(response.status(), reqwest::StatusCode::OK);

    let body: Value = response
        .json()
        .await
        .expect("get user response is not valid json");

    assert_eq!(body["id"].as_str(), Some(user_id.as_str()));
    assert_eq!(body["username"].as_str(), Some(username.as_str()));
}

#[tokio::test(flavor = "multi_thread")]
async fn update_user_endpoint_updates_username() {
    let app = spawn_app().await;

    let username = unique_username();
    let user_id = create_user(&app, &username, "s3cret").await;

    let updated_username = format!("{username}-updated");
    let update_response = app
        .client
        .patch(format!("{}/users/{user_id}/update", app.base_url))
        .json(&json!({
            "username": updated_username,
        }))
        .send()
        .await
        .expect("failed to call update user endpoint");

    assert_eq!(update_response.status(), reqwest::StatusCode::NO_CONTENT);

    let get_response = app
        .client
        .get(format!("{}/users/{user_id}", app.base_url))
        .send()
        .await
        .expect("failed to call get user endpoint");

    assert_eq!(get_response.status(), reqwest::StatusCode::OK);

    let body: Value = get_response
        .json()
        .await
        .expect("get user response is not valid json");

    assert_eq!(body["id"].as_str(), Some(user_id.as_str()));
    assert_eq!(body["username"].as_str(), Some(updated_username.as_str()));
}
