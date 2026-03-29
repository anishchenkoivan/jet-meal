#pragma once

#include <cstdint>
#include <string>
#include <variant>
#include <vector>

namespace shdb {

struct Null {
  bool operator==(const Null &other) const;

  bool operator!=(const Null &other) const;
};

using Value = std::variant<Null, bool, uint64_t, int64_t, std::string>;
using Row = std::vector<Value>;
using Rows = std::vector<Row>;

std::string ToString(const Value& row);
std::string ToString(const Row& row);

} // namespace shdb
