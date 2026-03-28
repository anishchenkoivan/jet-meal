#pragma once

#include <filesystem>

#include "bufferpool.h"
#include "index_table.h"
#include "statistics.h"
#include "table.h"

namespace shdb {

class Store {
 public:
  Store(const std::filesystem::path& path, FrameIndex frame_count,
        std::shared_ptr<Statistics> statistics);

  void CreateTable(const std::filesystem::path& table_name);

  void CreateIndexTable(const std::filesystem::path& table_name);

  std::shared_ptr<ITable> OpenTable(const std::filesystem::path& table_name,
                                    std::shared_ptr<IPageProvider> provider);

  std::shared_ptr<IIndexTable> OpenIndexTable(
      const std::filesystem::path& table_name,
      std::shared_ptr<IPageProvider> provider);

  std::shared_ptr<ITable> CreateAndOpenTable(
      const std::filesystem::path& table_name,
      std::shared_ptr<IPageProvider> provider);

  std::shared_ptr<IIndexTable> CreateAndOpenIndexTable(
      const std::filesystem::path& table_name,
      std::shared_ptr<IPageProvider> provider);

  std::shared_ptr<ITable> CreateOrOpenTable(
      const std::filesystem::path& table_name,
      std::shared_ptr<IPageProvider> provider);

  std::shared_ptr<IIndexTable> CreateOrOpenIndexTable(
      const std::filesystem::path& table_name,
      std::shared_ptr<IPageProvider> provider);

  bool CheckTableExists(const std::filesystem::path& table_name);

  bool RemoveTable(const std::filesystem::path& table_name);

  bool RemoveTableIfExists(const std::filesystem::path& table_name);

 private:
  std::shared_ptr<BufferPool> buffer_pool_;
  std::filesystem::path path_;
};

}  // namespace shdb
