#pragma once

#include <optional>

#include "aggregate_function.h"
#include "expression.h"
#include "rowset.h"
#include "table.h"

namespace shdb {

class IExecutor {
 public:
  virtual ~IExecutor() = default;

  virtual std::optional<Row> Next() = 0;

  virtual std::shared_ptr<Schema> GetOutputSchema() = 0;
};

using ExecutorPtr = std::unique_ptr<IExecutor>;

ExecutorPtr CreateReadFromRowsExecutor(Rows rows,
                                       std::shared_ptr<Schema> rows_schema);

ExecutorPtr CreateReadFromTableExecutor(std::shared_ptr<ITable> table,
                                        std::shared_ptr<Schema> table_schema);

ExecutorPtr CreateExpressionsExecutor(ExecutorPtr input_executor,
                                      Expressions expressions);

ExecutorPtr CreateFilterExecutor(ExecutorPtr input_executor,
                                 ExpressionPtr filter_expression);

struct SortExpression {
  ExpressionPtr expression;
  bool desc = false;
};

using SortExpressions = std::vector<SortExpression>;

ExecutorPtr CreateSortExecutor(ExecutorPtr input_executor,
                               SortExpressions sort_expressions);

ExecutorPtr CreateJoinExecutor(ExecutorPtr left_input_executor,
                               ExecutorPtr right_input_executor);

struct GroupByExpression {
  AggregateFunctionPtr aggregate_function;
  Expressions arguments;
  std::string aggregate_function_column_name;
};

using GroupByExpressions = std::vector<GroupByExpression>;

struct GroupByKey {
  ExpressionPtr expression;
  std::string expression_column_name;
};

using GroupByKeys = std::vector<GroupByKey>;

ExecutorPtr CreateGroupByExecutor(ExecutorPtr input_executor,
                                  GroupByKeys group_by_keys,
                                  GroupByExpressions group_by_expressions);

RowSet Execute(ExecutorPtr executor);

}  // namespace shdb
