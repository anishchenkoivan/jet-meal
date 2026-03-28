#include <gtest/gtest.h>

#include "db.h"
#include "interpreter.h"

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

TEST(SQL, DDL) {
  auto db = CreateDatabase(1);
  ASSERT_TRUE(db->CheckTableExists("test_table"));

  auto interpreter = shdb::Interpreter(db);
  interpreter.Execute("DROP TABLE test_table");
  ASSERT_TRUE(!db->CheckTableExists("test_table"));

  interpreter.Execute(
      "CREATE TABLE test_table (id uint64, name string, nick varchar(44), flag "
      "boolean)");
  ASSERT_TRUE(db->CheckTableExists("test_table"));

  auto schema = db->FindTableSchema("test_table");
  ASSERT_TRUE(schema);

  auto& columns = *schema;
  ASSERT_EQ(columns.size(), 4);
  ASSERT_TRUE(columns[0].name == "id" &&
              columns[0].type == shdb::Type::kUint64 && columns[0].length == 0);
  ASSERT_TRUE(columns[1].name == "name" &&
              columns[1].type == shdb::Type::kString && columns[1].length == 0);
  ASSERT_TRUE(columns[2].name == "nick" &&
              columns[2].type == shdb::Type::kVarchar &&
              columns[2].length == 44);
  ASSERT_TRUE(columns[3].name == "flag" &&
              columns[3].type == shdb::Type::kBoolean &&
              columns[3].length == 0);

  interpreter.Execute("DROP TABLE test_table");
  ASSERT_TRUE(!db->CheckTableExists("test_table"));
}
