#pragma once

#include "aggregate_function.h"
#include "ast.h"
#include "db.h"
#include "rowset.h"

#include <string>

namespace shdb {

class Interpreter {
public:
  explicit Interpreter(std::shared_ptr<Database> db);

  RowSet Execute(const std::string &query);

private:
  RowSet ExecuteSelect(const ASTSelectQueryPtr &select_query);
  void ExecuteInsert(const ASTInsertQueryPtr &insert_query);
  void ExecuteCreate(const ASTCreateQueryPtr &create_query);
  void ExecuteDrop(const ASTDropQueryPtr &drop_query);

  void ValidateTable(const std::string &table_name);
  void ValidateInsertSchema(const std::shared_ptr<Schema> &insert_schema,
                            const std::shared_ptr<Schema> &table_schema);

  std::shared_ptr<Database> db_;
  std::shared_ptr<AggregateFunctionFactory> aggregate_function_factory_;
};

} // namespace shdb
