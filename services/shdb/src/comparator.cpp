#include "comparator.h"

#include <cassert>
#include <cstdint>
#include <iostream>
#include <optional>
#include <string>
#include <variant>

namespace shdb {

namespace {

template <typename T>
bool CanCompareValue(const Value& lhs, const Value& rhs) {
  return std::holds_alternative<T>(lhs) && std::holds_alternative<T>(rhs);
}

template <typename T>
int16_t CompareValueByT(const Value& lhs, const Value& rhs) {
  assert(std::holds_alternative<T>(lhs));
  assert(std::holds_alternative<T>(rhs));

  const auto& lhs_val = std::get<T>(lhs);
  const auto& rhs_val = std::get<T>(rhs);

  if (lhs_val < rhs_val) {
    return -1;
  } else if (lhs_val == rhs_val) {
    return 0;
  }
  return 1;
}

}  // namespace

int16_t Comparator::operator()(const Row& lhs, const Row& rhs) const {
  assert(lhs.size() == rhs.size());
  for (size_t i = 0; i < lhs.size(); ++i) {
    int16_t res = CompareValue(lhs[i], rhs[i]);
    if (res != 0) {
      return res;
    }
  }
  return 0;
}

int16_t CompareRows(const Row& lhs, const Row& rhs) {
  return Comparator()(lhs, rhs);
}

int16_t CompareValue(const Value& lhs, const Value& rhs) {
  if (CanCompareValue<Null>(lhs, rhs)) {
    return 0;
  } else if (CanCompareValue<bool>(lhs, rhs)) {
    return CompareValueByT<bool>(lhs, rhs);
  } else if (CanCompareValue<int64_t>(lhs, rhs)) {
    return CompareValueByT<int64_t>(lhs, rhs);
  } else if (CanCompareValue<uint64_t>(lhs, rhs)) {
    return CompareValueByT<uint64_t>(lhs, rhs);
  } else if (CanCompareValue<std::string>(lhs, rhs)) {
    return CompareValueByT<std::string>(lhs, rhs);
  }
  assert(false);
}

}  // namespace shdb
