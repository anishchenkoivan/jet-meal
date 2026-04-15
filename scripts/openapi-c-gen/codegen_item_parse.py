import codegen_item_base
import type_utils


class ParseCodegenItem(codegen_item_base.BaseCodegenItem):
    def __init__(self, generator):
        self.generator = generator
        super().__init__()

    def _generate_for_one_of(self, schema_name, schema):
        self.generator.source_content += [
            f"  printf(\"Parsing oneOf is not implemented yet. Can't parse {schema_name}, aborting.\");\n",
             "  abort();\n"
        ]

    def _generate_for_object(self, schema_name, schema):
        res_type = type_utils.get_ref_typedef_type(schema_name)
        self.generator.source_content += [f"  {res_type} res;\n"]
        for field_name, field in schema['properties'].items():
            type_name = type_utils.get_field_type_name(field)
            self.generator.source_content += [
                 "  {\n"
                f"    FIOBJ key = fiobj_str_new(\"{field_name}\", /*key len*/{len(field_name)});\n",
                 "    FIOBJ field = fiobj_hash_get(val, key);\n",
                f"    res.{field_name} = api_gen{type_name}_parse_from_fiobj(field);\n"
                 "  }\n"
            ]
        self.generator.source_content += ["  return res;\n"]

    def _generate_for_array(self, schema_name, schema):
        res_type = type_utils.get_ref_typedef_type(schema_name)
        item_type_name = type_utils.get_field_type_name_ref_or_primitive(schema['items'])
        item_type = type_utils.get_field_type(schema['items'])
        self.generator.source_content += [
            f"  {res_type} res;\n",
            f"  res.size = fiobj_ary_count(val);\n"
            f"  res.buffer = ({item_type}*)malloc(sizeof({item_type}) * res.size);\n"
             "  for (size_t i = 0; i < res.size; ++i) {\n",
            f"    res.buffer[i] = api_gen{item_type_name}_parse_from_fiobj(fiobj_ary_index(val, i));\n"
             "  }\n",
             "  return res;\n"
        ]

    def _common_generate_pre(self, schema_name, schema):
        pref = type_utils.get_ref_raw_type(schema_name)
        type_name = type_utils.get_ref_raw_type(schema_name) + '_t'
        self.generator.header_content += [f"{type_name} {pref}_parse_from_fiobj(FIOBJ);\n\n"]
        self.generator.source_content += [f"{type_name} {pref}_parse_from_fiobj(FIOBJ val) {{\n"]

    def _common_generate_post(self, schema_name, schema):
        self.generator.source_content += [f"}}\n\n"]
