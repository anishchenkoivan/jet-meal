#pragma once

#include <memory>
#include <string>
#include <vector>

namespace shdb {

enum class Type {
  kBoolean,
  kUint64,
  kInt64,
  kVarchar,
  kString,
};

using Types = std::vector<Type>;

std::string ToString(Type type);

std::ostream& operator<<(std::ostream& stream, Type type);

struct ColumnSchema {
  ColumnSchema() = default;
  ColumnSchema(std::string name, Type type, uint32_t length = 0);
  ColumnSchema(Type type, uint32_t length = 0);  /// NOLINT

  bool operator==(const ColumnSchema& other) const;

  std::string name;
  Type type;
  uint32_t length;
};

std::string ToString(const ColumnSchema& schema);

std::ostream& operator<<(std::ostream& stream, const ColumnSchema& schema);

using Schema = std::vector<ColumnSchema>;
using SchemaPtr = std::shared_ptr<Schema>;

SchemaPtr CreateSchema(const std::vector<ColumnSchema>& column_schemas);

SchemaPtr CreateSchema(std::vector<ColumnSchema>&& column_schemas);

std::string ToString(const Schema& schema);

std::ostream& operator<<(std::ostream& stream, const Schema& schema);

}  // namespace shdb
