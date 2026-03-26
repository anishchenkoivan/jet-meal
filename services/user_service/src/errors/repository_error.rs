use thiserror::Error;
use crate::errors::domain_error::DomainError;

#[derive(Debug, Error)]
pub enum RepositoryError {
    #[error("Database error")]
    Database(#[from] sqlx::Error)
}

impl From<RepositoryError> for DomainError {
    fn from(err: RepositoryError) -> Self {
        match err {
            RepositoryError::Database(_) => DomainError::Internal("Database error".to_string()),
        }
    }
}
