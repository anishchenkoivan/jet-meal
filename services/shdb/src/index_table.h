#pragma once

#include <memory>

#include "bufferpool.h"
#include "page_provider.h"

namespace shdb {

class IIndexTable {
 public:
  virtual ~IIndexTable() = default;

  virtual PageIndex GetPageCount() = 0;

  virtual std::shared_ptr<IPage> GetPage(PageIndex page_index) = 0;

  virtual PageIndex AllocatePage() = 0;
};

std::shared_ptr<IIndexTable> CreateIndexTable(
    std::shared_ptr<BufferPool> buffer_pool, std::shared_ptr<File> file,
    std::shared_ptr<IPageProvider> provider);

}  // namespace shdb
