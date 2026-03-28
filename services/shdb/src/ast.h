#pragma once

#include <memory>
#include <string>
#include <vector>

#include "schema.h"

namespace shdb {

enum class ASTType {
  kIdentifier = 0,
  kLiteral,
  kBinaryOperator,
  kUnaryOperator,
  kList,
  kFunction,
  kOrder,
  kSelectQuery,
  kInsertQuery,
  kCreateQuery,
  kDropQuery,
};

class IAST;
using ASTPtr = std::shared_ptr<IAST>;
using ASTs = std::vector<ASTPtr>;

std::string ToString(const IAST& ast);

class IAST {
 public:
  explicit IAST(ASTType type);

  virtual ~IAST() = default;

  std::string GetName() const;

  const ASTs& GetChildren() const;

  const ASTType type;

 protected:
  ASTs children;
};

class ASTIdentifier : public IAST {
 public:
  explicit ASTIdentifier(std::string name);

  const std::string name;
};

enum class ASTLiteralType {
  kNumber,
  kString,
};

class ASTLiteral : public IAST {
 public:
  explicit ASTLiteral(std::string literal_value);

  explicit ASTLiteral(int64_t literal_value);

  const ASTLiteralType literal_type;
  const int64_t integer_value{};
  const std::string string_value{};
};

enum class BinaryOperatorCode {
  kPlus = 0,
  kMinus,
  kMul,
  kDiv,
  kEq,
  kNe,
  kLt,
  kLe,
  kGt,
  kGe,
  kLAnd,
  kLOr,
};

class ASTBinaryOperator : public IAST {
 public:
  ASTBinaryOperator(BinaryOperatorCode operator_code, ASTPtr lhs, ASTPtr rhs);

  const ASTPtr& GetLhs() const;

  const ASTPtr& GetRhs() const;

  const BinaryOperatorCode operator_code;

 private:
  static constexpr size_t kLhsChildIndex = 0;
  static constexpr size_t kRhsChildIndex = 1;
  static constexpr size_t kChildrenSize = kRhsChildIndex + 1;
};

enum class UnaryOperatorCode {
  kLNot = 0,
  kUMinus,
};

class ASTUnaryOperator : public IAST {
 public:
  ASTUnaryOperator(UnaryOperatorCode operator_code, ASTPtr operand);

  const ASTPtr& GetOperand() const;

  const UnaryOperatorCode operator_code;

 private:
  static constexpr size_t kOperandChildIndex = 0;
  static constexpr size_t kChildrenSize = kOperandChildIndex + 1;
};

class ASTList : public IAST {
 public:
  explicit ASTList(ASTs elements);

  explicit ASTList(ASTPtr element);

  ASTList();

  void Append(ASTPtr element);
};

using ASTListPtr = std::shared_ptr<ASTList>;

class ASTFunction : public IAST {
 public:
  ASTFunction(std::string name, ASTListPtr arguments);

  const ASTPtr& GetArguments() const;

  const ASTList& GetArgumentsList() const;

  const std::string name;

 private:
  static constexpr size_t kArgumentsChildIndex = 0;
  static constexpr size_t kChildrenSize = kArgumentsChildIndex + 1;
};

class ASTOrder : public IAST {
 public:
  ASTOrder(ASTPtr expr, bool desc);

  const ASTPtr& GetExpr() const;

  const bool desc = false;

 private:
  static constexpr size_t kExprChildIndex = 0;
  static constexpr size_t kChildrenSize = kExprChildIndex + 1;
};

class ASTSelectQuery : public IAST {
 public:
  ASTSelectQuery(ASTListPtr projection, std::vector<std::string> from = {},
                 ASTPtr where = nullptr, ASTListPtr group_by = nullptr,
                 ASTPtr having = nullptr, ASTListPtr order = nullptr);

  const ASTPtr& GetProjection() const;

  const ASTList& GetProjectionList() const;

  const ASTPtr& GetWhere() const;

  bool HasGroupBy() const;

  const ASTPtr& GetGroupBy() const;

  const ASTList& GetGroupByList() const;

  const ASTPtr& GetHaving() const;

  const ASTPtr& GetOrder() const;

  const std::vector<std::string> from;

 private:
  static constexpr size_t kProjectionChildIndex = 0;
  static constexpr size_t kWhereChildIndex = 1;
  static constexpr size_t kGroupByChildIndex = 2;
  static constexpr size_t kHavingChildIndex = 3;
  static constexpr size_t kOrderChildIndex = 4;
  static constexpr size_t kChildrenSize = kOrderChildIndex + 1;
};

using ASTSelectQueryPtr = std::shared_ptr<ASTSelectQuery>;

class ASTInsertQuery : public IAST {
 public:
  ASTInsertQuery(std::string table, ASTListPtr values);

  const ASTPtr& GetValues();

  const ASTList& GetValuesList();

  const std::string table;

 private:
  static constexpr size_t kValuesChildIndex = 0;
  static constexpr size_t kChildrenSize = kValuesChildIndex + 1;
};

using ASTInsertQueryPtr = std::shared_ptr<ASTInsertQuery>;

class ASTCreateQuery : public IAST {
 public:
  ASTCreateQuery(std::string table, Schema schema);

  const std::string table;
  const std::shared_ptr<Schema> schema;
};

using ASTCreateQueryPtr = std::shared_ptr<ASTCreateQuery>;

class ASTDropQuery : public IAST {
 public:
  explicit ASTDropQuery(std::string table);

  const std::string table;
};

using ASTDropQueryPtr = std::shared_ptr<ASTDropQuery>;

ASTPtr NewIdentifier(std::string value);

ASTPtr NewStringLiteral(std::string value);

ASTPtr NewNumberLiteral(int64_t value);

ASTPtr NewBinaryOperator(BinaryOperatorCode operator_code, ASTPtr lhs,
                         ASTPtr rhs);

ASTPtr NewUnaryOperator(UnaryOperatorCode operator_code, ASTPtr operand);

ASTListPtr NewList();

ASTListPtr NewList(ASTPtr element);

ASTPtr NewFunction(std::string name, ASTListPtr args);

ASTPtr NewOrder(ASTPtr expr, bool desc);

ASTPtr NewSelectQuery(ASTListPtr list, std::vector<std::string> from,
                      ASTPtr where, ASTListPtr group_by, ASTPtr having,
                      ASTListPtr order);

ASTPtr NewInsertQuery(std::string table, ASTListPtr values);

ASTPtr NewCreateQuery(std::string table, Schema schema);

ASTPtr NewDropQuery(std::string table);

std::string ToString(const IAST& ast);

std::ostream& operator<<(std::ostream& stream, const IAST& ast);

}  // namespace shdb
