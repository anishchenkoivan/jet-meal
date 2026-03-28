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
  if (db->CheckTableExists("test_table")) {
    db->DropTable("test_table");
  }
  db->CreateTable("test_table", fixed_schema);
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
}

}  // namespace

TEST(SQL, Select) {
  auto db = CreateDatabase(1);
  auto interpreter = shdb::Interpreter(db);
  Populate(interpreter);

  auto check = [&](const std::vector<shdb::Row>& rows,
                   const shdb::RowSet& rowset) {
    ASSERT_EQ(rows.size(), rowset.GetRows().size());

    for (size_t index = 0; index < rows.size(); ++index) {
      ASSERT_EQ(rows[index], rowset.GetRows()[index]);
    }
  };

  auto rows1 =
      std::vector<shdb::Row>{{static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true}};
  auto result1 = interpreter.Execute("SELECT * FROM test_table");
  check(rows1, result1);

  auto rows2 =
      std::vector<shdb::Row>{{static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true}};
  auto result2 =
      interpreter.Execute("SELECT * FROM test_table WHERE age <= 20");
  check(rows2, result2);

  auto rows3 = std::vector<shdb::Row>{
      {static_cast<int64_t>(1), std::string("Ann"), true},
      {static_cast<int64_t>(2), std::string("Bob"), true},
      {static_cast<int64_t>(3), std::string("Sara"), false}};
  auto result3 =
      interpreter.Execute("SELECT id+1, name, id < 2 FROM test_table");
  check(rows3, result3);

  auto rows4 =
      std::vector<shdb::Row>{{std::string("Bob"), static_cast<int64_t>(2)},
                             {std::string("Sara"), static_cast<int64_t>(4)}};
  auto result4 =
      interpreter.Execute("SELECT name, id*2 FROM test_table WHERE id > 0");
  check(rows4, result4);
}
