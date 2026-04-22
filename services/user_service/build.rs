use std::env;
use std::path::PathBuf;
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=src");
    println!("cargo:rerun-if-changed=Cargo.toml");

    // Prevent recursive invocation when this build script triggers `cargo run`.
    if env::var_os("OPENAPI_GEN_FROM_BUILD_RS").is_some() {
        return;
    }

    let manifest_dir = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR is not set");
    let cargo = env::var("CARGO").unwrap_or_else(|_| "cargo".to_string());

    // Use a dedicated target dir for the nested cargo invocation to avoid target-dir lock contention.
    let nested_target_dir = PathBuf::from(&manifest_dir).join("target").join("openapi_gen");

    let status = Command::new(cargo)
        .arg("run")
        .arg("--quiet")
        .arg("--bin")
        .arg("openapi_gen")
        .current_dir(&manifest_dir)
        .env("OPENAPI_GEN_FROM_BUILD_RS", "1")
        .env("CARGO_TARGET_DIR", nested_target_dir)
        .status()
        .expect("Failed to execute OpenAPI generator binary");

    if !status.success() {
        panic!("OpenAPI generation failed during build");
    }
}
