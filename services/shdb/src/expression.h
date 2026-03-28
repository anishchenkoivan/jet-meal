#pragma once

#include <optional>

#include "accessors.h"
#include "ast.h"
#include "range_inference.h"
#include "row.h"

namespace shdb {

class IExpression {
 public:
  virtual ~IExpression() = default;

  virtual Type GetResultType() const = 0;

  virtual Value Evaluate(const Row& input_row) const = 0;

  virtual ColumnConstraints GenerateConstraintsForColumn(
      int column_index) const;
};

using ExpressionPtr = std::shared_ptr<IExpression>;
using Expressions = std::vector<ExpressionPtr>;

ExpressionPtr BuildExpression(const ASTPtr& expression,
                              const SchemaAccessorPtr& input_schema_accessor);

Expressions BuildExpressions(const ASTs& expressions,
                             const SchemaAccessorPtr& input_schema_accessor);

}  // namespace shdb
