#include "scan.h"

#include <stdexcept>

namespace shdb {

ScanIterator::ScanIterator(std::shared_ptr<ITable> table, PageIndex page_index,
                           RowIndex row_index)
    : table_(std::move(table)), page_index_(page_index), row_index_(row_index) {
  UpdatePage();
}

RowId ScanIterator::GetRowId() const { return RowId{page_index_, row_index_}; }

Row ScanIterator::GetRow() {
  if (page_) {
    return page_->GetRow(row_index_);
  }
  throw std::out_of_range("Dereferencing end iterator.");
}

Row ScanIterator::operator*() { return GetRow(); }

bool ScanIterator::operator==(const ScanIterator& other) const {
  if (page_ == nullptr || other.page_ == nullptr) {
    return page_ == other.page_;
  }
  return page_index_ == other.page_index_ && row_index_ == other.row_index_;
}

bool ScanIterator::operator!=(const ScanIterator& other) const {
  return !operator==(other);
}

ScanIterator& ScanIterator::operator++() {
  row_index_ += 1;
  if (page_ && row_index_ == page_->GetRowCount()) {
    page_index_ += 1;
    row_index_ = 0;
    UpdatePage();
  }
  return *this;
}

void ScanIterator::UpdatePage() {
  if (table_ && page_index_ < table_->GetPageCount()) {
    page_ = nullptr;  // Release old frame
    page_ = table_->GetPage(page_index_);
  } else {
    page_ = nullptr;
  }
}

Scan::Scan(std::shared_ptr<ITable> table) : table_(std::move(table)) {}

ScanIterator Scan::begin() const { return ScanIterator(table_, 0, 0); }

ScanIterator Scan::end() const {
  return ScanIterator(table_, table_->GetPageCount(), 0);
}

}  // namespace shdb
