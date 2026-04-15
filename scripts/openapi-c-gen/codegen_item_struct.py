import codegen_item_base
import errors
import type_utils

from typing import override


class StructCodegenItem(codegen_item_base.BaseCodegenItem):
    def __init__(self, generator):
        self.generator = generator
        super().__init__()

    @override
    def _generate_for_object(self, schema_name, schema):
        self.generator.header_content += [f"typedef struct {type_utils.get_ref_raw_type(schema_name)}_s {{\n"]

        for field_name, field in schema['properties'].items():
            self.generator.header_content += [f"  {type_utils.get_field_type(field)} {field_name};\n"]

        self.generator.header_content += [f"}} {type_utils.get_ref_raw_type(schema_name)}_t;\n", "\n"]

    @override
    def _generate_for_array(self, schema_name, schema):
        if not 'items' in schema:
            errors.error(f"No item for array {schema_name}")

        self.generator.header_content += [
            f"typedef struct {type_utils.get_ref_raw_type(schema_name)}_s {{\n",
            f"  {type_utils.get_field_type(schema['items'])}* buffer;\n"
            f"  size_t size;\n",
            f"}} {type_utils.get_ref_raw_type(schema_name)}_t;\n\n",
        ]
    
    def _generate_for_one_of_enum(self, schema_name, schema):
        self.generator.header_content += [f"typedef enum {type_utils.get_ref_raw_type(schema_name)}_enum_e {{\n"]

        for i in schema['oneOf']:
            type_name = 'ONEOF' + type_utils.get_ref_name(schema_name).upper() + type_utils.get_field_type_name(i).upper()
            self.generator.header_content += [f"  {type_name},\n"]

        self.generator.header_content += [f"}} {type_utils.get_ref_raw_type(schema_name)}_enum_t;\n", "\n"]

    def _generate_for_one_of_union(self, schema_name, schema):
        self.generator.header_content += [f"typedef union {type_utils.get_ref_raw_type(schema_name)}_union_u {{\n"]

        for i in schema['oneOf']:
            self.generator.header_content += [f"  {type_utils.get_field_type(i)} oneof{type_utils.get_field_type_name(i)};\n"]

        self.generator.header_content += [f"}} {type_utils.get_ref_raw_type(schema_name)}_union_t;\n", "\n"]

    @override
    def _generate_for_one_of(self, schema_name, schema):
        self._generate_for_one_of_enum(schema_name, schema)
        self._generate_for_one_of_union(schema_name, schema)

        self.generator.header_content += [
            f"typedef struct {type_utils.get_ref_raw_type(schema_name)}_s {{\n",
            f"  {type_utils.get_ref_raw_type(schema_name)}_enum_t discriminator;\n",
            f"  {type_utils.get_ref_raw_type(schema_name)}_union_t value;\n",
            f"}} {type_utils.get_ref_raw_type(schema_name)}_t;\n\n",
        ]


