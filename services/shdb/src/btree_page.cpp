#include "btree_page.h"

#include <cstddef>
#include <cstdint>
#include <stdexcept>

#include "comparator.h"
#include "page.h"

namespace shdb {

std::string ToString(BTreePageType page_type) {
  switch (page_type) {
    case BTreePageType::kInvalid:
      return "Invalid";
    case BTreePageType::kMetadata:
      return "Metadata";
    case BTreePageType::kInternal:
      return "Internal";
    case BTreePageType::kLeaf:
      return "Leaf";
  }

  return {};
}

BTreePage::BTreePage(std::shared_ptr<Frame> frame,
                     std::shared_ptr<Marshal> marshal,
                     uint32_t key_size_in_bytes, uint32_t max_page_size)
    : frame_(std::move(frame)),
      marshal_(std::move(marshal)),
      key_size_in_bytes(key_size_in_bytes),
      max_page_size(max_page_size) {}

const std::shared_ptr<Frame>& BTreePage::GetFrame() const { return frame_; }

std::shared_ptr<Frame>& BTreePage::GetFrame() { return frame_; }

const std::shared_ptr<Marshal>& BTreePage::GetMarshal() const {
  return marshal_;
}

BTreePageType BTreePage::GetPageType() const {
  return GetValue<BTreePageType>(0);
}

void BTreePage::SetPageType(BTreePageType btree_page_type) {
  SetValue(0, static_cast<uint32_t>(btree_page_type));
}

bool BTreePage::IsInvalidPage() const {
  return GetPageType() == BTreePageType::kInvalid;
}

bool BTreePage::IsLeafPage() const {
  return GetPageType() == BTreePageType::kLeaf;
}

bool BTreePage::IsInternalPage() const {
  return GetPageType() == BTreePageType::kInternal;
}

bool BTreePage::IsMetadataPage() const {
  return GetPageType() == BTreePageType::kMetadata;
}

uint32_t BTreePage::GetMaxPageSize() const { return max_page_size; }

uint32_t BTreePage::GetMinPageSize() const { return max_page_size / 2; }

BTreeMetadataPage::BTreeMetadataPage(BTreePagePtr page)
    : page_(std::move(page)) {}

const BTreePagePtr& BTreeMetadataPage::GetRawPage() const { return page_; }

PageIndex BTreeMetadataPage::GetRootPageIndex() const {
  return page_->GetValue<PageIndex>(kRootPageIndexHeaderOffset,
                                    BTreePage::kHeaderOffset);
}

void BTreeMetadataPage::SetRootPageIndex(PageIndex root_page_index) {
  page_->SetValue(kRootPageIndexHeaderOffset, root_page_index,
                  BTreePage::kHeaderOffset);
}

uint32_t BTreeMetadataPage::GetKeySizeInBytes() const {
  return page_->GetValue<uint32_t>(kKeySizeInBytesHeaderOffset,
                                   BTreePage::kHeaderOffset);
}

void BTreeMetadataPage::SetKeySizeInBytes(uint32_t key_size_in_bytes) {
  page_->SetValue(kKeySizeInBytesHeaderOffset, key_size_in_bytes,
                  BTreePage::kHeaderOffset);
}

uint32_t BTreeMetadataPage::GetMaxPageSize() const {
  return page_->GetValue<uint32_t>(kMaxPageSizeHeaderOffset,
                                   BTreePage::kHeaderOffset);
}

void BTreeMetadataPage::SetMaxPageSize(uint32_t max_page_size) {
  page_->SetValue(kMaxPageSizeHeaderOffset, max_page_size,
                  BTreePage::kHeaderOffset);
}

std::ostream& BTreeMetadataPage::Dump(std::ostream& stream,
                                      size_t offset) const {
  std::string offset_string(offset, ' ');

  stream << offset_string << "Root page index " << GetRootPageIndex() << '\n';
  stream << offset_string << "Key size in bytes " << GetKeySizeInBytes()
         << '\n';
  stream << offset_string << "Max page size " << GetMaxPageSize() << '\n';

  return stream;
}

BTreeInternalPage::BTreeInternalPage(BTreePagePtr page)
    : page_(std::move(page)) {}

const BTreePagePtr& BTreeInternalPage::GetRawPage() const { return page_; }

uint32_t BTreeInternalPage::GetSize() const {
  return page_->GetValue<uint32_t>(kCurrentSizeHeaderIndex,
                                   BTreePage::kHeaderOffset);
}

void BTreeInternalPage::SetSize(uint32_t size) {
  page_->SetValue(kCurrentSizeHeaderIndex, size, BTreePage::kHeaderOffset);
}

void BTreeInternalPage::IncreaseSize(uint32_t amount) {
  page_->GetValue<uint32_t>(kCurrentSizeHeaderIndex,
                            BTreePage::kHeaderOffset) += amount;
}

Row BTreeInternalPage::GetKey(size_t index) const {
  uint8_t* data = GetKeyPtr(index);
  return page_->GetMarshal()->DeserializeRow(data);
}

PageIndex BTreeInternalPage::GetValue(size_t index) const {
  uint8_t* data = GetValuePtr(index);
  return *reinterpret_cast<PageIndex*>(data);
}

void BTreeInternalPage::SetValue(size_t index, const PageIndex& value) {
  uint8_t* data_raw = GetValuePtr(index);
  PageIndex* data = reinterpret_cast<PageIndex*>(data_raw);
  *data = value;
}

void BTreeInternalPage::SetEntry(size_t index, const Row& key,
                                 const PageIndex& value) {
  uint8_t* key_ptr = GetKeyPtr(index);
  page_->GetMarshal()->SerializeRow(key_ptr, key);
  SetValue(index, value);
}

void BTreeInternalPage::InsertFirstEntry(const PageIndex& value) {
  SetValue(0, value);
  SetSize(GetSize() + 1);
}

bool BTreeInternalPage::InsertEntry(size_t index, const Row& key,
                                    const PageIndex& value) {
  SetEntry(index, key, value);
  SetSize(GetSize() + 1);
  return true;
}

std::pair<PageIndex, size_t> BTreeInternalPage::LookupWithIndex(
    const Row& key) const {
  for (size_t i = 1; i < CalcKeysCount(); ++i) {
    if (CompareRows(GetKey(i), key) == 0) {
      return std::make_pair(GetValue(i), i);
    }
  }
  return std::make_pair(GetValue(0), 0);
}

PageIndex BTreeInternalPage::Lookup(const Row& key) const {
  return LookupWithIndex(key).first;
}

Row BTreeInternalPage::Split(BTreeInternalPage& rhs_page) {
  (void)rhs_page;
  throw std::runtime_error("Not implemented");
}

std::ostream& BTreeInternalPage::Dump(std::ostream& stream,
                                      size_t offset) const {
  size_t size = GetSize();

  std::string offset_string(offset, ' ');
  stream << offset_string << "Size " << size << '\n';
  for (size_t i = 0; i < size; ++i) {
    stream << offset_string << "I " << i << " key "
           << (i == 0 ? "invalid" : ToString(GetKey(i)));
    stream << " value " << GetValue(i) << '\n';
  }

  return stream;
}

uint8_t* BTreeInternalPage::GetKeyPtr(size_t index) const {
  return page_->GetPtrValue<uint8_t>(index * CalcEntrySize(), kHeaderSize);
}

uint8_t* BTreeInternalPage::GetValuePtr(size_t index) const {
  return page_->GetPtrValue<uint8_t>(index * CalcEntrySize(),
                                     kHeaderSize + CalcKeySize());
}

size_t BTreeInternalPage::CalcKeySize() const {
  return page_->GetMarshal()->GetFixedRowSpace();
}

size_t BTreeInternalPage::CalcEntrySize() const {
  return CalcKeySize() + kValueSize;
}

size_t BTreeInternalPage::CalcKeysCount() const {
  return CalculateMaxKeysSize(CalcKeySize());
}

BTreeLeafPage::BTreeLeafPage(BTreePagePtr page) : page_(std::move(page)) {}

const BTreePagePtr& BTreeLeafPage::GetRawPage() const { return page_; }

uint32_t BTreeLeafPage::GetSize() const {
  return page_->GetValue<uint32_t>(kPageSizeHeaderIndex,
                                   BTreePage::kHeaderOffset);
}

void BTreeLeafPage::SetSize(uint32_t size) {
  page_->SetValue(kPageSizeHeaderIndex, size, BTreePage::kHeaderOffset);
}

void BTreeLeafPage::IncreaseSize(uint32_t amount) {
  page_->GetValue<uint32_t>(kPageSizeHeaderIndex, BTreePage::kHeaderOffset) +=
      amount;
}

PageIndex BTreeLeafPage::GetPreviousPageIndex() const {
  return page_->GetValue<PageIndex>(kPreviousPageIdHeaderIndex,
                                    BTreePage::kHeaderOffset);
}

void BTreeLeafPage::SetPreviousPageIndex(PageIndex previous_page_index) {
  page_->SetValue(kPreviousPageIdHeaderIndex, previous_page_index,
                  BTreePage::kHeaderOffset);
}

PageIndex BTreeLeafPage::GetNextPageIndex() const {
  return page_->GetValue<PageIndex>(kNextPageIdHeaderIndex,
                                    BTreePage::kHeaderOffset);
}

void BTreeLeafPage::SetNextPageIndex(PageIndex next_page_index) {
  page_->SetValue(kNextPageIdHeaderIndex, next_page_index,
                  BTreePage::kHeaderOffset);
}

Row BTreeLeafPage::GetKey(size_t index) const {
  uint8_t* data = GetKeyPtr(index);
  return page_->GetMarshal()->DeserializeRow(data);
}

RowId BTreeLeafPage::GetValue(size_t index) const {
  uint8_t* data = GetValuePtr(index);
  return *reinterpret_cast<RowId*>(data);
}

bool BTreeLeafPage::Insert(const Row& key, const RowId& value) {
  if (Lookup(key).has_value()) {
    throw std::runtime_error("Trying to insert a duplicate key");
  }

  size_t index = GetSize();
  SetSize(index + 1);
  SetEntry(index, key, value);
  return true;
}

std::optional<RowId> BTreeLeafPage::Lookup(const Row& key) const {
  for (size_t i = 0; i < GetSize(); ++i) {
    if (CompareRows(GetKey(i), key) == 0) {
      return GetValue(i);
    }
  }
  return std::nullopt;
}

size_t BTreeLeafPage::LowerBound(const Row& key) const {
  size_t res = 0;

  for (size_t i = 0; i < GetSize(); ++i) {
    if (CompareRows(GetKey(i), GetKey(res)) == 1 &&
        CompareRows(GetKey(res), key) == 1) {
      res = i;
    }
  }

  return res;
}

bool BTreeLeafPage::Remove(const Row& key) {
  for (size_t i = 0; i < GetSize(); ++i) {
    if (CompareRows(GetKey(i), key) == 0) {
      size_t j = GetSize() - 1;
      SetEntry(i, GetKey(j), GetValue(j));
      SetSize(GetSize() - 1);
      return true;
    }
  }
  return false;
}

Row BTreeLeafPage::Split(BTreeLeafPage& rhs_page) {
  (void)rhs_page;
  throw std::runtime_error("Not implemented");
}

std::ostream& BTreeLeafPage::Dump(std::ostream& stream, size_t offset) const {
  size_t size = GetSize();

  std::string offset_string(offset, ' ');
  stream << offset_string << "Size " << size << '\n';

  auto previous_page_index = GetPreviousPageIndex();
  auto next_page_index = GetNextPageIndex();

  stream << "Previous page index "
         << (previous_page_index == kInvalidPageIndex
                 ? "invalid"
                 : std::to_string(previous_page_index))
         << '\n';
  stream << "Next page index "
         << (next_page_index == kInvalidPageIndex
                 ? "invalid"
                 : std::to_string(next_page_index))
         << '\n';

  for (size_t i = 0; i < size; ++i) {
    stream << offset_string << "I " << i << " key " << GetKey(i);
    stream << " value " << GetValue(i) << '\n';
  }

  return stream;
}

void BTreeLeafPage::SetEntry(size_t index, const Row& key, const RowId& value) {
  uint8_t* key_ptr = GetKeyPtr(index);
  page_->GetMarshal()->SerializeRow(key_ptr, key);

  uint8_t* value_ptr = GetValuePtr(index);
  *reinterpret_cast<RowId*>(value_ptr) = value;
}

uint8_t* BTreeLeafPage::GetKeyPtr(size_t index) const {
  return page_->GetPtrValue<uint8_t>(index * CalcEntrySize(), kHeaderSize);
}

uint8_t* BTreeLeafPage::GetValuePtr(size_t index) const {
  return page_->GetPtrValue<uint8_t>(index * CalcEntrySize(),
                                     kHeaderSize + CalcKeySize());
}

size_t BTreeLeafPage::CalcKeySize() const {
  return page_->GetMarshal()->GetFixedRowSpace();
}

size_t BTreeLeafPage::CalcEntrySize() const {
  return CalcKeySize() + kValueSize;
}

size_t BTreeLeafPage::CalcKeysCount() const {
  return CalculateMaxKeysSize(CalcKeySize());
}

namespace {

class BTreePageProvider : public IPageProvider {
 public:
  BTreePageProvider(std::shared_ptr<Marshal> marshal,
                    uint32_t key_size_in_bytes, uint32_t max_page_size)
      : marshal_(std::move(marshal)),
        key_size_in_bytes(key_size_in_bytes),
        max_page_size(max_page_size) {}

  std::shared_ptr<IPage> GetPage(std::shared_ptr<Frame> frame) override {
    return std::make_shared<BTreePage>(frame, marshal_, key_size_in_bytes,
                                       max_page_size);
  }

  const uint32_t key_size_in_bytes;

  const uint32_t max_page_size;

 private:
  std::shared_ptr<Marshal> marshal_;
};

}  // namespace

std::shared_ptr<IPageProvider> CreateBTreePageProvider(
    std::shared_ptr<Marshal> marshal, uint32_t key_size_in_bytes,
    uint32_t max_page_size) {
  return std::make_shared<BTreePageProvider>(std::move(marshal),
                                             key_size_in_bytes, max_page_size);
}

}  // namespace shdb
