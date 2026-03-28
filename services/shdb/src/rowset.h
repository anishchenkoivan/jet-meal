#pragma once

#include "row.h"
#include "schema.h"

namespace shdb {

class RowSet {
 public:
  explicit RowSet() = default;

  explicit RowSet(std::shared_ptr<Schema> schema, Rows rows = {})
      : schema_(std::move(schema)), rows_(std::move(rows)) {}

  const std::shared_ptr<Schema>& GetSchema() const { return schema_; }

  const Rows& GetRows() const { return rows_; }

  void AddRow(Row row) { rows_.emplace_back(std::move(row)); }

 private:
  std::shared_ptr<Schema> schema_;
  Rows rows_;
};

}  // namespace shdb
