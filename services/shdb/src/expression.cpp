#include "expression.h"

#include <cassert>
#include <cmath>
#include <cstdint>
#include <format>
#include <iostream>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <variant>

#include "ast.h"
#include "range_inference.h"
#include "schema.h"

namespace shdb {

namespace {

template <typename Callback>
auto CallForInteger(const Value& value, Callback callback) {
  return std::visit(Overloaded{
                        [&](const Null&) { return callback({}); },
                        [&](const uint64_t& uint64_value) {
                          return callback(static_cast<int64_t>(uint64_value));
                        },
                        [&](const int64_t& int64_value) {
                          return callback(static_cast<int64_t>(int64_value));
                        },
                        [&](const bool& bool_value) {
                          return callback(static_cast<int64_t>(bool_value));
                        },
                        [&](const std::string&) {
                          throw std::runtime_error("Invalid integer type");
                        },
                    },
                    value);
}

template <typename Callback>
auto CallForInteger(const Value& lhs_value, const Value& rhs_value,
                    Callback callback) {
  return CallForInteger(
      lhs_value, [&](std::optional<int64_t> lhs_integer_value) {
        return CallForInteger(rhs_value,
                              [&](std::optional<int64_t> rhs_integer_value) {
                                callback(lhs_integer_value, rhs_integer_value);
                              });
      });
}

class IdentifierExpression : public IExpression {
 public:
  IdentifierExpression(const std::string& identifier_name,
                       const SchemaAccessorPtr& input_schema_accessor)
      : result_type(
            input_schema_accessor->GetColumnOrThrow(identifier_name).type),
        input_row_index(
            input_schema_accessor->GetColumnIndexOrThrow(identifier_name)) {}

  Type GetResultType() const override { return result_type; }

  Value Evaluate(const Row& input_row) const override {
    return input_row[input_row_index];
  }

  const Type result_type;
  const size_t input_row_index{};
};

class ConstantExpression : public IExpression {
 public:
  explicit ConstantExpression(Value value) : value(value) {}

  Type GetResultType() const override {
    if (std::holds_alternative<std::string>(value)) {
      return Type::kString;
    }
    return Type::kInt64;
  }

  Value Evaluate(const Row&) const override { return value; }

  const Value value;
};

class BinaryOperatorExpression : public IExpression {
 public:
  BinaryOperatorExpression(BinaryOperatorCode binary_operator_code,
                           ExpressionPtr lhs_expression,
                           ExpressionPtr rhs_expression)
      : binary_operator_code_(binary_operator_code),
        lhs_expression_(std::move(lhs_expression)),
        rhs_expression_(std::move(rhs_expression)),
        lhs_type_(lhs_expression_->GetResultType()),
        rhs_type_(rhs_expression_->GetResultType()) {
    assert(lhs_type_ == rhs_type_);

    switch (binary_operator_code_) {
      case BinaryOperatorCode::kGe:
      case BinaryOperatorCode::kLe:
      case BinaryOperatorCode::kGt:
      case BinaryOperatorCode::kLt:
      case BinaryOperatorCode::kEq:
      case BinaryOperatorCode::kNe:
        result_type_ = Type::kBoolean;
        break;
      default:
        result_type_ = lhs_type_;
        break;
    }
  }

  Type GetResultType() const override { return result_type_; }

  Value Evaluate(const Row& input_row) const override {
    switch (binary_operator_code_) {
      case BinaryOperatorCode::kLAnd:
        return std::get<bool>(lhs_expression_->Evaluate(input_row)) &&
               std::get<bool>(rhs_expression_->Evaluate(input_row));
      case BinaryOperatorCode::kLOr:
        return std::get<bool>(lhs_expression_->Evaluate(input_row)) ||
               std::get<bool>(rhs_expression_->Evaluate(input_row));
      case BinaryOperatorCode::kPlus:
        switch (result_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) +
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) +
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error("Unsupported type for + operator");
        }
      case BinaryOperatorCode::kMinus:
        switch (result_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) -
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) -
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error("Unsupported type for - operator");
        }
      case BinaryOperatorCode::kMul:
        switch (result_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) *
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) *
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error("Unsupported type for * operator");
        }
      case BinaryOperatorCode::kDiv:
        switch (result_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) /
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) /
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error("Unsupported type for / operator");
        }
      case BinaryOperatorCode::kLt:
        switch (lhs_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) <
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) <
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error(std::format(
                "Unsupported operands {} and {} for < operator",
                static_cast<int>(lhs_type_), static_cast<int>(rhs_type_)));
        }
      case BinaryOperatorCode::kGt:
        switch (lhs_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) >
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) >
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error(std::format(
                "Unsupported operands {} and {} for > operator",
                static_cast<int>(lhs_type_), static_cast<int>(rhs_type_)));
        }
      case BinaryOperatorCode::kLe:
        switch (lhs_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) <=
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) <=
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error(std::format(
                "Unsupported operands {} and {} for <= operator",
                static_cast<int>(lhs_type_), static_cast<int>(rhs_type_)));
        }
      case BinaryOperatorCode::kGe:
        switch (lhs_type_) {
          case Type::kInt64:
            return std::get<int64_t>(lhs_expression_->Evaluate(input_row)) >=
                   std::get<int64_t>(rhs_expression_->Evaluate(input_row));
          case Type::kUint64:
            return std::get<uint64_t>(lhs_expression_->Evaluate(input_row)) >=
                   std::get<uint64_t>(rhs_expression_->Evaluate(input_row));
          default:
            throw std::runtime_error(std::format(
                "Unsupported operands {} and {} for >= operator",
                static_cast<int>(lhs_type_), static_cast<int>(rhs_type_)));
        }
      default:
        throw std::runtime_error("Operator not implemented");
    }
  }

  ColumnConstraints GenerateConstraintsForColumn(
      int column_index) const override {
    if (result_type_ != Type::kBoolean) {
      throw std::runtime_error(
          "Unexpected expression type in binary operator, expected boolean, "
          "got " +
          ToString(result_type_));
    }

    switch (binary_operator_code_) {
      case BinaryOperatorCode::kLAnd:
        return IntersectConstraints(
            lhs_expression_->GenerateConstraintsForColumn(column_index),
            rhs_expression_->GenerateConstraintsForColumn(column_index));
      case BinaryOperatorCode::kLOr:
        return UniteConstraints(
            lhs_expression_->GenerateConstraintsForColumn(column_index),
            rhs_expression_->GenerateConstraintsForColumn(column_index));
      default:
        break;
    }

    throw std::runtime_error("Not implemented");
  }

 private:
  const BinaryOperatorCode binary_operator_code_;
  const ExpressionPtr lhs_expression_;
  const ExpressionPtr rhs_expression_;
  const Type lhs_type_;
  const Type rhs_type_;
  Type result_type_;
};

class UnaryOperatorExpression : public IExpression {
 public:
  UnaryOperatorExpression(UnaryOperatorCode unary_operator_code,
                          ExpressionPtr expression)
      : unary_operator_code_(unary_operator_code),
        expression_(std::move(expression)),
        expression_type_(expression_->GetResultType()) {
    if (unary_operator_code_ == shdb::UnaryOperatorCode::kLNot) {
      result_type_ = Type::kBoolean;
    } else {
      result_type_ = expression_type_;
    }
  }

  Type GetResultType() const override { return result_type_; }

  Value Evaluate(const Row& input_row) const override {
    switch (unary_operator_code_) {
      case shdb::UnaryOperatorCode::kUMinus: {
        switch (expression_type_) {
          case Type::kBoolean:
            return -std::get<bool>(expression_->Evaluate(input_row));
          case Type::kInt64:
            return -std::get<int64_t>(expression_->Evaluate(input_row));
          case Type::kUint64:
            return -std::get<uint64_t>(expression_->Evaluate(input_row));
          default:
            throw std::runtime_error(
                "Unsupported expression type for - operator");
        }
      }
      case shdb::UnaryOperatorCode::kLNot: {
        switch (expression_type_) {
          case Type::kBoolean:
            return !std::get<bool>(expression_->Evaluate(input_row));
          default:
            throw std::runtime_error(
                std::format("Unsupported expression type {} for not operator",
                            static_cast<int>(expression_type_)));
        }
      }
    }
  }

  ColumnConstraints GenerateConstraintsForColumn(
      int column_index) const override {
    if (result_type_ != Type::kBoolean) {
      throw std::runtime_error(
          "Unexpected expression type in unary operator, expected boolean, "
          "got " +
          ToString(result_type_));
    }

    assert(unary_operator_code_ == UnaryOperatorCode::kLNot);

    return InvertConstraints(
        expression_->GenerateConstraintsForColumn(column_index));
  }

 private:
  const UnaryOperatorCode unary_operator_code_;
  const ExpressionPtr expression_;
  const Type expression_type_;
  Type result_type_;
};

}  // namespace

ColumnConstraints IExpression::GenerateConstraintsForColumn(
    int column_index) const {
  (void)column_index;
  return {};
}

ExpressionPtr BuildExpression(const ASTPtr& expression,
                              const SchemaAccessorPtr& input_schema_accessor) {
  assert(expression != nullptr);
  assert(input_schema_accessor != nullptr);

  switch (expression->type) {
    case shdb::ASTType::kIdentifier: {
      auto opexpr = std::static_pointer_cast<ASTIdentifier>(expression);
      return std::make_shared<IdentifierExpression>(opexpr->name,
                                                    input_schema_accessor);
    }
    case shdb::ASTType::kLiteral: {
      auto opexpr = std::static_pointer_cast<ASTLiteral>(expression);
      switch (opexpr->literal_type) {
        case shdb::ASTLiteralType::kString:
          return std::make_shared<ConstantExpression>(opexpr->string_value);
        case shdb::ASTLiteralType::kNumber:
          return std::make_shared<ConstantExpression>(opexpr->integer_value);
      }
    }
    case shdb::ASTType::kBinaryOperator: {
      auto opexpr = std::static_pointer_cast<ASTBinaryOperator>(expression);
      return std::make_shared<BinaryOperatorExpression>(
          opexpr->operator_code,
          BuildExpression(opexpr->GetLhs(), input_schema_accessor),
          BuildExpression(opexpr->GetRhs(), input_schema_accessor));
    }
    case shdb::ASTType::kUnaryOperator: {
      auto opexpr = std::static_pointer_cast<ASTUnaryOperator>(expression);
      return std::make_shared<UnaryOperatorExpression>(
          opexpr->operator_code,
          BuildExpression(opexpr->GetOperand(), input_schema_accessor));
    }
    default:
      throw std::runtime_error(std::format("ASTType is not expression {}",
                                           static_cast<int>(expression->type)));
  }
}

Expressions BuildExpressions(const ASTs& expressions,
                             const SchemaAccessorPtr& input_schema_accessor) {
  Expressions exprs;

  for (auto exp : expressions) {
    exprs.push_back(BuildExpression(exp, input_schema_accessor));
  }

  return exprs;
}

}  // namespace shdb
