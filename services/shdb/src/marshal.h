#pragma once

#include <memory>

#include "row.h"
#include "schema.h"

namespace shdb {

class Marshal {
 public:
  explicit Marshal(std::shared_ptr<Schema> schema);

  size_t GetFixedRowSpace() const;

  size_t GetRowSpace(const Row& row) const;

  void SerializeRow(uint8_t* data, const Row& row) const;

  Row DeserializeRow(uint8_t* data) const;

 private:
  size_t CalculateFixedRowSpace(uint64_t nulls) const;

  uint64_t GetNulls(const Row& row) const;

  std::shared_ptr<Schema> schema_;
  size_t fixed_row_space_;
};

}  // namespace shdb
