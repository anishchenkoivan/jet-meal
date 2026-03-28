#include "flexible.h"

#include <cassert>
#include <cstdint>
#include <cstring>
#include <stdexcept>

#include "marshal.h"
#include "page.h"
#include "row.h"
#include "table.h"

namespace shdb {

class FlexiblePage : public ITablePage {
 public:
  FlexiblePage(std::shared_ptr<Frame> frame, std::shared_ptr<Marshal> marshal)
      : frame_(std::move(frame)), marshal_(std::move(marshal)) {
  }

  RowIndex GetRowCount() override {
    return *GetRowCountPtr();
  }

  Row GetRow(RowIndex index) override {
    if (index >= GetRowCount()) {
      throw std::out_of_range("Row index out of range.");
    }

    auto* row_data = GetRowData(index);
    if (GetRowOffset(index)) {
      return marshal_->DeserializeRow(row_data);
    }

    return Row();
  }

  void DeleteRow(RowIndex index) override { *GetRowOffsetPtr(index) = 0; }

  std::pair<bool, RowIndex> InsertRow(const Row& row) override {
    size_t size = marshal_->GetRowSpace(row);
    size_t index = GetRowCount();
    size_t prev_offset = index == 0 ? kPageSize : GetRowOffset(index - 1);
    size_t row_offset = prev_offset - size;
    uint8_t* data = frame_->GetData() + row_offset;
    uint64_t* row_offset_ptr = GetRowOffsetPtr(index);

    if (data <= reinterpret_cast<uint8_t*>(row_offset_ptr)) {
      return {false, -1};
    }

    *row_offset_ptr = row_offset;
    *GetRowCountPtr() = index + 1;
    marshal_->SerializeRow(data, row);
    return {true, index};
  }

 private:
  uint8_t* GetRowData(RowIndex index) {
    return frame_->GetData() + GetRowOffset(index);
  }

  size_t GetRowOffset(RowIndex index) { return *GetRowOffsetPtr(index); }

  uint64_t* GetRowOffsetPtr(RowIndex index) {
    uint8_t* offset_ptr =
        frame_->GetData() + sizeof(uint64_t) + index * sizeof(uint64_t);
    return reinterpret_cast<uint64_t*>(offset_ptr);
  }

  uint64_t* GetRowCountPtr() {
    return reinterpret_cast<uint64_t*>(frame_->GetData());
  }

  size_t GetRowSize(RowIndex index) {
    if (GetRowOffset(index) == 0) {
      throw std::out_of_range("Getting offset of deleted row.");
    }

    size_t offset = GetRowOffset(index);

    if (index == 0) {
      return kPageSize - offset;
    }

    for (size_t i = index - 1; i < index; --i) {
      if (GetRowOffset(i) != 0) {
        return GetRowOffset(i) - offset;
      }
    }

    return kPageSize - offset;
  }

  std::shared_ptr<Frame> frame_;
  std::shared_ptr<Marshal> marshal_;
};

class FlexiblePageProvider : public IPageProvider {
 public:
  explicit FlexiblePageProvider(std::shared_ptr<Marshal> marshal)
      : marshal(marshal) {}

  std::shared_ptr<IPage> GetPage(std::shared_ptr<Frame> frame) override {
    return std::make_shared<FlexiblePage>(std::move(frame), marshal);
  }

  std::shared_ptr<Marshal> marshal;
};

std::shared_ptr<IPageProvider> CreateFlexiblePageProvider(
    std::shared_ptr<Schema> schema) {
  auto marshal = std::make_shared<Marshal>(std::move(schema));
  return std::make_shared<FlexiblePageProvider>(std::move(marshal));
}

}  // namespace shdb
