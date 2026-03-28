#include <gtest/gtest.h>

#include <iostream>
#include <sstream>

#include "db.h"

namespace {

auto fixed_schema = std::make_shared<shdb::Schema>(
    shdb::Schema{{"id", shdb::Type::kUint64},
                 {"name", shdb::Type::kVarchar, 1024},
                 {"age", shdb::Type::kUint64},
                 {"graduated", shdb::Type::kBoolean}});
auto flexible_schema = std::make_shared<shdb::Schema>(
    shdb::Schema{{"id", shdb::Type::kUint64},
                 {"name", shdb::Type::kString},
                 {"age", shdb::Type::kUint64},
                 {"graduated", shdb::Type::kBoolean}});

std::shared_ptr<shdb::Database> CreateDatabase(int frame_count) {
  auto db = shdb::Connect("./mydb", frame_count);
  if (db->CheckTableExists("test_table")) {
    db->DropTable("test_table");
  }
  db->CreateTable("test_table", fixed_schema);
  return db;
}

}  // namespace

void TestDelete(std::shared_ptr<shdb::Schema> schema) {
  shdb::PageIndex pool_size = 5;
  auto db = CreateDatabase(pool_size);
  auto table = db->GetTable("test_table", schema);

  std::vector<std::pair<shdb::RowId, shdb::Row>> rows;
  shdb::PageIndex page_count = 0;
  uint64_t row_count = 0;

  while (page_count < 2 * pool_size) {
    std::stringstream stream;
    stream << "clone" << row_count;
    auto row = shdb::Row{row_count, stream.str(), 20UL + row_count % 10,
                         row_count % 10 > 5};
    auto row_id = table->InsertRow(row);
    rows.emplace_back(row_id, std::move(row));
    page_count = std::max(page_count, row_id.page_index + 1);
    ++row_count;
  }

  auto validate = [&](auto rows) {
    for (auto& [row_id, row] : rows) {
      auto found_row = table->GetRow(row_id);
      ASSERT_EQ(found_row, row);
    }

    size_t index = 0;
    auto scan = shdb::Scan(table);
    for (auto it = scan.begin(), end = scan.end(); it != end; ++it) {
      auto row = it.GetRow();
      if (!row.empty()) {
        ASSERT_EQ(row, rows[index].second);
        ASSERT_EQ(it.GetRowId(), rows[index].first);
        ++index;
      }
    }
    ASSERT_EQ(index, rows.size());
  };

  validate(rows);

  std::vector<std::pair<shdb::RowId, shdb::Row>> remained;
  for (auto& [row_id, row] : rows) {
    if (std::get<uint64_t>(row[0]) % 3 == 1) {
      auto deleted_row = table->GetRow(row_id);
      ASSERT_EQ(deleted_row, row);
      table->DeleteRow(row_id);
      deleted_row = table->GetRow(row_id);
      ASSERT_TRUE(deleted_row.empty());
    } else {
      remained.emplace_back(row_id, row);
    }
  }
  ASSERT_LE(remained.size(), rows.size() * 2 / 3 + 1);

  validate(remained);

  for (auto& [row_id, row] : rows) {
    if (std::get<uint64_t>(row[0]) % 3 == 1) {
      auto deleted_row = table->GetRow(row_id);
      ASSERT_TRUE(deleted_row.empty());
    }
  }
}

TEST(BufferPool, Delete) {
  std::cout << "Validate deletes with fixed schema" << std::endl;
  TestDelete(fixed_schema);
  std::cout << "Validate deletes with flexible schema" << std::endl;
  TestDelete(flexible_schema);
  std::cout << "Test flexible schema passed" << std::endl;
}
