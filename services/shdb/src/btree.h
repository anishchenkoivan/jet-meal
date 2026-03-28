#pragma once

#include "btree_page.h"
#include "index.h"
#include "index_table.h"
#include "range_inference.h"
#include "row.h"
#include "store.h"

namespace shdb {

class BTree;
using BTreePtr = std::shared_ptr<BTree>;

class BTreeIndexTable {
 public:
  BTreeIndexTable() = default;

  explicit BTreeIndexTable(std::shared_ptr<IIndexTable> table);

  void SetIndexTable(std::shared_ptr<IIndexTable> index_table);

  PageIndex GetPageCount();

  std::pair<BTreeMetadataPage, RowIndex> AllocateMetadataPage();

  BTreeMetadataPage GetMetadataPage(PageIndex page_index);

  std::pair<BTreeLeafPage, RowIndex> AllocateLeafPage();

  BTreeLeafPage GetLeafPage(PageIndex page_index);

  std::pair<BTreeInternalPage, RowIndex> AllocateInternalPage();

  BTreeInternalPage GetInternalPage(PageIndex page_index);

  BTreePagePtr GetPage(PageIndex page_index);

 private:
  PageIndex AllocatePage();

  std::shared_ptr<IIndexTable> table_;
};

class BTree : public IIndex {
 public:
  BTree(const IndexMetadata& metadata, Store& store,
        std::optional<size_t> page_max_keys_size = std::nullopt);

  static void RemoveIndex(const std::string& name, Store& store);

  static void RemoveIndexIfExists(const std::string& name, Store& store);

  const IndexMetadata& GetMetadata() const override;

  bool SupportsVariableLengthKeys() override;

  bool IsUnique() override;

  void Insert(const IndexKey& index_key, const RowId& row_id) override;

  bool Remove(const IndexKey& index_key, const RowId& row_id) override;

  std::vector<RowId> Lookup(const IndexKey& index_key) override;

  std::unique_ptr<IIndexIterator> Read() override;

  std::unique_ptr<IIndexIterator> Read(
      const ColumnConstraint& predicates) override;

  size_t GetMaxPageSize() const;

  const BTreeIndexTable& GetIndexTable() const;

  BTreeIndexTable& GetIndexTable();

  void Dump(std::ostream& stream);

  static constexpr PageIndex kMetadataPageIndex = 0;

 private:
  BTreeLeafPage LookupLeafPage(const IndexKey& index_key);

  BTreeLeafPage LookupLeftmostLeafPage();

  size_t max_page_size_ = 0;

  BTreeIndexTable index_table_;

  BTreeMetadataPage metadata_page_;

  IndexMetadata index_metadata_;
};

}  // namespace shdb
