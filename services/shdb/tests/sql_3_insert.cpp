#include <gtest/gtest.h>

#include "db.h"
#include "interpreter.h"

namespace {

auto fixed_schema = std::make_shared<shdb::Schema>(
    shdb::Schema{{"id", shdb::Type::kInt64},
                 {"name", shdb::Type::kVarchar, 1024},
                 {"age", shdb::Type::kInt64},
                 {"graduated", shdb::Type::kBoolean}});

std::shared_ptr<shdb::Database> CreateDatabase(int frame_count) {
  auto db = shdb::Connect("./mydb", frame_count);
  return db;
}

void Populate(shdb::Interpreter& interpreter) {
  interpreter.Execute("DROP TABLE test_table");
  interpreter.Execute(
      "CREATE TABLE test_table (id int64, age int64, name string, girl "
      "boolean)");
  interpreter.Execute("INSERT test_table VALUES (0, 10+10, \"Ann\", 1>0)");
  interpreter.Execute("INSERT test_table VALUES (1, 10+10+1, \"Bob\", 1<0)");
  interpreter.Execute("INSERT test_table VALUES (2, 10+9, \"Sara\", 1>0)");
  interpreter.Execute("INSERT test_table VALUES (-2, 10+9, \"Sara\", 1>0)");

  ASSERT_ANY_THROW(interpreter.Execute(
      R"(INSERT test_table VALUES ("2", 10+9, "Sara", 1>0))"));
  ASSERT_ANY_THROW(interpreter.Execute(
      R"(INSERT test_table VALUES (1>0, 10+9, "Sara", 1>0))"));
}

}  // namespace

TEST(SQL, Insert) {
  auto db = CreateDatabase(1);
  auto interpreter = shdb::Interpreter(db);
  Populate(interpreter);

  auto rows = std::vector<shdb::Row>{
      {static_cast<int64_t>(0), static_cast<int64_t>(20), std::string("Ann"),
       true},
      {static_cast<int64_t>(1), static_cast<int64_t>(21), std::string("Bob"),
       false},
      {static_cast<int64_t>(2), static_cast<int64_t>(19), std::string("Sara"),
       true},
      {static_cast<int64_t>(-2), static_cast<int64_t>(19), std::string("Sara"),
       true}};

  size_t index = 0;
  auto table = db->GetTable("test_table");
  auto scan = shdb::Scan(table);
  for (auto it = scan.begin(), end = scan.end(); it != end; ++it) {
    auto row = it.GetRow();
    if (!row.empty()) {
      ASSERT_EQ(row, rows[index]);
      ++index;
    }
  }

  ASSERT_EQ(index, rows.size());
}
