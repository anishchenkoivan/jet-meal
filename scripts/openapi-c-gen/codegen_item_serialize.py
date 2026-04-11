import codegen_item_base
import type_utils
import errors


class SerializeCodegenItem(codegen_item_base.BaseCodegenItem):
    def __init__(self, generator):
        self.generator = generator
        super().__init__()

    def _generate_for_one_of(self, schema_name, schema):
        self.generator.source_content += ["  switch(val.discriminator) {\n"]

        for i in schema['oneOf']:
            enum_type_name = 'ONEOF' + type_utils.get_ref_name(schema_name).upper() + type_utils.get_field_type_name(i).upper()
            type_name = type_utils.get_field_type_name_ref_or_primitive(i)
            self.generator.source_content += [
                f"    case {enum_type_name}: {{\n"
                f"      return api_gen{type_name}_serialize_to_fiobj(val.value.oneof{type_utils.get_field_type_name(i)});\n"
                 "    }\n"
            ]

        self.generator.source_content += ["  }\n"]

    def _generate_for_object(self, schema_name, schema):
        self.generator.source_content += [f"  FIOBJ res = fiobj_hash_new2({len(schema['properties'])});\n"]
        for field_name, field in schema['properties'].items():
            type_name = type_utils.get_field_type_name(field)
            self.generator.source_content += [
                 "  {\n",
                f"    FIOBJ obj = api_gen{type_name}_serialize_to_fiobj(val.{field_name});\n",
                f"    FIOBJ key = fiobj_str_new(\"{field_name}\", /*key len*/{len(field_name)});\n",
                f"    fiobj_hash_set(res, key, obj);\n",
                 "  }\n",
            ]
        self.generator.source_content += ["  return res;\n"]

    def _generate_for_array(self, schema_name, schema):
        if not 'items' in schema:
            errors.error(f"No items in array {schema_name} schema")
        type_name = type_utils.get_field_type_name_ref_or_primitive(schema['items'])
        self.generator.source_content += [
            f"  FIOBJ res = fiobj_ary_new2(val.size);\n",
             "  for (size_t i = 0; i < val.size; ++i) {\n",
            f"    FIOBJ item = api_gen{type_name}_serialize_to_fiobj(val.buffer[i]);\n",
             "    fiobj_ary_push(res, item);\n",
             "  }\n",
             "  return res;\n"
        ]

    def _common_generate_pre(self, schema_name, schema):
        pref = type_utils.get_ref_raw_type(schema_name)
        type_name = type_utils.get_ref_raw_type(schema_name) + '_t'
        self.generator.header_content += [f"FIOBJ {pref}_serialize_to_fiobj({type_name});\n\n"]
        self.generator.source_content += [f"FIOBJ {pref}_serialize_to_fiobj({type_name} val) {{\n"]

    def _common_generate_post(self, schema_name, schema):
        self.generator.source_content += [f"}}\n\n"]
