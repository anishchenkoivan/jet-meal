#include <gtest/gtest.h>

#include "db.h"
#include "expression.h"
#include "interpreter.h"
#include "lexer.h"

namespace {

std::shared_ptr<shdb::Database> CreateDatabase(int frame_count) {
  auto db = shdb::Connect("./mydb", frame_count);
  return db;
}

shdb::ExpressionPtr GetPredicateFromQuery(const std::string& query,
                                          const shdb::SchemaPtr& schema) {
  shdb::Lexer lexer(query.c_str(), query.c_str() + query.size());
  shdb::ASTPtr result;
  std::string error;
  shdb::Parser parser(lexer, result, error);
  parser.parse();
  if (!result || !error.empty()) {
    throw std::runtime_error("Bad input: " + error);
  }
  auto select_query_ptr =
      std::static_pointer_cast<shdb::ASTSelectQuery>(result);
  auto schema_accessor = std::make_shared<shdb::SchemaAccessor>(schema);
  return BuildExpression(select_query_ptr->GetWhere(), schema_accessor);
}

}  // namespace

TEST(RangeInference, SimpleExpressions) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kInt64}, {"value", shdb::Type::kString}});

  {
    auto predicate = GetPredicateFromQuery(
        "SELECT key, value FROM test_table WHERE key = 1", schema);
    auto constraints = predicate->GenerateConstraintsForColumn(0);

    ASSERT_EQ(constraints.size(), 1);
    const auto& constraint = constraints[0];
    EXPECT_FALSE(constraint.lower.infinity || constraint.upper.infinity);
    EXPECT_FALSE(constraint.lower.flag);
    EXPECT_TRUE(constraint.upper.flag);
    EXPECT_EQ(constraint.lower.value, shdb::Value(1));
    EXPECT_EQ(constraint.upper.value, shdb::Value(1));
  }

  for (std::string relation : {">", ">="}) {
    auto predicate = GetPredicateFromQuery(
        "SELECT key, value FROM test_table WHERE key " + relation + " 1",
        schema);
    auto constraints = predicate->GenerateConstraintsForColumn(0);

    ASSERT_EQ(constraints.size(), 1);
    const auto& constraint = constraints[0];
    EXPECT_FALSE(constraint.lower.infinity);
    EXPECT_TRUE(constraint.upper.infinity && constraint.upper.flag);
    if (relation == ">") {
      EXPECT_TRUE(constraint.lower.flag);
    } else {
      EXPECT_FALSE(constraint.lower.flag);
    }
    EXPECT_EQ(constraint.lower.value, shdb::Value(1));
  }

  for (std::string relation : {"<", "<="}) {
    auto predicate = GetPredicateFromQuery(
        "SELECT key, value FROM test_table WHERE key " + relation + " 1",
        schema);
    auto constraints = predicate->GenerateConstraintsForColumn(0);

    ASSERT_EQ(constraints.size(), 1);
    const auto& constraint = constraints[0];
    EXPECT_TRUE(constraint.lower.infinity && !constraint.lower.flag);
    EXPECT_FALSE(constraint.upper.infinity);
    if (relation == "<") {
      EXPECT_FALSE(constraint.upper.flag);
    } else {
      EXPECT_TRUE(constraint.upper.flag);
    }
    EXPECT_EQ(constraint.upper.value, shdb::Value(1));
  }

  {
    auto predicate = GetPredicateFromQuery(
        "SELECT key, value FROM test_table WHERE key <> 1", schema);
    auto constraints = predicate->GenerateConstraintsForColumn(0);

    ASSERT_EQ(constraints.size(), 2);
    EXPECT_TRUE(constraints[0].lower.infinity && !constraints[0].lower.flag);
    EXPECT_TRUE(constraints[1].upper.infinity && constraints[1].upper.flag);
    EXPECT_EQ(constraints[0].upper.value, shdb::Value(1));
    EXPECT_EQ(constraints[1].lower.value, shdb::Value(1));
    EXPECT_FALSE(constraints[0].upper.flag);
    EXPECT_TRUE(constraints[1].lower.flag);
  }
}

TEST(RangeInference, DoubleNegative) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kInt64}, {"value", shdb::Type::kString}});

  auto predicate = GetPredicateFromQuery(
      "SELECT key, value FROM test_table WHERE !(!(key = 1))", schema);
  auto constraints = predicate->GenerateConstraintsForColumn(0);

  ASSERT_EQ(constraints.size(), 1);
  const auto& constraint = constraints[0];
  EXPECT_FALSE(constraint.lower.infinity || constraint.upper.infinity);
  EXPECT_FALSE(constraint.lower.flag);
  EXPECT_TRUE(constraint.upper.flag);
  EXPECT_EQ(constraint.lower.value, shdb::Value(1));
  EXPECT_EQ(constraint.upper.value, shdb::Value(1));
}

TEST(RangeInference, IntersectionSimple) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kString}, {"value", shdb::Type::kString}});

  auto predicate = GetPredicateFromQuery(
      "SELECT key, value FROM test_table WHERE key >= \"abc\" AND key <= \"def\"",
      schema);
  auto constraints = predicate->GenerateConstraintsForColumn(0);

  ASSERT_EQ(constraints.size(), 1);
  const auto& constraint = constraints[0];
  EXPECT_FALSE(constraint.lower.infinity || constraint.upper.infinity);
  EXPECT_FALSE(constraint.lower.flag);
  EXPECT_TRUE(constraint.upper.flag);
  EXPECT_EQ(constraint.lower.value, shdb::Value("abc"));
  EXPECT_EQ(constraint.upper.value, shdb::Value("def"));
}

TEST(RangeInference, IntersectionEmpty) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kInt64}, {"value", shdb::Type::kString}});

  auto predicate = GetPredicateFromQuery(
      "SELECT key, value FROM test_table WHERE key < 0 AND key > 100", schema);
  auto constraints = predicate->GenerateConstraintsForColumn(0);

  ASSERT_EQ(constraints.size(), 1);
  EXPECT_TRUE(constraints[0].IsEmpty());
}

TEST(RangeInference, UnionSimple) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kInt64}, {"value", shdb::Type::kString}});

  auto predicate = GetPredicateFromQuery(
      "SELECT key, value FROM test_table WHERE key < 0 OR key > 100", schema);
  auto constraints = predicate->GenerateConstraintsForColumn(0);

  ASSERT_EQ(constraints.size(), 2);
  EXPECT_TRUE(constraints[0].lower.infinity && !constraints[0].lower.flag);
  EXPECT_TRUE(constraints[1].upper.infinity && constraints[1].upper.flag);
  EXPECT_EQ(constraints[0].upper.value, shdb::Value(0));
  EXPECT_EQ(constraints[1].lower.value, shdb::Value(100));
  EXPECT_FALSE(constraints[0].upper.flag);
  EXPECT_TRUE(constraints[1].lower.flag);
}

TEST(RangeInference, UnionIntersecting) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kInt64}, {"value", shdb::Type::kString}});

  auto predicate = GetPredicateFromQuery(
      "SELECT key, value FROM test_table WHERE key < 100 OR key > 0", schema);
  auto constraints = predicate->GenerateConstraintsForColumn(0);

  ASSERT_EQ(constraints.size(), 1);
  EXPECT_TRUE(constraints[0].IsUniversal());
}

TEST(RangeInference, Everything) {
  auto schema = shdb::CreateSchema(
      {{"key", shdb::Type::kInt64}, {"value", shdb::Type::kString}});

  auto predicate = GetPredicateFromQuery(
      "SELECT key, value FROM test_table WHERE (key < 100 AND (key > 33 OR key "
      "> 66)) OR (!(key > 0 AND key < 13 AND (!(key = 4))))",
      schema);
  auto constraints = predicate->GenerateConstraintsForColumn(0);

  ASSERT_EQ(constraints.size(), 3);
  EXPECT_TRUE(constraints[0].lower.infinity);
  EXPECT_FALSE(constraints[0].lower.flag);
  EXPECT_TRUE(constraints[2].upper.infinity);
  EXPECT_TRUE(constraints[2].upper.flag);

  EXPECT_EQ(constraints[0].upper.value, shdb::Value(0));
  EXPECT_EQ(constraints[1].lower.value, shdb::Value(4));
  EXPECT_EQ(constraints[1].upper.value, shdb::Value(4));
  EXPECT_EQ(constraints[2].lower.value, shdb::Value(13));

  EXPECT_TRUE(constraints[0].upper.flag);
  EXPECT_FALSE(constraints[1].lower.flag);
  EXPECT_TRUE(constraints[1].upper.flag);
  EXPECT_FALSE(constraints[2].lower.flag);
}
