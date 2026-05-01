use serde_json::{json, Value};

use super::helpers::{create_user, unique_username};
use crate::spawn_app;

#[tokio::test(flavor = "multi_thread")]
async fn login_endpoint_returns_access_and_refresh_tokens() {
    let app = spawn_app().await;

    let username = unique_username();
    let password = "strong-password";
    let _user_id = create_user(&app, &username, password).await;

    let response = app
        .client
        .post(format!("{}/auth/login", app.base_url))
        .json(&json!({
            "username": username,
            "password": password,
        }))
        .send()
        .await
        .expect("failed to call login endpoint");

    assert_eq!(response.status(), reqwest::StatusCode::OK);

    let body: Value = response
        .json()
        .await
        .expect("login response is not valid json");

    let access_token = body["access_token"]
        .as_str()
        .expect("login response should contain access_token");
    let refresh_token = body["refresh_token"]
        .as_str()
        .expect("login response should contain refresh_token");

    assert!(!access_token.is_empty(), "access_token should not be empty");
    assert!(!refresh_token.is_empty(), "refresh_token should not be empty");
    assert!(
        refresh_token.contains('.'),
        "refresh token should contain id.secret format"
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn refresh_endpoint_returns_new_access_token() {
    let app = spawn_app().await;

    let username = unique_username();
    let password = "refresh-password";
    let _user_id = create_user(&app, &username, password).await;

    let login_response = app
        .client
        .post(format!("{}/auth/login", app.base_url))
        .json(&json!({
            "username": username,
            "password": password,
        }))
        .send()
        .await
        .expect("failed to call login endpoint");

    assert_eq!(login_response.status(), reqwest::StatusCode::OK);
    let login_body: Value = login_response
        .json()
        .await
        .expect("login response is not valid json");

    let refresh_token = login_body["refresh_token"]
        .as_str()
        .expect("login response should contain refresh_token");

    let refresh_response = app
        .client
        .post(format!("{}/auth/refresh", app.base_url))
        .json(&json!({
            "refresh_token": refresh_token,
        }))
        .send()
        .await
        .expect("failed to call refresh token endpoint");

    assert_eq!(refresh_response.status(), reqwest::StatusCode::OK);

    let refresh_body: Value = refresh_response
        .json()
        .await
        .expect("refresh response is not valid json");

    let access_token = refresh_body["access_token"]
        .as_str()
        .expect("refresh response should contain access_token");
    assert!(!access_token.is_empty(), "refreshed access token should not be empty");
}

#[tokio::test(flavor = "multi_thread")]
async fn update_auth_details_endpoint_returns_new_tokens() {
    let app = spawn_app().await;

    let username = unique_username();
    let password = "old-password";
    let user_id = create_user(&app, &username, password).await;

    let new_password = "new-password";
    let update_response = app
        .client
        .patch(format!("{}/auth/{user_id}/update", app.base_url))
        .json(&json!({
            "password": new_password,
        }))
        .send()
        .await
        .expect("failed to call update auth details endpoint");

    assert_eq!(update_response.status(), reqwest::StatusCode::OK);

    let update_body: Value = update_response
        .json()
        .await
        .expect("update auth response is not valid json");

    let access_token = update_body["access_token"]
        .as_str()
        .expect("update auth response should contain access_token");
    let refresh_token = update_body["refresh_token"]
        .as_str()
        .expect("update auth response should contain refresh_token");

    assert!(!access_token.is_empty(), "access_token should not be empty");
    assert!(!refresh_token.is_empty(), "refresh_token should not be empty");

    let login_response = app
        .client
        .post(format!("{}/auth/login", app.base_url))
        .json(&json!({
            "username": username,
            "password": new_password,
        }))
        .send()
        .await
        .expect("failed to call login endpoint with new password");

    assert_eq!(login_response.status(), reqwest::StatusCode::OK);
}
