#pragma once

#include <memory>

#include "bufferpool.h"
#include "page_provider.h"
#include "row.h"

namespace shdb {

class ITablePage : public IPage {
 public:
  virtual RowIndex GetRowCount() = 0;

  virtual Row GetRow(RowIndex index) = 0;

  virtual void DeleteRow(RowIndex index) = 0;

  virtual std::pair<bool, RowIndex> InsertRow(const Row& row) = 0;
};

class ITable {
 public:
  virtual ~ITable() = default;

  virtual PageIndex GetPageCount() = 0;

  virtual std::shared_ptr<ITablePage> GetPage(PageIndex page_index) = 0;

  virtual RowId InsertRow(const Row& row) = 0;

  virtual Row GetRow(RowId row_id) = 0;

  virtual void DeleteRow(RowId row_id) = 0;
};

std::shared_ptr<ITable> CreateTable(std::shared_ptr<BufferPool> buffer_pool,
                                    std::shared_ptr<File> file,
                                    std::shared_ptr<IPageProvider> provider);

}  // namespace shdb
