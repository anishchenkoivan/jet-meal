fn main() {
    if let Err(err) = user_service::openapi::write_openapi_yaml_file("docs/api.yaml") {
        eprintln!("Failed to generate docs/api.yaml: {err}");
        std::process::exit(1);
    }

    println!("Generated docs/api.yaml");
}
