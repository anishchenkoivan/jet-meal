#include "interpreter.h"

#include <cassert>
#include <memory>
#include <stdexcept>
#include <string>

#include "accessors.h"
#include "aggregate_function.h"
#include "ast.h"
#include "ast_visitor.h"
#include "executor.h"
#include "expression.h"
#include "lexer.h"
#include "parser.hpp"
#include "row.h"
#include "rowset.h"
#include "schema.h"

namespace shdb {

namespace {

auto CreateDummyInnerExecutor() {
  Schema dummy_schema = {ColumnSchema(Type::kString)};
  auto dummy_schema_ptr = std::make_shared<Schema>(dummy_schema);
  return CreateReadFromRowsExecutor({Row{"dummy"}}, dummy_schema_ptr);
}

}  // namespace

Interpreter::Interpreter(std::shared_ptr<Database> db)
    : db_(std::move(db)),
      aggregate_function_factory_(BuildAggregateFunctionsFactory()) {}

RowSet Interpreter::Execute(const std::string& query) {
  std::cout << "Got query : `" << query << "`" << std::endl;
  std::cout << "Lexer..." << std::endl;
  Lexer lexer(query.c_str(), query.c_str() + query.size());
  ASTPtr result;
  std::string error;
  std::cout << "Initializing parser..." << std::endl;
  shdb::Parser parser(lexer, result, error);
  std::cout << "parser.parse()..." << std::endl;
  parser.parse();
  std::cout << "parser.parse() - OK" << std::endl;
  if (!result || !error.empty()) {
    throw std::runtime_error("Bad input: " + error);
  }

  std::cout << "Executing query..." << std::endl;
  switch (result->type) {
    case ASTType::kSelectQuery:
      return ExecuteSelect(std::static_pointer_cast<ASTSelectQuery>(result));
    case ASTType::kInsertQuery:
      ExecuteInsert(std::static_pointer_cast<ASTInsertQuery>(result));
      break;
    case ASTType::kCreateQuery:
      ExecuteCreate(std::static_pointer_cast<ASTCreateQuery>(result));
      break;
    case ASTType::kDropQuery:
      ExecuteDrop(std::static_pointer_cast<ASTDropQuery>(result));
      break;
    default:
      throw std::runtime_error(
          "Invalid AST. Expected SELECT, INSERT, CREATE or DROP");
  }
  std::cout << "Executing query - OK" << std::endl;

  return RowSet{};
}

RowSet Interpreter::ExecuteSelect(const ASTSelectQueryPtr& select_query_ptr) {
  ExecutorPtr inner_executor;
  if (select_query_ptr->from.empty()) {
    inner_executor = CreateDummyInnerExecutor();
  } else if (select_query_ptr->from.size() == 1) {
    assert(select_query_ptr->from.size() == 1);
    const auto& from = select_query_ptr->from.at(0);
    inner_executor = CreateReadFromTableExecutor(db_->GetTable(from),
                                                 db_->FindTableSchema(from));
  } else {
    auto from = select_query_ptr->from;
    inner_executor = CreateReadFromTableExecutor(
        db_->GetTable(from.back()), db_->FindTableSchema(from.back()));
    from.pop_back();

    while (!from.empty()) {
      auto first_executor = std::move(inner_executor);
      auto second_executor = CreateReadFromTableExecutor(
          db_->GetTable(from.back()), db_->FindTableSchema(from.back()));
      from.pop_back();
      inner_executor = CreateJoinExecutor(std::move(second_executor),
                                          std::move(first_executor));
    }
  }

  if (select_query_ptr->GetWhere()) {
    auto from_executor = std::move(inner_executor);
    auto expression = BuildExpression(
        select_query_ptr->GetWhere(),
        std::make_shared<SchemaAccessor>(from_executor->GetOutputSchema()));
    inner_executor = CreateFilterExecutor(std::move(from_executor), expression);
  }

  if (select_query_ptr->GetOrder()) {
    auto from_executor = std::move(inner_executor);

    SortExpressions sort_exprs;

    for (const auto& expr : select_query_ptr->GetOrder()->GetChildren()) {
      auto sort_expr = std::static_pointer_cast<ASTOrder>(expr);
      assert(sort_expr != nullptr);
      auto schema_accessor =
          std::make_shared<SchemaAccessor>(from_executor->GetOutputSchema());
      sort_exprs.emplace_back(
          BuildExpression(sort_expr->GetExpr(), schema_accessor),
          sort_expr->desc);
    }

    inner_executor = CreateSortExecutor(std::move(from_executor), sort_exprs);
  }

  ASTs projection;

  if (select_query_ptr->GetProjection() == nullptr) {
    for (const auto& row : *inner_executor->GetOutputSchema()) {
      projection.push_back(std::make_shared<ASTIdentifier>(row.name));
    }
  } else {
    projection = select_query_ptr->GetProjection()->GetChildren();
  }

  auto exprs = BuildExpressions(
      projection,
      std::make_shared<SchemaAccessor>(inner_executor->GetOutputSchema()));
  auto executor = CreateExpressionsExecutor(std::move(inner_executor), exprs);

  RowSet res;
  for (auto val = executor->Next(); val.has_value(); val = executor->Next()) {
    res.AddRow(val.value());
  }

  return res;
}

void Interpreter::ExecuteInsert(
    const std::shared_ptr<ASTInsertQuery>& insert_query) {
  auto inner_executor = CreateDummyInnerExecutor();
  auto exprs = BuildExpressions(
      insert_query->GetValues()->GetChildren(),
      std::make_shared<SchemaAccessor>(inner_executor->GetOutputSchema()));
  auto executor = CreateExpressionsExecutor(std::move(inner_executor), exprs);

  auto query_schema = executor->GetOutputSchema();
  auto db_schema = db_->FindTableSchema(insert_query->table);

  if (query_schema->size() != db_schema->size()) {
    throw std::runtime_error("Inserted row size mismatch");
  }

  for (size_t i = 0; i < query_schema->size(); ++i) {
    auto l = query_schema->at(i);
    auto r = db_schema->at(i);

    if (l.type != r.type) {
      throw std::runtime_error("Schema doesn't match expected");
    }
  }

  db_->GetTable(insert_query->table)->InsertRow(executor->Next().value());
}

void Interpreter::ExecuteCreate(const ASTCreateQueryPtr& create_query) {
  db_->CreateTable(create_query->table, create_query->schema);
}

void Interpreter::ExecuteDrop(const ASTDropQueryPtr& drop_query) {
  db_->DropTable(drop_query->table);
}

void Interpreter::ValidateTable(const std::string& table_name) {
  (void)table_name;
  throw std::runtime_error("ValidateTble Not implemented");
}

void Interpreter::ValidateInsertSchema(
    const std::shared_ptr<Schema>& insert_schema,
    const std::shared_ptr<Schema>& table_schema) {
  (void)insert_schema;
  (void)table_schema;
  throw std::runtime_error("Not implemented");
}

}  // namespace shdb
