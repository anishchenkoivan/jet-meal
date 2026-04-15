import argparse
import json
import yaml

import codegen_generator


def main():
    parser = argparse.ArgumentParser(description="Generate C structs from OpenAPI schema")
    parser.add_argument("--input", "-i", required=True, help="Input OpenAPI file (JSON or YAML)")
    parser.add_argument("--output", "-o", default="generated", help="Output file prefix (default: generated)")
    args = parser.parse_args()

    with open(args.input, "r") as f:
        if args.input.endswith(".yaml") or args.input.endswith(".yml"):
            spec = yaml.safe_load(f)
        else:
            spec = json.load(f)

    generator = codegen_generator.OpenAPIToCGenerator(spec, args.output.split('/')[-1])
    generator.generate_all()
    generator.write_files(args.output)


if __name__ == "__main__":
    main()
