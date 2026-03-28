#pragma once

#include <filesystem>

#include "catalog.h"
#include "index.h"
#include "schema.h"
#include "statistics.h"
#include "store.h"
#include "table.h"

namespace shdb {

class Database {
 public:
  Database(const std::filesystem::path& path, FrameIndex frame_count);

  std::shared_ptr<ITable> CreateTable(const std::string& table_name,
                                      std::shared_ptr<Schema> schema);

  std::shared_ptr<ITable> GetTable(const std::string& name,
                                   std::shared_ptr<Schema> schema = nullptr);

  bool CheckTableExists(const std::string& name);

  void DropTable(const std::string& name);

  using IndexCreateCallback =
      std::function<std::shared_ptr<IIndex>(const IndexMetadata&, Store&)>;

  using IndexDropCallback =
      std::function<void(const IndexMetadata&, Store& store)>;

  void RegisterIndex(const std::string& index_type,
                     IndexCreateCallback index_create_callback,
                     IndexDropCallback index_drop_callback);

  std::shared_ptr<IIndex> CreateIndex(const std::string& index_name,
                                      std::shared_ptr<Schema> key_schema,
                                      const std::string& index_type);

  std::shared_ptr<IIndex> GetIndex(const std::string& index_name);

  void DropIndex(const std::string& index_name);

  std::shared_ptr<Statistics> GetStatistics();

  std::shared_ptr<Schema> FindTableSchema(const std::filesystem::path& name);

  std::shared_ptr<Store> GetStore() const { return store_; }

 private:
  std::shared_ptr<IPageProvider> CreatePageProvider(
      std::shared_ptr<Schema> schema);

  std::shared_ptr<Statistics> statistics_;
  std::shared_ptr<Store> store_;
  std::shared_ptr<Catalog> catalog_;
  std::unordered_map<std::string,
                     std::pair<IndexCreateCallback, IndexDropCallback>>
      index_type_to_callbacks_;
};

std::shared_ptr<Database> Connect(const std::filesystem::path& path,
                                  FrameIndex frame_count);

}  // namespace shdb
