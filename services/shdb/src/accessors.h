#pragma once

#include <unordered_map>

#include "schema.h"

namespace shdb {

class SchemaAccessor {
 public:
  explicit SchemaAccessor(std::shared_ptr<Schema> schema);

  bool HasColumn(const std::string& name);

  size_t GetColumnIndexOrThrow(const std::string& name);

  const ColumnSchema& GetColumnOrThrow(const std::string& name);

  void AddColumn(ColumnSchema column);

 private:
  std::shared_ptr<Schema> schema_;
  std::unordered_map<std::string, size_t> column_name_to_index_;
};

using SchemaAccessorPtr = std::shared_ptr<SchemaAccessor>;

}  // namespace shdb
