#include "accessors.h"

#include <stdexcept>

namespace shdb {

SchemaAccessor::SchemaAccessor(std::shared_ptr<Schema> schema)
    : schema_(std::move(schema)) {
  size_t index = 0;
  for (const auto& column : *schema_) {
    column_name_to_index_[column.name] = index++;
  }
}

bool SchemaAccessor::HasColumn(const std::string& name) {
  return column_name_to_index_.find(name) != column_name_to_index_.end();
}

size_t SchemaAccessor::GetColumnIndexOrThrow(const std::string& name) {
  auto it = column_name_to_index_.find(name);
  if (it == column_name_to_index_.end()) {
    throw std::runtime_error("Schema does not contain column " + name);
  }

  return it->second;
}

const ColumnSchema& SchemaAccessor::GetColumnOrThrow(const std::string& name) {
  auto column_index = GetColumnIndexOrThrow(name);
  return (*schema_)[column_index];
}

void SchemaAccessor::AddColumn(ColumnSchema column) {
  if (HasColumn(column.name)) {
    throw std::runtime_error("Schema already contains column " + column.name);
  }

  column_name_to_index_[column.name] = schema_->size();
  schema_->push_back(std::move(column));
}

}  // namespace shdb
