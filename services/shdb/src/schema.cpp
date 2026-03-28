#include "schema.h"

#include <tuple>

namespace shdb {

std::string ToString(Type type) {
  switch (type) {
    case Type::kBoolean:
      return "boolean";
    case Type::kUint64:
      return "uint64";
    case Type::kInt64:
      return "int64";
    case Type::kVarchar:
      return "varchar";
    case Type::kString:
      return "string";
  }

  return {};
}

std::ostream& operator<<(std::ostream& stream, Type type) {
  stream << ToString(type);
  return stream;
}

ColumnSchema::ColumnSchema(std::string name, Type type, uint32_t length)
    : name(std::move(name)), type(type), length(length) {}

ColumnSchema::ColumnSchema(Type type, uint32_t length)
    : type(type), length(length) {}

bool ColumnSchema::operator==(const ColumnSchema& other) const {
  return std::tie(name, type, length) ==
         std::tie(other.name, other.type, other.length);
}

std::string ToString(const ColumnSchema& schema) {
  std::string result = schema.name + " " + ToString(schema.type);

  if (schema.length != 0) {
    result += '(';
    result += std::to_string(schema.length);
    result += ')';
  }

  return result;
}

std::ostream& operator<<(std::ostream& stream, const ColumnSchema& schema) {
  stream << ToString(schema);
  return stream;
}

SchemaPtr CreateSchema(const std::vector<ColumnSchema>& column_schemas) {
  return std::make_shared<Schema>(column_schemas);
}

SchemaPtr CreateSchema(std::vector<ColumnSchema>&& column_schemas) {
  return std::make_shared<Schema>(std::move(column_schemas));
}

std::string ToString(const Schema& schema) {
  std::string result;

  for (const auto& column : schema) {
    result += ToString(column);
    result += ", ";
  }

  if (!result.empty()) {
    result.pop_back();
    result.pop_back();
  }

  return result;
}

std::ostream& operator<<(std::ostream& stream, const Schema& schema) {
  stream << ToString(schema);
  return stream;
}

}  // namespace shdb
