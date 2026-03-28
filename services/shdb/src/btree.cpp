#include "btree.h"

#include <cassert>

#include "btree_page.h"
#include "page.h"
#include "range_inference.h"

namespace shdb {

BTreeIndexTable::BTreeIndexTable(std::shared_ptr<IIndexTable> table)
    : table_(std::move(table)) {}

void BTreeIndexTable::SetIndexTable(std::shared_ptr<IIndexTable> index_table) {
  table_ = std::move(index_table);
}

PageIndex BTreeIndexTable::GetPageCount() { return table_->GetPageCount(); }

std::pair<BTreeMetadataPage, RowIndex> BTreeIndexTable::AllocateMetadataPage() {
  PageIndex page_index = AllocatePage();
  auto raw_page = GetPage(page_index);
  raw_page->SetPageType(BTreePageType::kMetadata);

  return {BTreeMetadataPage(raw_page), page_index};
}

BTreeMetadataPage BTreeIndexTable::GetMetadataPage(PageIndex page_index) {
  return BTreeMetadataPage(GetPage(page_index));
}

std::pair<BTreeLeafPage, RowIndex> BTreeIndexTable::AllocateLeafPage() {
  PageIndex page_index = AllocatePage();
  auto raw_page = GetPage(page_index);
  raw_page->SetPageType(BTreePageType::kLeaf);

  return {BTreeLeafPage(raw_page), page_index};
}

BTreeLeafPage BTreeIndexTable::GetLeafPage(PageIndex page_index) {
  return BTreeLeafPage(GetPage(page_index));
}

std::pair<BTreeInternalPage, RowIndex> BTreeIndexTable::AllocateInternalPage() {
  PageIndex page_index = AllocatePage();
  auto raw_page = GetPage(page_index);
  raw_page->SetPageType(BTreePageType::kInternal);

  return {BTreeInternalPage(raw_page), page_index};
}

BTreeInternalPage BTreeIndexTable::GetInternalPage(PageIndex page_index) {
  return BTreeInternalPage(GetPage(page_index));
}

BTreePagePtr BTreeIndexTable::GetPage(PageIndex page_index) {
  return std::static_pointer_cast<BTreePage>(table_->GetPage(page_index));
}

PageIndex BTreeIndexTable::AllocatePage() { return table_->AllocatePage(); }

BTree::BTree(const IndexMetadata& metadata, Store& store,
             std::optional<size_t> page_max_keys_size)
    : index_metadata_(metadata), metadata_page_(nullptr) {
  if (!page_max_keys_size) {
    size_t internal_page_max_keys_size =
        BTreeInternalPage::CalculateMaxKeysSize(
            index_metadata_.FixedKeySizeInBytes());
    size_t leaf_page_max_keys_size = BTreeLeafPage::CalculateMaxKeysSize(
        index_metadata_.FixedKeySizeInBytes());
    page_max_keys_size =
        std::min(internal_page_max_keys_size, leaf_page_max_keys_size);
  }

  max_page_size_ = *page_max_keys_size;
  auto page_provider = CreateBTreePageProvider(
      index_metadata_.GetKeyMarshal(), index_metadata_.FixedKeySizeInBytes(),
      max_page_size_);
  index_table_.SetIndexTable(store.CreateOrOpenIndexTable(
      index_metadata_.GetIndexName(), page_provider));

  bool initial_index_creation = index_table_.GetPageCount() == 0;

  if (initial_index_creation) {
    auto [allocated_metadata_page, metadata_page_index] =
        index_table_.AllocateMetadataPage();
    assert(metadata_page_index == kMetadataPageIndex);

    auto [root_page, root_page_index] = index_table_.AllocateLeafPage();

    root_page.SetPreviousPageIndex(kInvalidPageIndex);
    root_page.SetNextPageIndex(kInvalidPageIndex);

    metadata_page_ = std::move(allocated_metadata_page);
    metadata_page_.SetRootPageIndex(root_page_index);
    metadata_page_.SetMaxPageSize(max_page_size_);
    metadata_page_.SetKeySizeInBytes(index_metadata_.FixedKeySizeInBytes());
    return;
  }

  metadata_page_ = index_table_.GetMetadataPage(kMetadataPageIndex);

  if (index_metadata_.FixedKeySizeInBytes() !=
      metadata_page_.GetKeySizeInBytes()) {
    throw std::runtime_error(
        "BTree index inconsistency. Expected " +
        std::to_string(metadata_page_.GetKeySizeInBytes()) +
        " key size in bytes. Actual " +
        std::to_string(index_metadata_.FixedKeySizeInBytes()));
  }

  if (max_page_size_ != metadata_page_.GetMaxPageSize()) {
    throw std::runtime_error("BTree index inconsistency. Expected " +
                             std::to_string(metadata_page_.GetMaxPageSize()) +
                             " max page size. Actual " +
                             std::to_string(max_page_size_));
  }
}

const IndexMetadata& BTree::GetMetadata() const { return index_metadata_; }

bool BTree::SupportsVariableLengthKeys() { return false; }

bool BTree::IsUnique() { return true; }

void BTree::Insert(const IndexKey& index_key, const RowId& row_id) {
#if 0
  PageIndex page_index = metadata_page_.GetRootPageIndex();
  BTreePagePtr page = index_table_.GetPage(page_index);

  while (page->IsInternalPage()) {
    BTreeInternalPage internal_page = BTreeInternalPage(page);
    page_index = internal_page.Lookup(index_key);
  }

  BTreeLeafPage leaf_page = BTreeLeafPage(page);
  const auto row_id = leaf_page.Lookup(index_key);

  std::vector<RowId> res;
  
  if (row_id.has_value()) {
    res.push_back(row_id.value());
  }

  return res;
#endif
}

bool BTree::Remove(const IndexKey& index_key, const RowId& row_id) {
  (void)index_key;
  (void)row_id;
  throw std::runtime_error("Not implemented");
}

std::vector<RowId> BTree::Lookup(const IndexKey& index_key) {
  PageIndex page_index = metadata_page_.GetRootPageIndex();
  BTreePagePtr page = index_table_.GetPage(page_index);

  while (page->IsInternalPage()) {
    BTreeInternalPage internal_page = BTreeInternalPage(page);
    page_index = internal_page.Lookup(index_key);
  }

  BTreeLeafPage leaf_page = BTreeLeafPage(page);
  const auto row_id = leaf_page.Lookup(index_key);

  std::vector<RowId> res;
  
  if (row_id.has_value()) {
    res.push_back(row_id.value());
  }

  return res;
}

namespace {

class BTreeIndexIterator : public IIndexIterator {
 public:
  BTreeIndexIterator(BTreeIndexTable& index_table, BTreeLeafPage leaf_page,
                     size_t leaf_page_offset, std::optional<Row> max_key,
                     bool include_max_key = false)
      : index_table_(index_table),
        leaf_page_(leaf_page),
        leaf_page_offset_(leaf_page_offset),
        max_key_(std::move(max_key)),
        include_max_key_(include_max_key) {};

  std::optional<std::pair<IndexKey, RowId>> NextRow() override {
    throw std::runtime_error("Not implemented");
  }

 private:
  bool IsRowValid(Row& key) {
    (void)key;
    throw std::runtime_error("Not implemented");
  }

  BTreeIndexTable& index_table_;
  BTreeLeafPage leaf_page_;
  size_t leaf_page_offset_;
  std::optional<Row> max_key_;
  bool include_max_key_;
  Row previous_row_;
};

class BTreeEmptyIndexIterator : public IIndexIterator {
 public:
  std::optional<std::pair<IndexKey, RowId>> NextRow() override { return {}; }
};

}  // namespace

std::unique_ptr<IIndexIterator> BTree::Read() {
  throw std::runtime_error("Not implemented");
}

std::unique_ptr<IIndexIterator> BTree::Read(
    const ColumnConstraint& constraint) {
  throw std::runtime_error("Not implemented");
}

void BTree::Dump(std::ostream& stream) {
  PageIndex pages_count = index_table_.GetPageCount();
  for (PageIndex i = 0; i < pages_count; ++i) {
    auto page = index_table_.GetPage(i);
    auto page_type = page->GetPageType();

    stream << "Page " << i << " page type " << ToString(page_type) << '\n';

    switch (page_type) {
      case BTreePageType::kInvalid: {
        break;
      }
      case BTreePageType::kMetadata: {
        auto metadata_page = BTreeMetadataPage(page);
        metadata_page.Dump(stream);
        break;
      }
      case BTreePageType::kInternal: {
        auto internal_page = BTreeInternalPage(page);
        internal_page.Dump(stream);
        break;
      }
      case BTreePageType::kLeaf: {
        auto leaf_page = BTreeLeafPage(page);
        leaf_page.Dump(stream);
        break;
      }
    }
  }
}

size_t BTree::GetMaxPageSize() const { return max_page_size_; }

const BTreeIndexTable& BTree::GetIndexTable() const { return index_table_; }

BTreeIndexTable& BTree::GetIndexTable() { return index_table_; }

BTreeLeafPage BTree::LookupLeafPage(const IndexKey& index_key) {
  throw std::runtime_error("Not implemented");
}

BTreeLeafPage BTree::LookupLeftmostLeafPage() {
  throw std::runtime_error("Not implemented");
}

void BTree::RemoveIndex(const std::string& name, Store& store) {
  store.RemoveTable(name);
}

void BTree::RemoveIndexIfExists(const std::string& name, Store& store) {
  store.RemoveTableIfExists(name);
}

}  // namespace shdb
