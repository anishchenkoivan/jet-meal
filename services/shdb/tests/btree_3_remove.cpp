#include <gtest/gtest.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#include <random>

#include "btree.h"
#include "btree_page.h"
#include "db.h"

namespace {

template <typename It>
void RandomShuffle(It begin, It end) {
  std::random_device random_device;
  std::mt19937 generator(random_device());
  std::shuffle(begin, end, generator);
}

std::shared_ptr<shdb::Database> CreateDatabase(int frame_count) {
  auto db = shdb::Connect("./mydb", frame_count);
  return db;
}

void ValidateBTree(
    shdb::BTree& btree,
    const std::vector<std::pair<shdb::Row, shdb::RowId>>& inserted_entries) {
  auto inserted_entries_copy = inserted_entries;
  std::sort(inserted_entries_copy.begin(), inserted_entries_copy.end(),
            [](auto& lhs, auto& rhs) {
              return shdb::CompareRows(lhs.first, rhs.first) < 0;
            });

  auto& index_table = btree.GetIndexTable();
  auto page_count = index_table.GetPageCount();
  ASSERT_GE(page_count, 1);

  auto metadata_page =
      index_table.GetMetadataPage(shdb::BTree::kMetadataPageIndex);
  auto root_page_index = metadata_page.GetRootPageIndex();
  auto current_page = index_table.GetPage(root_page_index);
  while (!current_page->IsLeafPage()) {
    ASSERT_TRUE(current_page->IsInternalPage());
    shdb::BTreeInternalPage internal_page(current_page);
    current_page = index_table.GetPage(internal_page.GetValue(0));
  }

  std::vector<std::pair<shdb::Row, shdb::RowId>> entries;

  shdb::BTreeLeafPage leaf_page(current_page);
  size_t entry_offset = 0;

  while (true) {
    if (entry_offset == leaf_page.GetSize()) {
      auto next_page_index = leaf_page.GetNextPageIndex();
      if (next_page_index == shdb::kInvalidPageIndex) {
        break;
      }

      leaf_page = index_table.GetLeafPage(leaf_page.GetNextPageIndex());
      entry_offset = 0;
      continue;
    }

    auto key = leaf_page.GetKey(entry_offset);
    auto value = leaf_page.GetValue(entry_offset);
    entries.emplace_back(std::move(key), std::move(value));
    ++entry_offset;
  }

  ASSERT_EQ(entries, inserted_entries_copy);
}
}  // namespace

void TestBTreeSimpleKey(
    std::function<size_t(size_t)> max_page_size_to_insert_keys_size,
    std::optional<size_t> max_keys_size = {}) {
  auto db = CreateDatabase(1024);
  auto schema = shdb::CreateSchema({shdb::Type::kUint64});

  shdb::IndexMetadata metadata("test_index", std::move(schema));
  shdb::BTree::RemoveIndexIfExists(metadata.GetIndexName(), *db->GetStore());

  auto btree_index =
      std::make_shared<shdb::BTree>(metadata, *db->GetStore(), max_keys_size);

  size_t insert_keys_size =
      max_page_size_to_insert_keys_size(btree_index->GetMaxPageSize());

  std::vector<std::pair<shdb::Row, shdb::RowId>> entries;

  for (size_t i = 0; i < insert_keys_size; ++i) {
    entries.emplace_back(shdb::Row{shdb::Value{static_cast<uint64_t>(i)}},
                         shdb::RowId{0, static_cast<shdb::RowIndex>(i)});
  }

  RandomShuffle(entries.begin(), entries.end());

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Insert(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first),
              std::vector<shdb::RowId>{entry.second});
  }

  ValidateBTree(*btree_index, entries);

  for (auto& entry : entries) {
    ASSERT_EQ(btree_index->Lookup(entry.first),
              std::vector<shdb::RowId>{entry.second});
  }

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Remove(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first), std::vector<shdb::RowId>{});
  }

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Insert(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first),
              std::vector<shdb::RowId>{entry.second});
  }

  ValidateBTree(*btree_index, entries);

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Remove(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first), std::vector<shdb::RowId>{});
  }

  shdb::BTree::RemoveIndex(metadata.GetIndexName(), *db->GetStore());
}

void TestBTreeComplexKey(
    std::function<size_t(size_t)> max_page_size_to_insert_keys_size,
    std::optional<size_t> max_keys_size = {}) {
  auto db = CreateDatabase(1024);
  auto schema =
      shdb::CreateSchema({shdb::Type::kUint64, {shdb::Type::kVarchar, 16}});

  shdb::IndexMetadata metadata("test_index", std::move(schema));
  shdb::BTree::RemoveIndexIfExists(metadata.GetIndexName(), *db->GetStore());

  auto btree_index =
      std::make_shared<shdb::BTree>(metadata, *db->GetStore(), max_keys_size);

  size_t insert_keys_size =
      max_page_size_to_insert_keys_size(btree_index->GetMaxPageSize());

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
    btree_index->Insert(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first),
              std::vector<shdb::RowId>{entry.second});
  }

  ValidateBTree(*btree_index, entries);

  for (auto& entry : entries) {
    ASSERT_EQ(btree_index->Lookup(entry.first),
              std::vector<shdb::RowId>{entry.second});
  }

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Remove(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first), std::vector<shdb::RowId>{});
  }

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Insert(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first),
              std::vector<shdb::RowId>{entry.second});
  }

  ValidateBTree(*btree_index, entries);

  for (size_t i = 0; i < insert_keys_size; ++i) {
    const auto& entry = entries[i];
    btree_index->Remove(entry.first, entry.second);
    ASSERT_EQ(btree_index->Lookup(entry.first), std::vector<shdb::RowId>{});
  }

  shdb::BTree::RemoveIndex(metadata.GetIndexName(), *db->GetStore());
}

TEST(BTree, BTreeRemoveSimpleKey) {
  static size_t iterations = 5;

  {
    for (size_t i = 0; i < iterations; ++i) {
      TestBTreeSimpleKey([](size_t) { return 10; });
    }
  }
  {
    for (size_t i = 0; i < iterations; ++i) {
      TestBTreeSimpleKey(
          [](size_t max_page_size) { return max_page_size * 16; });
    }
  }
  {
    for (size_t i = 0; i < iterations; ++i) {
      TestBTreeSimpleKey(
          [](size_t max_page_size) { return max_page_size * 100; }, 16);
    }
  }
}

TEST(BTree, BTreeRemoveComplexKey) {
  static size_t iterations = 5;

  {
    for (size_t i = 0; i < iterations; ++i) {
      TestBTreeComplexKey([](size_t) { return 10; });
    }
  }
  {
    for (size_t i = 0; i < iterations; ++i) {
      TestBTreeComplexKey(
          [](size_t max_page_size) { return max_page_size * 16; });
    }
  }
  {
    for (size_t i = 0; i < iterations; ++i) {
      TestBTreeComplexKey(
          [](size_t max_page_size) { return max_page_size * 100; }, 16);
    }
  }
}

TEST(BTree, InsertRemoveInsert) {
  int number_of_epochs = 50;
  int number_of_iterations = 1001;

  auto db = CreateDatabase(1024);
  auto schema = shdb::CreateSchema({shdb::Type::kUint64});

  std::mt19937 generator(42);

  for (int epoch = 0; epoch < number_of_epochs; ++epoch) {
    std::uniform_int_distribution distribution(0, epoch * 20);

    shdb::IndexMetadata metadata("test_index", schema);
    shdb::BTree::RemoveIndexIfExists(metadata.GetIndexName(), *db->GetStore());

    auto btree_index =
        std::make_shared<shdb::BTree>(metadata, *db->GetStore(), 16);

    auto map = std::map<uint64_t, shdb::RowId>{};

    for (int iteration = 0; iteration < number_of_iterations; ++iteration) {
      uint64_t key = distribution(generator);

      if (map.contains(key)) {
        ASSERT_EQ(btree_index->Lookup(shdb::Row{shdb::Value{key}}),
                  std::vector<shdb::RowId>{map[key]});

        map.erase(key);

        btree_index->Remove(shdb::Row{shdb::Value{key}}, {});
        ASSERT_EQ(btree_index->Lookup(shdb::Row{shdb::Value{key}}),
                  std::vector<shdb::RowId>{});
      } else {
        auto value = shdb::RowId{
            0, static_cast<shdb::RowIndex>(distribution(generator))};

        map[key] = value;

        btree_index->Insert(shdb::Row{shdb::Value{key}}, value);
        ASSERT_EQ(btree_index->Lookup(shdb::Row{shdb::Value{key}}),
                  std::vector<shdb::RowId>{value});
      }

      if (iteration % 50 == 0) {
        std::vector<std::pair<shdb::Row, shdb::RowId>> entries;
        for (auto& [key, value] : map) {
          entries.emplace_back(shdb::Row{shdb::Value{key}}, value);
        }

        ValidateBTree(*btree_index, entries);
      }
    }

    shdb::BTree::RemoveIndex(metadata.GetIndexName(), *db->GetStore());
  }
}
