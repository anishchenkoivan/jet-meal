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
  interpreter.Execute("INSERT test_table VALUES (0, 20, \"Ann\", 1>0)");
  interpreter.Execute("INSERT test_table VALUES (1, 21, \"Bob\", 1<0)");
  interpreter.Execute("INSERT test_table VALUES (2, 19, \"Sara\", 1>0)");
  interpreter.Execute("INSERT test_table VALUES (3, 20, \"Ann\", 1>0)");
  interpreter.Execute("INSERT test_table VALUES (4, 15, \"Bob\", 1<0)");
  interpreter.Execute("INSERT test_table VALUES (5, 15, \"Bob\", 1<0)");
}

void AssertRowsEqual(const std::vector<shdb::Row>& expected,
                     const shdb::RowSet& actual) {
  ASSERT_EQ(expected.size(), actual.GetRows().size());
  for (size_t index = 0; index < expected.size(); ++index) {
    if (expected[index] != actual.GetRows()[index]) {
      asm("int $3");
      asm("int $3");
    }
    ASSERT_EQ(expected[index], actual.GetRows()[index]);
  }
}

}  // namespace

TEST(SQL, GROUPBY) {
  auto db = CreateDatabase(1);
  auto interpreter = shdb::Interpreter(db);
  Populate(interpreter);

  auto rows1 = std::vector<shdb::Row>{
      {static_cast<int64_t>(15), static_cast<int64_t>(2)},
      {static_cast<int64_t>(19), static_cast<int64_t>(1)},
      {static_cast<int64_t>(20), static_cast<int64_t>(2)},
      {static_cast<int64_t>(21), static_cast<int64_t>(1)}};

  auto result1 = interpreter.Execute(
      "SELECT age, sum(1) FROM test_table GROUP BY age ORDER BY age");
  AssertRowsEqual(rows1, result1);

  auto rows2 =
      std::vector<shdb::Row>{{std::string("Ann"), static_cast<int64_t>(40)},
                             {std::string("Bob"), static_cast<int64_t>(51)},
                             {std::string("Sara"), static_cast<int64_t>(19)}};

  auto result2 = interpreter.Execute(
      "SELECT name, sum(age) FROM test_table GROUP BY name ORDER BY name");
  AssertRowsEqual(rows2, result2);

  auto rows3 = std::vector<shdb::Row>{
      {std::string("Ann"), static_cast<int64_t>(20), static_cast<int64_t>(2)},
      {std::string("Bob"), static_cast<int64_t>(15), static_cast<int64_t>(2)},
      {std::string("Bob"), static_cast<int64_t>(21), static_cast<int64_t>(1)},
      {std::string("Sara"), static_cast<int64_t>(19), static_cast<int64_t>(1)}};

  auto result3 = interpreter.Execute(
      "SELECT name, age, sum(1) FROM test_table GROUP BY name, age ORDER BY "
      "name, age");
  AssertRowsEqual(rows3, result3);

  auto rows4 =
      std::vector<shdb::Row>{{std::string("Ann"), static_cast<int64_t>(20)},
                             {std::string("Bob"), static_cast<int64_t>(15)},
                             {std::string("Bob"), static_cast<int64_t>(21)},
                             {std::string("Sara"), static_cast<int64_t>(19)}};

  auto result4 = interpreter.Execute(
      "SELECT * FROM test_table GROUP BY name, age ORDER BY name, age");
  AssertRowsEqual(rows4, result4);

  auto rows5 = std::vector<shdb::Row>{
      {std::string("Ann"), static_cast<int64_t>(20), static_cast<int64_t>(20),
       static_cast<int64_t>(20)},
      {std::string("Bob"), static_cast<int64_t>(15), static_cast<int64_t>(21),
       static_cast<int64_t>(17)},
      {std::string("Sara"), static_cast<int64_t>(19), static_cast<int64_t>(19),
       static_cast<int64_t>(19)}};

  auto result5 = interpreter.Execute(
      "SELECT name, min(age), max(age), avg(age) FROM test_table GROUP BY name "
      "ORDER BY name");
  AssertRowsEqual(rows5, result5);

  auto rows6 = std::vector<shdb::Row>{
      {std::string("Ann"), static_cast<int64_t>(20), static_cast<int64_t>(2)},
      {std::string("Bob"), static_cast<int64_t>(21), static_cast<int64_t>(1)}};

  auto result6 = interpreter.Execute(
      "SELECT name, age, sum(1) FROM test_table WHERE age >=20 GROUP BY name, "
      "age ORDER BY name, age");
  AssertRowsEqual(rows6, result6);

  auto rows7 = std::vector<shdb::Row>{
      {std::string("Ann"), static_cast<int64_t>(20), static_cast<int64_t>(2)},
      {std::string("Bob"), static_cast<int64_t>(15), static_cast<int64_t>(2)}};

  auto result7 = interpreter.Execute(
      "SELECT name, age, sum(1) FROM test_table GROUP BY name, age HAVING "
      "sum(1) > 1 ORDER BY name, age");
  AssertRowsEqual(rows7, result7);

  auto rows8 =
      std::vector<shdb::Row>{{std::string("Bob"), static_cast<int64_t>(66)}};

  auto result8 = interpreter.Execute(
      "SELECT name, min(age) + sum(age) FROM test_table GROUP BY name HAVING "
      "max(age) - avg(age) > 0");
  AssertRowsEqual(rows8, result8);

  auto rows9 =
      std::vector<shdb::Row>{{std::string("Bob"), static_cast<int64_t>(15)},
                             {std::string("Sara"), static_cast<int64_t>(19)},
                             {std::string("Ann"), static_cast<int64_t>(20)}};

  auto result9 = interpreter.Execute(
      "SELECT name, min(age) FROM test_table GROUP BY name ORDER BY min(age)");
  AssertRowsEqual(rows9, result9);

  auto rows10 = std::vector<shdb::Row>{
      {static_cast<int64_t>(19), static_cast<int64_t>(15),
       static_cast<int64_t>(15)},
      {static_cast<int64_t>(20), static_cast<int64_t>(15),
       static_cast<int64_t>(20)},
      {static_cast<int64_t>(21), static_cast<int64_t>(19),
       static_cast<int64_t>(19)},
      {static_cast<int64_t>(22), static_cast<int64_t>(21),
       static_cast<int64_t>(21)},
      {static_cast<int64_t>(23), static_cast<int64_t>(20),
       static_cast<int64_t>(20)}};

  auto result10 = interpreter.Execute(
      "SELECT age + id, min(age), max(age) FROM test_table GROUP BY age + id "
      "ORDER BY age + id");
  AssertRowsEqual(rows10, result10);

  auto rows11 =
      std::vector<shdb::Row>{{std::string("Ann"), static_cast<int64_t>(23)},
                             {std::string("Bob"), static_cast<int64_t>(22)},
                             {std::string("Sara"), static_cast<int64_t>(21)}};

  auto result11 = interpreter.Execute(
      "SELECT name, max(age + id) FROM test_table GROUP BY name ORDER BY name");
  AssertRowsEqual(rows11, result11);
}
