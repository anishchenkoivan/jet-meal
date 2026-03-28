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
  auto schema = shdb::CreateSchema({{"id", shdb::Type::kUint64}});

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

  std::sort(entries.begin(), entries.end(), [](auto& lhs, auto& rhs) {
    return shdb::CompareRows(lhs.first, rhs.first) < 0;
  });

  {
    std::vector<std::pair<shdb::Row, shdb::RowId>> sorted_entries;

    auto iterator = btree_index->Read();
    while (auto value = iterator->NextRow()) {
      const auto& [key, row_id] = *value;
      sorted_entries.emplace_back(key, row_id);
    }

    ASSERT_EQ(sorted_entries, entries);

    sorted_entries.clear();
  }

  {
    std::vector<std::pair<shdb::Row, shdb::RowId>> sorted_entries;

    size_t lookup_key_index = insert_keys_size / 2;
    const auto& lookup_entry = entries[lookup_key_index];
    std::vector<std::pair<shdb::Row, shdb::RowId>> expected_entries = {
        lookup_entry};

    auto constraint = shdb::ColumnConstraint::Make(
        shdb::ValueBound::MakeFinite(false, lookup_entry.first[0]),
        shdb::ValueBound::MakeFinite(true, lookup_entry.first[0]));
    auto iterator = btree_index->Read(constraint);

    while (auto value = iterator->NextRow()) {
      const auto& [key, row_id] = *value;
      sorted_entries.emplace_back(key, row_id);
    }

    ASSERT_EQ(sorted_entries, expected_entries);
  }

  {
    std::vector<std::pair<shdb::Row, shdb::RowId>> sorted_entries;

    size_t less_than_entry_index = insert_keys_size / 2;
    const auto& less_than_entry = entries[less_than_entry_index];

    std::vector<std::pair<shdb::Row, shdb::RowId>> expected_entries(
        entries.begin(), entries.begin() + less_than_entry_index);

    auto constraint = shdb::ColumnConstraint::Make(
        shdb::ValueBound::MakeInfinity(false),
        shdb::ValueBound::MakeFinite(false, less_than_entry.first[0]));
    auto iterator = btree_index->Read(constraint);

    while (auto value = iterator->NextRow()) {
      const auto& [key, row_id] = *value;
      sorted_entries.emplace_back(key, row_id);
    }

    ASSERT_EQ(sorted_entries, expected_entries);
  }

  {
    std::vector<std::pair<shdb::Row, shdb::RowId>> sorted_entries;

    size_t greater_than_entry_index = insert_keys_size / 2;
    const auto& greater_than_entry = entries[greater_than_entry_index];

    size_t less_than_entry_index =
        (insert_keys_size / 2) + (insert_keys_size / 4);
    const auto& less_than_entry = entries[less_than_entry_index];

    std::vector<std::pair<shdb::Row, shdb::RowId>> expected_entries(
        entries.begin() + greater_than_entry_index + 1,
        entries.begin() + less_than_entry_index);

    auto constraint = shdb::ColumnConstraint::Make(
        shdb::ValueBound::MakeFinite(true, greater_than_entry.first[0]),
        shdb::ValueBound::MakeFinite(false, less_than_entry.first[0]));
    auto iterator = btree_index->Read(constraint);

    while (auto value = iterator->NextRow()) {
      const auto& [key, row_id] = *value;
      sorted_entries.emplace_back(key, row_id);
    }

    ASSERT_EQ(sorted_entries, expected_entries);
  }

  shdb::BTree::RemoveIndex(metadata.GetIndexName(), *db->GetStore());
}

TEST(BTree, BTreeScanSimpleKey) {
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
