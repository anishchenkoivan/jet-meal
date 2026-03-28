#include "ast.h"

#include <cassert>

namespace shdb {

IAST::IAST(ASTType type) : type(type) {}

std::string IAST::GetName() const { return ToString(*this); };

const ASTs& IAST::GetChildren() const { return children; }

ASTIdentifier::ASTIdentifier(std::string name)
    : IAST(ASTType::kIdentifier), name(std::move(name)) {}

ASTLiteral::ASTLiteral(std::string literal_value)
    : IAST(ASTType::kLiteral),
      literal_type(ASTLiteralType::kString),
      string_value(std::move(literal_value)) {}

ASTLiteral::ASTLiteral(int64_t literal_value)
    : IAST(ASTType::kLiteral),
      literal_type(ASTLiteralType::kNumber),
      integer_value(literal_value) {}

ASTBinaryOperator::ASTBinaryOperator(BinaryOperatorCode operator_code,
                                     ASTPtr lhs, ASTPtr rhs)
    : IAST(ASTType::kBinaryOperator), operator_code(operator_code) {
  children.resize(kChildrenSize);
  children[kLhsChildIndex] = std::move(lhs);
  children[kRhsChildIndex] = std::move(rhs);
}

const ASTPtr& ASTBinaryOperator::GetLhs() const {
  return children[kLhsChildIndex];
}

const ASTPtr& ASTBinaryOperator::GetRhs() const {
  return children[kRhsChildIndex];
}

ASTUnaryOperator::ASTUnaryOperator(UnaryOperatorCode operator_code,
                                   ASTPtr operand)
    : IAST(ASTType::kUnaryOperator), operator_code(operator_code) {
  children.resize(kChildrenSize);
  children[kOperandChildIndex] = std::move(operand);
}

const ASTPtr& ASTUnaryOperator::GetOperand() const {
  return children[kOperandChildIndex];
}

ASTList::ASTList(ASTs elements) : IAST(ASTType::kList) {
  children = std::move(elements);
}

ASTList::ASTList(ASTPtr element) : ASTList() {
  children = {std::move(element)};
}

ASTList::ASTList() : ASTList(ASTs{}) {}

void ASTList::Append(ASTPtr element) {
  children.emplace_back(std::move(element));
}

ASTFunction::ASTFunction(std::string name, ASTListPtr arguments)
    : IAST(ASTType::kFunction), name(std::move(name)) {
  children.resize(kChildrenSize);
  children[kArgumentsChildIndex] = std::move(arguments);
}

const ASTPtr& ASTFunction::GetArguments() const {
  return children[kArgumentsChildIndex];
}

const ASTList& ASTFunction::GetArgumentsList() const {
  return static_cast<const ASTList&>(*children[kArgumentsChildIndex]);
}

ASTOrder::ASTOrder(ASTPtr expr, bool desc) : IAST(ASTType::kOrder), desc(desc) {
  children.resize(kChildrenSize);
  children[kExprChildIndex] = std::move(expr);
}

const ASTPtr& ASTOrder::GetExpr() const { return children[kExprChildIndex]; }

ASTSelectQuery::ASTSelectQuery(ASTListPtr projection,
                               std::vector<std::string> from, ASTPtr where,
                               ASTListPtr group_by, ASTPtr having,
                               ASTListPtr order)
    : IAST(ASTType::kSelectQuery), from(std::move(from)) {
  children.resize(kChildrenSize);
  children[kProjectionChildIndex] = std::move(projection);
  children[kWhereChildIndex] = std::move(where);
  children[kGroupByChildIndex] = std::move(group_by);
  children[kHavingChildIndex] = std::move(having);
  children[kOrderChildIndex] = std::move(order);
}

const ASTPtr& ASTSelectQuery::GetProjection() const {
  return children[kProjectionChildIndex];
}

const ASTList& ASTSelectQuery::GetProjectionList() const {
  return static_cast<const ASTList&>(*children[kProjectionChildIndex]);
}

const ASTPtr& ASTSelectQuery::GetWhere() const {
  return children[kWhereChildIndex];
}

bool ASTSelectQuery::HasGroupBy() const {
  return !GetGroupByList().GetChildren().empty();
}

const ASTPtr& ASTSelectQuery::GetGroupBy() const {
  return children[kGroupByChildIndex];
}

const ASTList& ASTSelectQuery::GetGroupByList() const {
  return static_cast<const ASTList&>(*children[kGroupByChildIndex]);
}

const ASTPtr& ASTSelectQuery::GetHaving() const {
  return children[kHavingChildIndex];
}

const ASTPtr& ASTSelectQuery::GetOrder() const {
  return children[kOrderChildIndex];
}

ASTInsertQuery::ASTInsertQuery(std::string table, ASTListPtr values)
    : IAST(ASTType::kInsertQuery), table(std::move(table)) {
  children.resize(kChildrenSize);
  children[kValuesChildIndex] = std::move(values);
}

const ASTPtr& ASTInsertQuery::GetValues() {
  return children[kValuesChildIndex];
}

const ASTList& ASTInsertQuery::GetValuesList() {
  return static_cast<const ASTList&>(*children[kValuesChildIndex]);
}

ASTCreateQuery::ASTCreateQuery(std::string table, Schema schema)
    : IAST(ASTType::kCreateQuery),
      table(std::move(table)),
      schema(std::make_shared<Schema>(std::move(schema))) {}

ASTDropQuery::ASTDropQuery(std::string table)
    : IAST(ASTType::kDropQuery), table(std::move(table)) {}

ASTPtr NewIdentifier(std::string value) {
  return std::make_shared<ASTIdentifier>(std::move(value));
}

ASTPtr NewStringLiteral(std::string value) {
  return std::make_shared<ASTLiteral>(std::move(value));
}

ASTPtr NewNumberLiteral(int64_t value) {
  return std::make_shared<ASTLiteral>(value);
}

ASTPtr NewBinaryOperator(BinaryOperatorCode operator_code, ASTPtr lhs,
                         ASTPtr rhs) {
  return std::make_shared<ASTBinaryOperator>(operator_code, std::move(lhs),
                                             std::move(rhs));
}

ASTPtr NewUnaryOperator(UnaryOperatorCode operator_code, ASTPtr operand) {
  return std::make_shared<ASTUnaryOperator>(operator_code, std::move(operand));
}

ASTListPtr NewList() { return std::make_shared<ASTList>(); }

ASTListPtr NewList(ASTPtr element) {
  return std::make_shared<ASTList>(std::move(element));
}

ASTPtr NewFunction(std::string name, ASTListPtr args) {
  return std::make_shared<ASTFunction>(std::move(name), std::move(args));
}

ASTPtr NewOrder(ASTPtr expr, bool desc) {
  return std::make_shared<ASTOrder>(std::move(expr), desc);
}

ASTPtr NewSelectQuery(ASTListPtr list, std::vector<std::string> from,
                      ASTPtr where, ASTListPtr group_by,
                      std::shared_ptr<IAST> having, ASTListPtr order) {
  return std::make_shared<ASTSelectQuery>(std::move(list), std::move(from),
                                          std::move(where), std::move(group_by),
                                          std::move(having), std::move(order));
}

ASTPtr NewInsertQuery(std::string table, ASTListPtr values) {
  return std::make_shared<ASTInsertQuery>(std::move(table), std::move(values));
}

ASTPtr NewCreateQuery(std::string table, Schema schema) {
  return std::make_shared<ASTCreateQuery>(std::move(table), std::move(schema));
}

ASTPtr NewDropQuery(std::string table) {
  return std::make_shared<ASTDropQuery>(std::move(table));
}

std::string ToString(const IAST& ast) {
  switch (ast.type) {
    case ASTType::kIdentifier:
      return static_cast<const ASTIdentifier&>(ast).name;
    case ASTType::kLiteral: {
      const auto& literal = static_cast<const ASTLiteral&>(ast);
      switch (literal.literal_type) {
        case ASTLiteralType::kNumber:
          return std::to_string(literal.integer_value);
        case ASTLiteralType::kString:
          return std::string("\"") + literal.string_value + "\"";
      }
    }
    case ASTType::kBinaryOperator: {
      auto binary_operator = static_cast<const ASTBinaryOperator&>(ast);
      auto get_op = [&]() -> std::string {
        switch (binary_operator.operator_code) {
          case BinaryOperatorCode::kPlus:
            return "+";
          case BinaryOperatorCode::kMinus:
            return "-";
          case BinaryOperatorCode::kMul:
            return "*";
          case BinaryOperatorCode::kDiv:
            return "/";
          case BinaryOperatorCode::kLAnd:
            return "AND";
          case BinaryOperatorCode::kLOr:
            return "OR";
          case BinaryOperatorCode::kEq:
            return "=";
          case BinaryOperatorCode::kNe:
            return "<>";
          case BinaryOperatorCode::kLt:
            return "<";
          case BinaryOperatorCode::kLe:
            return "<=";
          case BinaryOperatorCode::kGt:
            return ">";
          case BinaryOperatorCode::kGe:
            return ">=";
        }

        return {};
      };
      return std::string("(") + ToString(*binary_operator.GetLhs()) + ") " +
             get_op() + " (" + ToString(*binary_operator.GetRhs()) + ")";
    }
    case ASTType::kUnaryOperator: {
      auto unary_operator = static_cast<const ASTUnaryOperator&>(ast);
      auto get_op = [&]() -> std::string {
        switch (unary_operator.operator_code) {
          case UnaryOperatorCode::kLNot:
            return "!";
          case UnaryOperatorCode::kUMinus:
            return "-";
        }

        return {};
      };
      return get_op() + " (" + ToString(*unary_operator.GetOperand()) + ")";
    }
    case ASTType::kOrder: {
      auto order = static_cast<const ASTOrder&>(ast);
      return ToString(*order.GetExpr()) + (order.desc ? " DESC" : "");
    }
    case ASTType::kList: {
      auto op = static_cast<const ASTList&>(ast);
      if (op.GetChildren().empty()) {
        return {};
      }

      std::string result = ToString(*op.GetChildren()[0]);
      for (size_t index = 1; index < op.GetChildren().size(); ++index) {
        result += ", " + ToString(*op.GetChildren()[index]);
      }
      return result;
    }
    case ASTType::kFunction: {
      auto function = static_cast<const ASTFunction&>(ast);
      return function.name + "(" + ToString(function.GetArgumentsList()) + ")";
    }
    case ASTType::kSelectQuery: {
      auto select_query = static_cast<const ASTSelectQuery&>(ast);
      std::string result = "SELECT ";

      if (select_query.GetProjectionList().GetChildren().empty()) {
        result += "*";
      } else {
        result += ToString(select_query.GetProjectionList());
      }

      if (!select_query.from.empty()) {
        result += " FROM " + select_query.from[0];
        for (size_t i = 1; i < select_query.from.size(); ++i) {
          result += ", " + select_query.from[i];
        }
      }
      if (select_query.GetWhere()) {
        result += " WHERE " + ToString(*select_query.GetWhere());
      }
      if (select_query.HasGroupBy()) {
        result += " GROUP BY " + ToString(select_query.GetGroupByList());
      }
      if (select_query.GetHaving()) {
        result += " HAVING " + ToString(*select_query.GetHaving());
      }
      if (select_query.GetOrder()) {
        result += " ORDER BY " + ToString(*select_query.GetOrder());
      }
      return result;
    }
    case ASTType::kInsertQuery: {
      auto insert_query = static_cast<const ASTInsertQuery&>(ast);
      return "INSERT " + insert_query.table + " VALUES (" +
             ToString(insert_query.GetValuesList()) + ")";
    }
    case ASTType::kCreateQuery: {
      auto create_query = static_cast<const ASTCreateQuery&>(ast);
      auto col_to_string = [&](const auto& column) {
        auto result = column.name + " ";
        switch (column.type) {
          case Type::kUint64:
            result += "UINT64";
            break;
          case Type::kInt64:
            result += "INT64";
            break;
          case Type::kBoolean:
            result += "BOOLEAN";
            break;
          case Type::kString:
            result += "STRING";
            break;
          case Type::kVarchar:
            result += "VARCHAR(" + std::to_string(column.length) + ")";
            break;
        }

        return result;
      };
      auto& schema = *create_query.schema;
      auto result = "CREATE TABLE " + create_query.table + " (" +
                    col_to_string(schema[0]);
      for (size_t index = 1; index < schema.size(); ++index) {
        result += ", " + col_to_string(schema[index]);
      }
      return result + ")";
    }
    case ASTType::kDropQuery: {
      auto drop_query = static_cast<const ASTDropQuery&>(ast);
      return "DROP TABLE " + drop_query.table;
    }
  }

  return {};
}

std::ostream& operator<<(std::ostream& stream, const IAST& ast) {
  stream << ToString(ast);
  return stream;
}

}  // namespace shdb
