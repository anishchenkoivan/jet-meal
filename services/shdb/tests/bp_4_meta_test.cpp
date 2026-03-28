#include <gtest/gtest.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#include <iostream>
#include <sstream>

#include "db.h"

namespace {

std::vector<std::shared_ptr<shdb::Schema>> schemas = {
    std::make_shared<shdb::Schema>(shdb::Schema{
        {"id", shdb::Type::kUint64},
        {"name", shdb::Type::kVarchar, 1024},
        {"age", shdb::Type::kUint64},
        {"graduated", shdb::Type::kBoolean},
    }),
    std::make_shared<shdb::Schema>(shdb::Schema{
        {"id", shdb::Type::kUint64},
        {"name", shdb::Type::kString},
        {"number", shdb::Type::kUint64},
        {"vacant", shdb::Type::kBoolean},
    }),
};

std::shared_ptr<shdb::Database> CreateDatabase(
    int frame_count, const std::shared_ptr<shdb::Schema>& schema) {
  auto db = shdb::Connect("./mydb", frame_count);
  if (db->CheckTableExists("test_table")) {
    db->DropTable("test_table");
  }
  db->CreateTable("test_table", schema);
  return db;
}

}  // namespace

void TestMetadataPrepare(const std::shared_ptr<shdb::Schema>& schema) {
  shdb::PageIndex pool_size = 5;
  auto db = CreateDatabase(pool_size, schema);
  auto table = db->GetTable("test_table", schema);

  std::vector<std::pair<shdb::RowId, shdb::Row>> rows;
  shdb::PageIndex page_count = 0;
  uint64_t row_count = 0;

  while (row_count < 10) {
    std::stringstream stream;
    stream << "clone" << row_count;
    auto row = shdb::Row{row_count, stream.str(), 20UL + row_count % 10,
                         row_count % 10 > 5};
    auto row_id = table->InsertRow(row);
    rows.emplace_back(row_id, std::move(row));
    page_count = std::max(page_count, row_id.page_index + 1);
    ++row_count;
  }
}

void TestMetadataValidate() {
  auto db = shdb::Connect("./mydb", 1);
  auto table = db->GetTable("test_table");
  uint64_t row_count = 0;
  for (auto row : shdb::Scan(table)) {
    if (!row.empty()) {
      std::stringstream stream;
      stream << "clone" << row_count;
      auto expected = shdb::Row{row_count, stream.str(), 20UL + row_count % 10,
                                row_count % 10 > 5};
      std::cout << shdb::ToString(row) << std::endl;
      ASSERT_EQ(row, expected);
      ++row_count;
    }
  }
  ASSERT_EQ(row_count, 10);
}

TEST(BufferPool, Metadata) {
  for (size_t i = 0; i < schemas.size(); ++i) {
    std::cout << "Testing metadata with schema " << i << std::endl;
    TestMetadataPrepare(schemas[i]);
    std::cout << "Validating metadata in the same process:" << std::endl;
    TestMetadataValidate();
  }
}
