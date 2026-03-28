#include <gtest/gtest.h>

#include "db.h"
#include "interpreter.h"

TEST(SQL, Expression) {
  auto interpreter = shdb::Interpreter(nullptr);

  auto check = [&](const std::string& query, const shdb::Row& expected) {
    auto result = interpreter.Execute(query);
    ASSERT_EQ(result.GetRows().size(), 1);
    ASSERT_EQ(result.GetRows()[0], expected);
  };

  check("SELECT 11", {static_cast<int64_t>(11)});
  check("SELECT 5 - 10", {static_cast<int64_t>(-5)});
  check("SELECT 11+11", {static_cast<int64_t>(22)});
  check("SELECT 2*2", {static_cast<int64_t>(4)});
  check("SELECT 1 > 0", {true});
  check("SELECT not (1 > 0)", {false});
  check("SELECT (-1 < 0) or (1 > 2)", {true});
  check("SELECT (-1 < 0) and (1 > 2)", {false});
  check("SELECT (50-30)*2 <= 1*2*3*4", {false});
  check("SELECT \"Hi\"", {std::string("Hi")});
  check(
      R"(SELECT "Mike", "Bob", 1+2, 1>0)",
      {std::string("Mike"), std::string("Bob"), static_cast<int64_t>(3), true});
}
