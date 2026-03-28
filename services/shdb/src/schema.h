#pragma once

#include <cstdint>
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

struct ColumnSchema {
  ColumnSchema() = default;
  ColumnSchema(std::string name, Type type, uint32_t length = 0);
  ColumnSchema(Type type, uint32_t length = 0); /// NOLINT

  bool operator==(const ColumnSchema &other) const;

  std::string name;
  Type type;
  uint32_t length;
};

using Schema = std::vector<ColumnSchema>;
using SchemaPtr = std::shared_ptr<Schema>;

std::string ToString(const Schema &schema);

} // namespace shdb
