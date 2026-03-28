#include "marshal.h"

#include <cassert>
#include <cstdint>
#include <cstring>
#include <iostream>

namespace shdb {

namespace {

template <class T>
void SerializeValue(const T& value, uint8_t*& data) {
  memcpy(data, &value, sizeof(value));
  data += sizeof(value);
}

template <class T>
T DeserializeValue(uint8_t*& data) {
  T result{};
  memcpy(&result, data, sizeof(result));
  data += sizeof(result);
  return result;
}

}  // namespace

size_t Marshal::CalculateFixedRowSpace(uint64_t nulls) const {
  size_t result = sizeof(uint64_t);
  for (const auto& column : *schema_) {
    auto null = nulls & 1;
    nulls >>= 1;
    if (null) {
      continue;
    }
    switch (column.type) {
      case Type::kBoolean: {
        result += sizeof(uint8_t);
        break;
      }
      case Type::kUint64: {
        result += sizeof(uint64_t);
        break;
      }
      case Type::kInt64: {
        result += sizeof(int64_t);
        break;
      }
      case Type::kVarchar: {
        result += column.length;
        break;
      }
      case Type::kString: {
        result += sizeof(int64_t);
        break;
      }
      default: {
        std::cout << "Value of unknown type in the row" << std::endl;
        assert(0);
      }
    }
  }
  return result;
}

uint64_t Marshal::GetNulls(const Row& row) const {
  uint64_t nulls = 0;
  for (size_t index = 0; index < row.size(); ++index) {
    if (std::holds_alternative<Null>(row[index])) {
      nulls |= (1UL << index);
    }
  }
  return nulls;
}

Marshal::Marshal(std::shared_ptr<Schema> schema)
    : schema_(std::move(schema)), fixed_row_space_(CalculateFixedRowSpace(0)) {
  assert(schema_->size() <= sizeof(uint64_t) * 8);
}

size_t Marshal::GetFixedRowSpace() const { return fixed_row_space_; }

size_t Marshal::GetRowSpace(const Row& row) const {
  auto nulls = GetNulls(row);
  size_t result = sizeof(uint64_t);
  size_t index = 0;

  for (const auto& column : *schema_) {
    auto null = nulls & 1;
    nulls >>= 1;
    if (null) {
      continue;
    }
    switch (column.type) {
      case Type::kBoolean: {
        result += sizeof(uint8_t);
        break;
      }
      case Type::kUint64: {
        result += sizeof(uint64_t);
        break;
      }
      case Type::kInt64: {
        result += sizeof(int64_t);
        break;
      }
      case Type::kVarchar: {
        result += column.length;
        break;
      }
      case Type::kString: {
        const auto& str = std::get<std::string>(row[index]);
        result += str.size() + sizeof(uint64_t);
        break;
      }
      default: {
        std::cout << "Value of unknown type in the row" << std::endl;
        assert(0);
      }
    }
    index += 1;
  }
  return result;
}

void Marshal::SerializeRow(uint8_t* data, const Row& row) const {
  assert(row.size() < 64);
  uint64_t nulls = GetNulls(row);
  auto* start = data;
  SerializeValue<uint64_t>(nulls, data);

  for (size_t index = 0; index < schema_->size(); ++index) {
    if (nulls & (1UL << index)) {
      continue;
    }

    switch ((*schema_)[index].type) {
      case Type::kBoolean: {
        auto value = static_cast<uint8_t>(std::get<bool>(row[index]));
        SerializeValue(value, data);
        break;
      }
      case Type::kUint64: {
        auto value = std::get<uint64_t>(row[index]);
        SerializeValue(value, data);
        break;
      }
      case Type::kInt64: {
        auto value = std::get<int64_t>(row[index]);
        SerializeValue(value, data);
        break;
      }
      case Type::kVarchar: {
        const auto& str = std::get<std::string>(row[index]);
        auto length = (*schema_)[index].length;
        ::memcpy(data, str.c_str(), str.size());
        ::memset(data + str.size(), 0, length - str.size());
        data += length;
        break;
      }
      case Type::kString: {
        const auto& str = std::get<std::string>(row[index]);
        SerializeValue(static_cast<uint64_t>(str.size()), data);
        ::memcpy(data, str.c_str(), str.size());
        data += str.size();
        break;
      }
      default: {
        std::cout << "Value of unknown type in the row" << std::endl;
        assert(0);
      }
    }
  }

  assert(static_cast<size_t>(data - start) == GetRowSpace(row));
}

Row Marshal::DeserializeRow(uint8_t* data) const {
  auto* start = data;
  auto nulls = DeserializeValue<uint64_t>(data);
  Row row;
  for (size_t index = 0; index < schema_->size(); ++index) {
    if (nulls & (1UL << index)) {
      row.emplace_back(Null{});
      continue;
    }
    switch ((*schema_)[index].type) {
      case Type::kBoolean: {
        auto value = DeserializeValue<uint8_t>(data);
        row.emplace_back(static_cast<bool>(value));
        break;
      }
      case Type::kUint64: {
        auto value = DeserializeValue<uint64_t>(data);
        row.emplace_back(value);
        break;
      }
      case Type::kInt64: {
        auto value = DeserializeValue<int64_t>(data);
        row.emplace_back(value);
        break;
      }
      case Type::kVarchar: {
        auto length =
            strnlen(reinterpret_cast<char*>(data), (*schema_)[index].length);
        auto str = std::string(reinterpret_cast<char*>(data), length);
        row.emplace_back(std::move(str));
        data += (*schema_)[index].length;
        break;
      }
      case Type::kString: {
        auto length = DeserializeValue<int64_t>(data);
        auto str = std::string(reinterpret_cast<char*>(data), length);
        row.emplace_back(std::move(str));
        data += length;
        break;
      }
      default: {
        std::cout << "Value of unknown type in the row" << std::endl;
        assert(0);
      }
    }
  }

  assert(static_cast<size_t>(data - start) == GetRowSpace(row));

  return row;
}

}  // namespace shdb
