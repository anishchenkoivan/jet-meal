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

std::shared_ptr<shdb::Database> CreateDatabase(int frame_count) {
  auto db = shdb::Connect("./mydb", frame_count);
  if (db->CheckTableExists("test_table")) {
    db->DropTable("test_table");
  }
  db->CreateTable("test_table", fixed_schema);
  return db;
}

}  // namespace

TEST(BufferPool, Scan) {
  shdb::PageIndex pool_size = 5;
  auto db = CreateDatabase(pool_size);
  auto table = db->GetTable("test_table", fixed_schema);

  std::vector<std::pair<shdb::RowId, shdb::Row>> rows;
  shdb::PageIndex page_count = 0;
  uint64_t row_count = 0;

  while (page_count < 2 * pool_size) {
    std::stringstream stream;
    stream << "clone" << row_count;
    auto row = shdb::Row{row_count, stream.str(), 20UL + row_count % 10,
                         row_count % 10 > 5};
    auto row_id = table->InsertRow(row);
    std::cout << "inserted " << shdb::ToString(row) << " page index "
              << row_id.page_index << " row index " << row_id.row_index
              << std::endl;
    rows.emplace_back(row_id, std::move(row));
    page_count = std::max(page_count, row_id.page_index + 1);
    ++row_count;
  }

  std::cout << "Reading rows:" << std::endl;
  size_t index = 0;
  for (auto row : shdb::Scan(table)) {
    if (!row.empty()) {
      std::cout << shdb::ToString(row) << std::endl;
      ASSERT_EQ(row, rows[index].second);
      ++index;
    }
  }
  ASSERT_EQ(index, rows.size());

  index = 0;
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

  std::cout << "Test scan passed" << std::endl;
}
