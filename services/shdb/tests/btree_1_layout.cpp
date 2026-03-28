#include <gtest/gtest.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#include <random>

#include "btree_page.h"
#include "db.h"

namespace {

template <typename It>
void RandomShuffle(It begin, It end) {
  std::random_device random_device;
  std::mt19937 generator(random_device());
  std::shuffle(begin, end, generator);
}

template <shdb::BTreePageType PageType>
class BTreePageHolder {
 public:
  static_assert(PageType == shdb::BTreePageType::kInternal ||
                PageType == shdb::BTreePageType::kLeaf);

  explicit BTreePageHolder(std::shared_ptr<shdb::Schema> key_schema)
      : key_schema_(std::move(key_schema)),
        key_marshal_(std::make_shared<shdb::Marshal>(key_schema_)),
        frame_memory_(std::make_unique<uint8_t[]>(shdb::kPageSize)),
        frame_(std::make_shared<shdb::Frame>(nullptr, 0, frame_memory_.get())),
        max_keys_size_(CalculateMaxKeySize(key_marshal_->GetFixedRowSpace())),
        btree_page_(std::make_shared<shdb::BTreePage>(
            frame_, key_marshal_, key_marshal_->GetFixedRowSpace(),
            max_keys_size_)) {
    btree_page_->SetPageType(PageType);
  }

  size_t GetMaxKeysSize() const { return max_keys_size_; }

  const std::shared_ptr<shdb::BTreePage>& GetBTreePage() const {
    return btree_page_;
  }

  std::shared_ptr<shdb::BTreePage>& GetBTreePage() { return btree_page_; }

 private:
  static size_t CalculateMaxKeySize(size_t key_size) {
    if constexpr (PageType == shdb::BTreePageType::kLeaf) {
      return shdb::BTreeLeafPage::CalculateMaxKeysSize(key_size);
    } else if constexpr (PageType == shdb::BTreePageType::kInternal) {
      return shdb::BTreeInternalPage::CalculateMaxKeysSize(key_size);
    }
  }

  std::shared_ptr<shdb::Schema> key_schema_;
  std::shared_ptr<shdb::Marshal> key_marshal_;
  std::unique_ptr<uint8_t[]> frame_memory_;
  std::shared_ptr<shdb::Frame> frame_;
  size_t max_keys_size_ = 0;
  std::shared_ptr<shdb::BTreePage> btree_page_;
};

}  // namespace

TEST(BTree, InternalPageLayoutSimpleKey) {
  static constexpr size_t kIterations = 5;

  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema = shdb::CreateSchema({shdb::Type::kUint64});
      BTreePageHolder<shdb::BTreePageType::kInternal> page_holder(schema);

      size_t insert_keys_size = 10;
      ASSERT_TRUE(insert_keys_size <= page_holder.GetMaxKeysSize());

      auto btree_internal_page =
          shdb::BTreeInternalPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::PageIndex>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        entries.emplace_back(shdb::Row{shdb::Value{static_cast<uint64_t>(i)}},
                             static_cast<shdb::PageIndex>(i));
      }

      btree_internal_page.InsertFirstEntry(entries[0].second);
      ASSERT_EQ(btree_internal_page.GetSize(), 1);

      for (size_t i = 1; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        btree_internal_page.InsertEntry(i, entry.first, entry.second);
        ASSERT_EQ(btree_internal_page.GetSize(), i + 1);
      }

      for (const auto& entry : entries) {
        auto result = btree_internal_page.Lookup(entry.first);
        ASSERT_EQ(btree_internal_page.Lookup(entry.first), entry.second);
      }
    }
  }
  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema = shdb::CreateSchema({shdb::Type::kUint64});
      BTreePageHolder<shdb::BTreePageType::kInternal> page_holder(schema);

      size_t insert_keys_size = page_holder.GetMaxKeysSize();

      auto btree_internal_page =
          shdb::BTreeInternalPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::PageIndex>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        entries.emplace_back(shdb::Row{shdb::Value{static_cast<uint64_t>(i)}},
                             static_cast<shdb::PageIndex>(i));
      }

      btree_internal_page.InsertFirstEntry(entries[0].second);
      ASSERT_EQ(btree_internal_page.GetSize(), 1);

      for (size_t i = 1; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        btree_internal_page.InsertEntry(i, entry.first, entry.second);
        ASSERT_EQ(btree_internal_page.GetSize(), i + 1);
      }

      for (auto& entry : entries) {
        ASSERT_EQ(btree_internal_page.Lookup(entry.first), entry.second);
      }
    }
  }
}

TEST(BTree, InternalPageLayoutComplexKey) {
  static constexpr size_t kIterations = 5;

  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema =
          shdb::CreateSchema({shdb::Type::kUint64, {shdb::Type::kVarchar, 16}});
      BTreePageHolder<shdb::BTreePageType::kInternal> page_holder(schema);

      size_t insert_keys_size = 10;
      ASSERT_TRUE(insert_keys_size <= page_holder.GetMaxKeysSize());

      auto btree_internal_page =
          shdb::BTreeInternalPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::PageIndex>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        auto key = shdb::Row{shdb::Value{static_cast<uint64_t>(i)},
                             shdb::Value{"Key_" + std::to_string(i)}};
        auto value = static_cast<shdb::PageIndex>(i);
        entries.emplace_back(std::move(key), std::move(value));
      }

      btree_internal_page.InsertFirstEntry(entries[0].second);
      ASSERT_EQ(btree_internal_page.GetSize(), 1);

      for (size_t i = 1; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        btree_internal_page.InsertEntry(i, entry.first, entry.second);
        ASSERT_EQ(btree_internal_page.GetSize(), i + 1);
      }

      for (const auto& entry : entries) {
        auto result = btree_internal_page.Lookup(entry.first);
        ASSERT_EQ(btree_internal_page.Lookup(entry.first), entry.second);
      }
    }
  }
  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema =
          shdb::CreateSchema({shdb::Type::kUint64, {shdb::Type::kVarchar, 16}});
      BTreePageHolder<shdb::BTreePageType::kInternal> page_holder(schema);

      size_t insert_keys_size = page_holder.GetMaxKeysSize();

      auto btree_internal_page =
          shdb::BTreeInternalPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::PageIndex>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        auto key = shdb::Row{shdb::Value{static_cast<uint64_t>(i)},
                             shdb::Value{"Key_" + std::to_string(i)}};
        auto value = static_cast<shdb::PageIndex>(i);
        entries.emplace_back(std::move(key), std::move(value));
      }

      btree_internal_page.InsertFirstEntry(entries[0].second);
      ASSERT_EQ(btree_internal_page.GetSize(), 1);

      for (size_t i = 1; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        btree_internal_page.InsertEntry(i, entry.first, entry.second);
        ASSERT_EQ(btree_internal_page.GetSize(), i + 1);
      }

      for (auto& entry : entries) {
        ASSERT_EQ(btree_internal_page.Lookup(entry.first), entry.second);
      }
    }
  }
}

TEST(BTree, LeafPageLayoutSimpleKey) {
  static constexpr size_t kIterations = 5;

  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema = shdb::CreateSchema({shdb::Type::kUint64});
      BTreePageHolder<shdb::BTreePageType::kLeaf> page_holder(schema);

      size_t insert_keys_size = 10;
      ASSERT_TRUE(insert_keys_size <= page_holder.GetMaxKeysSize());

      auto btree_leaf_page = shdb::BTreeLeafPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::RowId>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        entries.emplace_back(shdb::Row{shdb::Value{static_cast<uint64_t>(i)}},
                             shdb::RowId{0, static_cast<shdb::RowIndex>(i)});
      }

      RandomShuffle(entries.begin(), entries.end());

      for (size_t i = 0; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        ASSERT_TRUE(btree_leaf_page.Insert(entry.first, entry.second));
        ASSERT_EQ(btree_leaf_page.GetSize(), i + 1);
      }

      for (auto& entry : entries) {
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), entry.second);
      }

      for (auto& entry : entries) {
        ASSERT_TRUE(btree_leaf_page.Remove(entry.first));
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), std::nullopt);
      }

      ASSERT_EQ(btree_leaf_page.GetSize(), 0);
    }
  }
  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema = shdb::CreateSchema({shdb::Type::kUint64});
      BTreePageHolder<shdb::BTreePageType::kLeaf> page_holder(schema);

      size_t insert_keys_size = page_holder.GetMaxKeysSize();

      auto btree_leaf_page = shdb::BTreeLeafPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::RowId>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        entries.emplace_back(shdb::Row{shdb::Value{static_cast<uint64_t>(i)}},
                             shdb::RowId{0, static_cast<shdb::RowIndex>(i)});
      }

      RandomShuffle(entries.begin(), entries.end());

      for (size_t i = 0; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        ASSERT_TRUE(btree_leaf_page.Insert(entry.first, entry.second));
        ASSERT_EQ(btree_leaf_page.GetSize(), i + 1);
      }

      for (auto& entry : entries) {
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), entry.second);
      }

      for (auto& entry : entries) {
        ASSERT_TRUE(btree_leaf_page.Remove(entry.first));
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), std::nullopt);
      }

      ASSERT_EQ(btree_leaf_page.GetSize(), 0);
    }
  }
  {
    /// Insert duplicate key

    auto schema = shdb::CreateSchema({shdb::Type::kUint64});
    BTreePageHolder<shdb::BTreePageType::kLeaf> page_holder(schema);

    auto btree_leaf_page = shdb::BTreeLeafPage(page_holder.GetBTreePage());

    auto key = shdb::Row{shdb::Value{static_cast<uint64_t>(0)}};
    auto value = shdb::RowId{0, static_cast<shdb::RowIndex>(0)};

    btree_leaf_page.Insert(key, value);
    EXPECT_ANY_THROW(btree_leaf_page.Insert(key, value));
  }
}

TEST(BTree, LeafPageLayoutComplexKey) {
  static constexpr size_t kIterations = 5;

  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema =
          shdb::CreateSchema({shdb::Type::kUint64, {shdb::Type::kVarchar, 16}});
      BTreePageHolder<shdb::BTreePageType::kLeaf> page_holder(schema);

      size_t insert_keys_size = 10;
      ASSERT_TRUE(insert_keys_size <= page_holder.GetMaxKeysSize());

      auto btree_leaf_page = shdb::BTreeLeafPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::RowId>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        auto key = shdb::Row{shdb::Value{static_cast<uint64_t>(i)},
                             shdb::Value{"Key_" + std::to_string(i)}};
        auto value = shdb::RowId{0, static_cast<shdb::RowIndex>(i)};
        entries.emplace_back(std::move(key), std::move(value));
      }

      RandomShuffle(entries.begin(), entries.end());

      for (size_t i = 0; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        ASSERT_TRUE(btree_leaf_page.Insert(entry.first, entry.second));
        ASSERT_EQ(btree_leaf_page.GetSize(), i + 1);
      }

      for (auto& entry : entries) {
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), entry.second);
      }

      for (auto& entry : entries) {
        ASSERT_TRUE(btree_leaf_page.Remove(entry.first));
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), std::nullopt);
      }

      ASSERT_EQ(btree_leaf_page.GetSize(), 0);
    }
  }
  {
    for (size_t iteration = 0; iteration < kIterations; ++iteration) {
      auto schema =
          shdb::CreateSchema({shdb::Type::kUint64, {shdb::Type::kVarchar, 16}});
      BTreePageHolder<shdb::BTreePageType::kLeaf> page_holder(schema);

      size_t insert_keys_size = page_holder.GetMaxKeysSize();

      auto btree_leaf_page = shdb::BTreeLeafPage(page_holder.GetBTreePage());

      std::vector<std::pair<shdb::Row, shdb::RowId>> entries;

      for (size_t i = 0; i < insert_keys_size; ++i) {
        auto key = shdb::Row{shdb::Value{static_cast<uint64_t>(i)},
                             shdb::Value{"Key_" + std::to_string(i)}};
        auto value = shdb::RowId{0, static_cast<shdb::RowIndex>(i)};
        entries.emplace_back(std::move(key), std::move(value));
      }

      RandomShuffle(entries.begin(), entries.end());

      for (size_t i = 0; i < insert_keys_size; ++i) {
        const auto& entry = entries[i];
        ASSERT_TRUE(btree_leaf_page.Insert(entry.first, entry.second));
        ASSERT_EQ(btree_leaf_page.GetSize(), i + 1);
      }

      for (auto& entry : entries) {
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), entry.second);
      }

      for (auto& entry : entries) {
        ASSERT_TRUE(btree_leaf_page.Remove(entry.first));
        ASSERT_EQ(btree_leaf_page.Lookup(entry.first), std::nullopt);
      }

      ASSERT_EQ(btree_leaf_page.GetSize(), 0);
    }
  }
  {
    /// Insert duplicate key

    auto schema =
        shdb::CreateSchema({shdb::Type::kUint64, {shdb::Type::kVarchar, 16}});
    BTreePageHolder<shdb::BTreePageType::kLeaf> page_holder(schema);

    auto btree_leaf_page = shdb::BTreeLeafPage(page_holder.GetBTreePage());

    auto key = shdb::Row{shdb::Value{static_cast<uint64_t>(0)},
                         shdb::Value{"Key_" + std::to_string(0)}};
    auto value = shdb::RowId{0, static_cast<shdb::RowIndex>(0)};

    btree_leaf_page.Insert(key, value);
    EXPECT_ANY_THROW(btree_leaf_page.Insert(key, value));
  }
}
