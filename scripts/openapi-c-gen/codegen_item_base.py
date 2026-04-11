import errors

class BaseCodegenItem:
    def _generate_for_one_of(self, schema_name, schema):
        pass
    
    def _generate_for_object(self, schema_name, schema):
        pass

    def _generate_for_array(self, schema_name, schema):
        pass

    def _common_generate_pre(self, schema_name, schema):
        pass
    
    def _common_generate_post(self, schema_name, schema):
        pass

    def generate(self, schema_name, schema):
        self._common_generate_pre(schema_name, schema)

        if 'oneOf' in schema:
            self._generate_for_one_of(schema_name, schema)
        elif 'type' in schema:
            if schema['type'] == 'object':
                self._generate_for_object(schema_name, schema)
            elif schema['type'] == 'array':
                self._generate_for_array(schema_name, schema)
            else:
                errors.error(f"Unkown type `{schema['type']}` for `{schema_name}`")
        else:
            errors.error(f"Can't find any type sign for `{schema_name}`")
        
        self._common_generate_post(schema_name, schema)
