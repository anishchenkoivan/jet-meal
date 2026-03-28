#include "index_table.h"

namespace shdb {

class IndexTable : public IIndexTable {
 public:
  IndexTable(std::shared_ptr<BufferPool> buffer_pool,
             std::shared_ptr<File> file,
             std::shared_ptr<IPageProvider> page_provider)
      : buffer_pool_(std::move(buffer_pool)),
        file_(std::move(file)),
        page_provider_(std::move(page_provider)) {}

  PageIndex GetPageCount() override { return file_->GetPageCount(); }

  std::shared_ptr<IPage> GetPage(PageIndex page_index) override {
    auto frame = buffer_pool_->GetPage(file_, page_index);
    return page_provider_->GetPage(std::move(frame));
  }

  PageIndex AllocatePage() override {
    current_page_index_ = file_->AllocPage();
    return current_page_index_;
  }

 private:
  std::shared_ptr<BufferPool> buffer_pool_;
  std::shared_ptr<File> file_;
  std::shared_ptr<IPageProvider> page_provider_;
  PageIndex current_page_index_ = 0;
};

std::shared_ptr<IIndexTable> CreateIndexTable(
    std::shared_ptr<BufferPool> buffer_pool, std::shared_ptr<File> file,
    std::shared_ptr<IPageProvider> page_provider) {
  return std::make_shared<IndexTable>(std::move(buffer_pool), std::move(file),
                                      std::move(page_provider));
}

}  // namespace shdb
