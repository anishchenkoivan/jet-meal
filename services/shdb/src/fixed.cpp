#include "fixed.h"

#include <cassert>
#include <cstring>

#include "marshal.h"
#include "row.h"
#include "table.h"

namespace shdb {

class FixedPage : public ITablePage {
 public:
  FixedPage(std::shared_ptr<Frame> frame, std::shared_ptr<Marshal> marshal)
      : frame_(std::move(frame)), marshal_(std::move(marshal)) {}

  RowIndex GetRowCount() override { return GetRowCapacity(); }

  Row GetRow(RowIndex index) override {
    auto* row_data = frame_->GetData() + index * GetRowSpace();
    if (static_cast<bool>(row_data[0])) {
      return marshal_->DeserializeRow(row_data + 1);
    }

    return Row();
  }

  void DeleteRow(RowIndex index) override {
    auto* row_data = GetRowData(index);
    *reinterpret_cast<bool*>(row_data) = false;
  }

  std::pair<bool, RowIndex> InsertRow(const Row& row) override {
    if (auto [found, row_index] = FindRowSlot(); found) {
      auto* row_data = GetRowData(row_index);
      *reinterpret_cast<bool*>(row_data) = true;
      marshal_->SerializeRow(row_data + 1, row);
      return {true, row_index};
    }
    return {false, -1};
  }

 private:
  size_t GetRowSpace() { return 1 + marshal_->GetFixedRowSpace(); }

  uint8_t* GetRowData(RowIndex index) {
    return frame_->GetData() + index * GetRowSpace();
  }

  RowIndex GetRowCapacity() { return kPageSize / GetRowSpace(); }

  std::pair<bool, RowIndex> FindRowSlot() {
    for (RowIndex index = 0; index < GetRowCapacity(); ++index) {
      auto* row_data = GetRowData(index);
      if (!static_cast<bool>(row_data[0])) {
        return {true, index};
      }
    }
    return {false, -1};
  }

  std::shared_ptr<Frame> frame_;
  std::shared_ptr<Marshal> marshal_;
};

class FixedPageProvider : public IPageProvider {
 public:
  explicit FixedPageProvider(std::shared_ptr<Marshal> marshal)
      : marshal(marshal) {}

  std::shared_ptr<IPage> GetPage(std::shared_ptr<Frame> frame) override {
    return std::make_shared<FixedPage>(std::move(frame), marshal);
  }

  std::shared_ptr<Marshal> marshal;
};

std::shared_ptr<IPageProvider> CreateFixedPageProvider(
    std::shared_ptr<Schema> schema) {
  auto marshal = std::make_shared<Marshal>(std::move(schema));
  return std::make_shared<FixedPageProvider>(std::move(marshal));
}

}  // namespace shdb
