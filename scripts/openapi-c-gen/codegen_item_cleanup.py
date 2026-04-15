import codegen_item_base
import type_utils


class CleanupCodegenItem(codegen_item_base.BaseCodegenItem):
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
                f"      api_gen{type_name}_cleanup(val.value.oneof{type_utils.get_field_type_name(i)});\n"
                 "      break;\n"
                 "    }\n"
            ]

        self.generator.source_content += ["  }\n"]

    def _generate_for_object(self, schema_name, schema):
        for field_name, field in schema['properties'].items():
            type_name = type_utils.get_field_type_name(field)
            self.generator.source_content += [f"  api_gen{type_name}_cleanup(val.{field_name});\n"]

    def _generate_for_array(self, schema_name, schema):
        self.generator.source_content += [f"  free((void*)val.buffer);\n"]

    def _common_generate_pre(self, schema_name, schema):
        pref = type_utils.get_ref_raw_type(schema_name)
        type_name = type_utils.get_ref_raw_type(schema_name) + '_t'
        self.generator.header_content += [f"void {pref}_cleanup({type_name});\n\n"]
        self.generator.source_content += [f"void {pref}_cleanup({type_name} val) {{\n"]
    
    def _common_generate_post(self, schema_name, schema):
        self.generator.source_content += [f"}}\n\n"]
