import argparse
import json
import os
import re
import sys
from collections import OrderedDict

import yaml

def warn(message):
    print("Warning:", message)

def error(message):
    print("Error:", message)
    sys.exit(1)

def camel_to_snake_case(camel_case_string):
    return re.sub('([A-Z])', r'_\1', camel_case_string).lower()
    
def get_ref_name(ref):
    return camel_to_snake_case(ref.split('/')[-1])

def get_ref_raw_type(ref):
    return 'api_gen' + get_ref_name(ref)

def get_ref_typedef_type(ref):
    return get_ref_raw_type(ref) + '_t'

def get_field_type(field):
    if 'type' in field and field['type'] == 'number':
        return 'int64_t'
    if 'type' in field and field['type'] == 'boolean':
        return 'bool'
    if 'type' in field and field['type'] == 'string':
        return 'const char*'
    if 'type' in field:
        warn(f"Unkown type field['type'], substituting void*")
        return 'void*'
    if '$ref' in field:
        return get_ref_typedef_type(field['$ref'])
    error("Not primitive/ref types of fields not supported")

def get_field_type_name(field):
    if 'type' in field:
        return '_' + field['type']
    if '$ref' in field:
        return get_ref_name(field['$ref'])
    error("Not primitive/ref types of fields not supported")

class OpenAPIToCGenerator:
    def __init__(self, spec, name):
        self.spec = spec
        self.schemas = self._extract_schemas()
        self.generated_types = set()
        self.header_content = []
        self.source_content = []
        self.name = name

    def _extract_schemas(self):
        if "components" in self.spec and "schemas" in self.spec["components"]:
            return self.spec["components"]["schemas"]
        return self.spec["definitions"]
    
    def _generate_struct_object(self, schema_name, schema):
        self.header_content += [f"typedef struct {get_ref_raw_type(schema_name)}_s {{\n"]

        for field_name, field in schema['schema'].items():
            self.header_content += [f"  {get_field_type(field)} {field_name};\n"]

        self.header_content += [f"}} {get_ref_raw_type(schema_name)}_t;\n", "\n"]

    def _generate_struct_array(self, schema_name, schema):
        if not 'items' in schema:
            error(f"No item for array {schema_name}")
            
        self.header_content += [
            f"typedef struct {get_ref_raw_type(schema_name)}_s {{\n",
            f"  {get_field_type(schema['items'])}* buffer;\n"
            f"  size_t size;\n",
            f"}} {get_ref_raw_type(schema_name)}_t;\n\n",
        ]
    
    def _generate_struct_one_of_enum(self, schema_name, schema):
        self.header_content += [f"typedef enum {get_ref_raw_type(schema_name)}_enum_e {{\n"]

        for i in schema['oneOf']:
            type_name = 'ONEOF' + get_ref_name(schema_name).upper() + get_field_type_name(i).upper()
            self.header_content += [f"  {type_name},\n"]

        self.header_content += [f"}} {get_ref_raw_type(schema_name)}_enum_t;\n", "\n"]

    def _generate_struct_one_of_union(self, schema_name, schema):
        self.header_content += [f"typedef union {get_ref_raw_type(schema_name)}_union_u {{\n"]

        for i in schema['oneOf']:
            self.header_content += [f"  {get_field_type(i)} oneof{get_field_type_name(i)};\n"]

        self.header_content += [f"}} {get_ref_raw_type(schema_name)}_union_t;\n", "\n"]

    def _generate_struct_one_of(self, schema_name, schema):
        self._generate_struct_one_of_enum(schema_name, schema)
        self._generate_struct_one_of_union(schema_name, schema)

        self.header_content += [
            f"typedef struct {get_ref_raw_type(schema_name)}_s {{\n",
            f"  {get_ref_raw_type(schema_name)}_enum_t discriminator;\n",
            f"  {get_ref_raw_type(schema_name)}_union_t value;\n",
            f"}} {get_ref_raw_type(schema_name)}_t;\n\n",
        ]

    def _generate_struct(self, schema_name, schema):
        if 'oneOf' in schema:
            self._generate_struct_one_of(schema_name, schema)
        elif 'type' in schema:
            if schema['type'] == 'object':
                self._generate_struct_object(schema_name, schema)
            elif schema['type'] == 'array':
                self._generate_struct_array(schema_name, schema)
            else:
                error(f"Unkown type `{schema['type']}` for `{schema_name}`")
        else:
            error(f"Can't find any type sign for `{schema_name}`")

    def _genreate_parse_from_fiobj_one_of(self, schema_name, schema):
        pass

    def _genreate_parse_from_fiobj_object(self, schema_name, schema):
        pass

    def _genreate_parse_from_fiobj_array(self, schema_name, schema):
        pass

    def _generate_parse_from_fiobj(self, schema_name, schema):
        pref = get_ref_raw_type(schema_name)
        type_name = get_ref_raw_type(schema_name) + '_t'

        self.header_content += [f"{type_name} {pref}_parse_from_fiobj(FIOBJ);\n\n"]
        
        self.source_content += [f"{type_name} {pref}_parse_from_fiobj(FIOBJ) {{\n"]

        if 'oneOf' in schema:
            self._generate_struct_one_of(schema_name, schema)
        elif 'type' in schema:
            if schema['type'] == 'object':
                self._genreate_parse_from_fiobj_object(schema_name, schema)
            elif schema['type'] == 'array':
                self._generate_struct_array(schema_name, schema)
            else:
                error(f"Unkown type `{schema['type']}` for `{schema_name}`")
        else:
            error(f"Can't find any type sign for `{schema_name}`")

        self.source_content += [f"}}\n\n"]

    def _generate_serialize_to_fiobj(self, schema_name, schema):
        pref = get_ref_raw_type(schema_name)
        type_name = get_ref_raw_type(schema_name) + '_t'
        self.header_content += [f"FIOBJ {pref}_serialize_to_fiobj({type_name});\n\n"]
        
        self.source_content += [f"FIOBJ {pref}_serialize_to_fiobj({type_name}) {{\n"]
        self.source_content += [f"}}\n\n"]
    
    def _generate_cleanup(self, schema_name, schema):
        pref = get_ref_raw_type(schema_name)
        type_name = get_ref_raw_type(schema_name) + '_t'
        self.header_content += [f"void {pref}_cleanup({type_name});\n\n"]
        
        self.source_content += [f"void {pref}_cleanup({type_name}) {{\n"]
        self.source_content += [f"}}\n\n"]

    def _generate_helpers(self, schema_name, schema):
        self._generate_parse_from_fiobj(schema_name, schema)
        self._generate_serialize_to_fiobj(schema_name, schema)
        self._generate_cleanup(schema_name, schema)

    def _insert_primitives(self):
        path = os.path.dirname(os.path.abspath(__file__)) + "/primitives.c"
        primitives = open(path, "r").readlines()
        self.source_content += primitives

    def generate_all(self):
        self.header_content = [
            "// THIS FILE IS AUTOGENERATED, DO NOT EDIT\n\n"
            f"#ifndef GENERATED_OPENAPI_{self.name.upper()}_H\n",
            f"#define GENERATED_OPENAPI_{self.name.upper()}_H\n\n",
            "#include <stdbool.h>\n",
            "#include <stdint.h>\n",
            "#include <stdlib.h>\n",
            "#include <string.h>\n\n",
            "#include \"fiobj.h\"\n\n",
        ]

        self.source_content = [
            "// THIS FILE IS AUTOGENERATED, DO NOT EDIT\n\n"
            f"#include \"{self.name}.h\"\n\n",
        ]

        self._insert_primitives()

        for name, schema in reversed(self.schemas.items()):
            self._generate_struct(name, schema)

        self.header_content += [
            "/" * 80 + "\n",
            "//// Helper functions\n",
            "/" * 80 + "\n\n",
        ]
        
        for name, schema in reversed(self.schemas.items()):
            self._generate_helpers(name, schema)

        self.header_content.append(f"#endif // #ifndef GENERATED_OPENAPI_{self.name.upper()}_H\n")

    def write_files(self, output_prefix):
        """Write header and source files."""
        header_file = f"{output_prefix}.h"
        source_file = f"{output_prefix}.c"

        with open(header_file, "w") as f:
            f.writelines(self.header_content)

        with open(source_file, "w") as f:
            f.writelines(self.source_content)


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

    generator = OpenAPIToCGenerator(spec, args.output.split('/')[-1])
    generator.generate_all()
    generator.write_files(args.output)


if __name__ == "__main__":
    main()
