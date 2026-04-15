import re

import errors

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
        errors.warn(f"Unkown type {field['type']}, substituting void*")
        return 'void*'
    if '$ref' in field:
        return get_ref_typedef_type(field['$ref'])
    errors.error("Not primitive/ref types of fields not supported")

def get_field_type_name(field):
    if 'type' in field:
        return '_' + field['type']
    if '$ref' in field:
        return get_ref_name(field['$ref'])
    errors.error("Not primitive/ref types of fields not supported")

def get_field_type_name_ref_or_primitive(field):
    if '$ref' in field:
        return get_ref_name(field['$ref'])
    if 'type' in field:
        if field['type'] in ['string', 'number', 'boolean']:
            return '_' + field['type']
        return '_unknown'
    errors.error("Not primitive/ref types of fields not supported")

