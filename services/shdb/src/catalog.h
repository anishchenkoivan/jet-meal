#pragma once

#include <memory>

#include "schema.h"
#include "store.h"
#include "table.h"

namespace shdb {

class Catalog {
 public:
  explicit Catalog(std::shared_ptr<Store> store);

  void SaveTableSchema(const std::filesystem::path& name,
                       std::shared_ptr<Schema> schema);

  std::shared_ptr<Schema> FindTableSchema(const std::filesystem::path& name);

  void ForgetTableSchema(const std::filesystem::path& name);

 private:
  static std::shared_ptr<ITable> CreateAndOpenTable(
      std::shared_ptr<Store> store, const Schema& schema,
      const std::string& table);

  std::shared_ptr<ITable> tables_;
  std::shared_ptr<ITable> schemas_;
  uint64_t tables_count_ = 0;
};

}  // namespace shdb
