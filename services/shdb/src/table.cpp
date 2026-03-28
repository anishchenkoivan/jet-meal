#include "table.h"

namespace shdb {

class ImplementedTable : public ITable {
 public:
  ImplementedTable(std::shared_ptr<BufferPool> buffer_pool,
                   std::shared_ptr<File> file,
                   std::shared_ptr<IPageProvider> page_provider)
      : buffer_pool_(std::move(buffer_pool)),
        file_(std::move(file)),
        page_provider_(std::move(page_provider)) {}

  RowId InsertRow(const Row& row) override {
    while (true) {
      if (current_page_index_ == GetPageCount()) {
        current_page_index_ = file_->AllocPage();
      }

      auto page = GetPage(current_page_index_);
      auto [inserted, row_index] = page->InsertRow(row);
      if (inserted) {
        return RowId{current_page_index_, row_index};
      }

      ++current_page_index_;
    }
  }

  Row GetRow(RowId row_id) override {
    auto page = GetPage(row_id.page_index);
    auto row = page->GetRow(row_id.row_index);
    return row;
  }

  void DeleteRow(RowId row_id) override {
    auto page = GetPage(row_id.page_index);
    page->DeleteRow(row_id.row_index);
  }

  PageIndex GetPageCount() override { return file_->GetPageCount(); }

  std::shared_ptr<ITablePage> GetPage(PageIndex page_index) override {
    auto frame = buffer_pool_->GetPage(file_, page_index);
    return std::static_pointer_cast<ITablePage>(
        page_provider_->GetPage(std::move(frame)));
  }

 private:
  std::shared_ptr<BufferPool> buffer_pool_;
  std::shared_ptr<File> file_;
  std::shared_ptr<IPageProvider> page_provider_;
  PageIndex current_page_index_ = 0;
};

std::shared_ptr<ITable> CreateTable(
    std::shared_ptr<BufferPool> buffer_pool, std::shared_ptr<File> file,
    std::shared_ptr<IPageProvider> page_provider) {
  return std::make_shared<ImplementedTable>(
      std::move(buffer_pool), std::move(file), std::move(page_provider));
}

}  // namespace shdb
