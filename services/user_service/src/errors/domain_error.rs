use thiserror::Error;
use crate::errors::api_error::ApiError;

#[derive(Debug, Error)]
pub enum DomainError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Already exists: {0}")]
    AlreadyExists(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<DomainError> for ApiError {
    fn from(err: DomainError) -> Self {
        match err {
            DomainError::NotFound(_) => ApiError::NotFound(err.to_string()),
            _ => ApiError::InternalServerError(err.to_string()),
        }
    }
}
