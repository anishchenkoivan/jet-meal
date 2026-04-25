static const char* api_gen_string_parse_from_fiobj(FIOBJ val) {
  return strdup(fiobj_obj2cstr(val).data);
}

static FIOBJ api_gen_string_serialize_to_fiobj(const char* val) {
  return fiobj_str_new(val, strlen(val));
}

static void api_gen_string_cleanup(const char* val) {
  free((void*)val);
}

static int64_t api_gen_number_parse_from_fiobj(FIOBJ val) {
  return fiobj_obj2num(val);
}

static FIOBJ api_gen_number_serialize_to_fiobj(int64_t val) {
  return fiobj_num_new(val);
}

static void api_gen_number_cleanup(int64_t val) {
}

static bool api_gen_boolean_parse_from_fiobj(FIOBJ val) {
  return fiobj_is_true(val);
}

static FIOBJ api_gen_boolean_serialize_to_fiobj(bool val) {
  if (val)
    return fiobj_true();
  return fiobj_false();
}

static void api_gen_boolean_cleanup(bool val) {
}

static void* api_gen_unknown_parse_from_fiobj(FIOBJ val) {
  return NULL;
}

static FIOBJ api_gen_unknown_serialize_to_fiobj(void* val) {
  return fiobj_null();
}

static void api_gen_unknown_cleanup(void*) {
}

