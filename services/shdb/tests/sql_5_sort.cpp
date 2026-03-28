#include <gtest/gtest.h>

#include "db.h"
#include "interpreter.h"

namespace {

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
}

void AssertRowsEqual(const std::vector<shdb::Row>& rows,
                     const shdb::RowSet& rowset) {
  ASSERT_EQ(rows.size(), rowset.GetRows().size());
  for (size_t index = 0; index < rows.size(); ++index) {
    ASSERT_EQ(rows[index], rowset.GetRows()[index]);
  }
}

}  // namespace

TEST(SQL, Sort) {
  auto db = CreateDatabase(1);
  auto interpreter = shdb::Interpreter(db);
  Populate(interpreter);

  auto rows1 =
      std::vector<shdb::Row>{{static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true},
                             {static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false}};

  auto result1 = interpreter.Execute("SELECT * FROM test_table ORDER BY age");
  AssertRowsEqual(rows1, result1);

  auto rows2 =
      std::vector<shdb::Row>{{static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true}};

  auto result2 =
      interpreter.Execute("SELECT * FROM test_table ORDER BY age DESC");
  AssertRowsEqual(rows2, result2);

  auto rows3 =
      std::vector<shdb::Row>{{static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true}};

  auto result3 = interpreter.Execute("SELECT * FROM test_table ORDER BY name");
  AssertRowsEqual(rows3, result3);

  auto rows4 =
      std::vector<shdb::Row>{{static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true}};

  auto result4 =
      interpreter.Execute("SELECT * FROM test_table ORDER BY name DESC");
  AssertRowsEqual(rows4, result4);

  auto rows5 =
      std::vector<shdb::Row>{{static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true}};

  auto result5 =
      interpreter.Execute("SELECT * FROM test_table ORDER BY name, age");
  AssertRowsEqual(rows5, result5);

  auto rows6 =
      std::vector<shdb::Row>{{static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true}};

  auto result6 =
      interpreter.Execute("SELECT * FROM test_table ORDER BY name DESC, age");
  AssertRowsEqual(rows6, result6);

  auto rows7 =
      std::vector<shdb::Row>{{static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true}};

  auto result7 =
      interpreter.Execute("SELECT * FROM test_table ORDER BY name, age DESC");
  AssertRowsEqual(rows7, result7);

  auto rows8 =
      std::vector<shdb::Row>{{static_cast<int64_t>(2), static_cast<int64_t>(19),
                              std::string("Sara"), true},
                             {static_cast<int64_t>(1), static_cast<int64_t>(21),
                              std::string("Bob"), false},
                             {static_cast<int64_t>(0), static_cast<int64_t>(20),
                              std::string("Ann"), true}};

  auto result8 =
      interpreter.Execute("SELECT * FROM test_table ORDER BY age - id * 2");
  AssertRowsEqual(rows8, result8);
}
