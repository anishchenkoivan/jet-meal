#pragma once

#include <algorithm>
#include <cstring>
#include <iostream>
#include <memory>
#include <optional>

#include "bufferpool.h"
#include "comparator.h"
#include "marshal.h"
#include "page.h"
#include "page_provider.h"
#include "row.h"

namespace shdb {

enum class BTreePageType : uint32_t {
  kInvalid = 0,
  kMetadata,
  kInternal,
  kLeaf,
};

std::string ToString(BTreePageType page_type);

class BTreePage : public IPage {
 public:
  BTreePage(std::shared_ptr<Frame> frame, std::shared_ptr<Marshal> marshal,
            uint32_t key_size_in_bytes, uint32_t max_page_size);

  static constexpr size_t kHeaderOffset = sizeof(BTreePageType);

  const std::shared_ptr<Frame>& GetFrame() const;

  std::shared_ptr<Frame>& GetFrame();

  const std::shared_ptr<Marshal>& GetMarshal() const;

  BTreePageType GetPageType() const;

  void SetPageType(BTreePageType btree_page_type);

  bool IsInvalidPage() const;

  bool IsLeafPage() const;

  bool IsInternalPage() const;

  bool IsMetadataPage() const;

  uint32_t GetMaxPageSize() const;

  uint32_t GetMinPageSize() const;

  template <typename T>
  const T* GetPtrValue(size_t index, size_t bytes_offset = 0) const {
    return reinterpret_cast<T*>(frame_->GetData() + bytes_offset) + index;
  }

  template <typename T>
  T* GetPtrValue(size_t index, size_t bytes_offset = 0) {
    return reinterpret_cast<T*>(frame_->GetData() + bytes_offset) + index;
  }

  template <typename T>
  const T& GetValue(size_t index, size_t bytes_offset = 0) const {
    return *GetPtrValue<T>(index, bytes_offset);
  }

  template <typename T>
  T& GetValue(size_t index, size_t bytes_offset = 0) {
    return *GetPtrValue<T>(index, bytes_offset);
  }

  template <typename T>
  void SetValue(size_t index, const T& value, size_t bytes_offset = 0) {
    GetValue<T>(index, bytes_offset) = value;
  }

  const uint32_t key_size_in_bytes;
  const uint32_t max_page_size;

 private:
  std::shared_ptr<Frame> frame_;
  std::shared_ptr<Marshal> marshal_;
};

using BTreePagePtr = std::shared_ptr<BTreePage>;

/** BTreeMetadataPage, first page in BTree index.
 * Contains necessary metadata information for btree index startup.
 *
 * Header format:
 * --------------------------------------------------------------------------
 * | PageType (4) | RootPageIndex (4) | KeySizeInBytes (4) | MaxPageSize(4) |
 * --------------------------------------------------------------------------
 */
class BTreeMetadataPage {
 public:
  explicit BTreeMetadataPage(BTreePagePtr page);

  static_assert(sizeof(PageIndex) == sizeof(uint32_t));

  static constexpr size_t kRootPageIndexHeaderOffset = 0;

  static constexpr size_t kKeySizeInBytesHeaderOffset = 1;

  static constexpr size_t kMaxPageSizeHeaderOffset = 2;

  const BTreePagePtr& GetRawPage() const;

  PageIndex GetRootPageIndex() const;

  void SetRootPageIndex(PageIndex root_page_index);

  uint32_t GetKeySizeInBytes() const;

  void SetKeySizeInBytes(uint32_t key_size_in_bytes);

  uint32_t GetMaxPageSize() const;

  void SetMaxPageSize(uint32_t max_page_size);

  std::ostream& Dump(std::ostream& stream, size_t offset = 0) const;

 private:
  BTreePagePtr page_;
};

/* BTree internal page.
 * Store N indexed keys and N + 1 child page indexes (PageIndex) within internal
 * page. First key is always invalid.
 *
 *  Header format (size in bytes, 4 * 2 = 8 bytes in total):
 *  -------------------------------
 * | PageType (4) | CurrentSize(4) |
 *  -------------------------------
 *
 * Internal page format (keys are stored in order):
 *
 *  -------------------------------------------------------------------------------------------------
 * | HEADER | INVALID_KEY(1) + PAGE_INDEX(1) | KEY(2) + PAGE_INDEX(2) | ... |
 * KEY(n) + PAGE_INDEX(n) |
 *  -------------------------------------------------------------------------------------------------
 */
class BTreeInternalPage {
  static const size_t kHeaderSize = 8;
  static const size_t kValueSize = sizeof(PageIndex);

 public:
  explicit BTreeInternalPage(BTreePagePtr page);

  static_assert(sizeof(PageIndex) == sizeof(BTreePageType));

  static_assert(sizeof(PageIndex) == sizeof(uint32_t));

  static constexpr size_t kCurrentSizeHeaderIndex = 0;

  static constexpr size_t kHeaderOffset =
      BTreePage::kHeaderOffset +
      sizeof(uint32_t) * (kCurrentSizeHeaderIndex + 1);

  static constexpr size_t CalculateMaxKeysSize(uint32_t key_size_in_bytes) {
    return (kPageSize - kHeaderOffset) /
           (key_size_in_bytes + sizeof(PageIndex));
  }

  const BTreePagePtr& GetRawPage() const;

  uint32_t GetSize() const;

  void SetSize(uint32_t size);

  void IncreaseSize(uint32_t amount);

  Row GetKey(size_t index) const;

  PageIndex GetValue(size_t index) const;

  /// Set value for specified index
  void SetValue(size_t index, const PageIndex& value);

  /// Set key and value for specified index
  void SetEntry(size_t index, const Row& key, const PageIndex& value);

  /// Insert first value for invalid key
  void InsertFirstEntry(const PageIndex& value);

  /// Insert key and value for specified index
  bool InsertEntry(size_t index, const Row& key, const PageIndex& value);

  /// Lookup specified key in page
  std::pair<PageIndex, size_t> LookupWithIndex(const Row& key) const;

  /// Lookup specified key in page
  PageIndex Lookup(const Row& key) const;

  /** Split current page and move top half of keys to rhs_page.
   * Return top key.
   */
  Row Split(BTreeInternalPage& rhs_page);

  std::ostream& Dump(std::ostream& stream, size_t offset = 0) const;

 private:
  uint8_t* GetKeyPtr(size_t index) const;
  uint8_t* GetValuePtr(size_t index) const;
  size_t CalcKeySize() const;
  size_t CalcEntrySize() const;
  size_t CalcKeysCount() const;

  BTreePagePtr page_;
};

/** Store indexed key and value. Only support unique key.
 *
 *  Header format (size in byte, 4 * 4 = 16 bytes in total):
 *  ------------------------------------------------------------------------
 * | PageType (4) | PageSize(4) | PreviousPageIndex (4) | NextPageIndex (4) |
 *  ------------------------------------------------------------------------
 *
 *  Leaf page format (keys are stored in order):
 *  --------------------------------------------------------------------
 * | HEADER | KEY(1) + RID(1) | KEY(2) + RID(2) | ... | KEY(n) + RID(n) |
 *  --------------------------------------------------------------------
 */
class BTreeLeafPage {
  static const size_t kHeaderSize = 16;
  static const size_t kValueSize = sizeof(RowId);

 public:
  explicit BTreeLeafPage(BTreePagePtr page);

  static_assert(sizeof(PageIndex) == sizeof(BTreePageType));

  static_assert(sizeof(PageIndex) == sizeof(uint32_t));

  static constexpr size_t kPageSizeHeaderIndex = 0;

  static constexpr size_t kPreviousPageIdHeaderIndex = 1;

  static constexpr size_t kNextPageIdHeaderIndex = 2;

  static constexpr size_t kHeaderOffset =
      BTreePage::kHeaderOffset +
      sizeof(uint32_t) * (kNextPageIdHeaderIndex + 1);

  static constexpr size_t CalculateMaxKeysSize(uint32_t key_size_in_bytes) {
    return (kPageSize - kHeaderOffset) / (sizeof(RowId) + key_size_in_bytes);
  }

  const BTreePagePtr& GetRawPage() const;

  uint32_t GetSize() const;

  void SetSize(uint32_t size);

  void IncreaseSize(uint32_t amount);

  PageIndex GetPreviousPageIndex() const;

  void SetPreviousPageIndex(PageIndex previous_page_index);

  PageIndex GetNextPageIndex() const;

  void SetNextPageIndex(PageIndex next_page_index);

  Row GetKey(size_t index) const;

  RowId GetValue(size_t index) const;

  /// Insert specified key and value in page
  bool Insert(const Row& key, const RowId& value);

  /// Lookup specified key in page
  std::optional<RowId> Lookup(const Row& key) const;

  /// Return index of lower bound for specified key
  size_t LowerBound(const Row& key) const;

  /// Return index of upper bound for specified key
  size_t UpperBound(const Row& key) const;

  /// Remove specified key from page
  bool Remove(const Row& key);

  /** Split current page and move top half of keys to rhs_page.
   * Return top key.
   */
  Row Split(BTreeLeafPage& rhs_page);

  std::ostream& Dump(std::ostream& stream, size_t offset = 0) const;

 private:
  void SetEntry(size_t index, const Row& key, const RowId& value);

  uint8_t* GetKeyPtr(size_t index) const;
  uint8_t* GetValuePtr(size_t index) const;
  size_t CalcKeySize() const;
  size_t CalcEntrySize() const;
  size_t CalcKeysCount() const;

  BTreePagePtr page_;
};

std::shared_ptr<IPageProvider> CreateBTreePageProvider(
    std::shared_ptr<Marshal> marshal, uint32_t key_size_in_bytes,
    uint32_t max_page_size);

}  // namespace shdb
