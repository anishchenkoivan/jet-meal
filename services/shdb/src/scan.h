#pragma once

#include "table.h"

namespace shdb {

class ScanIterator {
 public:
  ScanIterator(std::shared_ptr<ITable> table, PageIndex page_index,
               RowIndex row_index);

  RowId GetRowId() const;

  Row GetRow();

  Row operator*();

  bool operator==(const ScanIterator& other) const;

  bool operator!=(const ScanIterator& other) const;

  ScanIterator& operator++();

 private:
  void UpdatePage();

  std::shared_ptr<ITable> table_;
  std::shared_ptr<ITablePage> page_;
  PageIndex page_index_;
  RowIndex row_index_;
};

class Scan {
 public:
  explicit Scan(std::shared_ptr<ITable> table);

  ScanIterator begin() const;  // NOLINT

  ScanIterator end() const;  // NOLINT

 private:
  std::shared_ptr<ITable> table_;
};

}  // namespace shdb
