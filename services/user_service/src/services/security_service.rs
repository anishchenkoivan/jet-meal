use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use rand::RngExt;
use rand::distr::Alphanumeric;
use crate::errors::domain_error::DomainError;

pub struct SecurityService {
    argon2: Argon2<'static>,
}

impl SecurityService {
    pub fn new() -> Self {
        Self {
            argon2: Argon2::default(),
        }
    }
}

impl SecurityService {
    pub fn hash_password(&self, password: &str) -> Result<String, DomainError> {
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = self.argon2.hash_password(password.as_bytes(), &salt).map_err(|e| DomainError::Internal(format!("Password hashing failed: {}", e)))?;
        Ok(password_hash.to_string())
    }

    pub fn verify_password(&self, password: &str, hash: &str) -> bool {
        let password_hash = match PasswordHash::new(hash) {
            Ok(hash) => hash,
            Err(_) => return false,
        };
        self.argon2.verify_password(password.as_bytes(), &password_hash).is_ok()
    }

    pub fn generate_secure_token(&self, len: usize) -> String {
        rand::rng()
            .sample_iter(&Alphanumeric)
            .take(len)
            .map(char::from)
            .collect()
    }
}
