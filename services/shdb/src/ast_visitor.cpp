#include "ast_visitor.h"

#include <stdexcept>
#include <unordered_set>

namespace shdb {

namespace {

class CollectAggregateFunctionsVisitor
    : public ASTVisitor<CollectAggregateFunctionsVisitor> {
 public:
  explicit CollectAggregateFunctionsVisitor(AggregateFunctionFactory& factory)
      : factory(factory) {}

  void VisitImpl(const ASTPtr& node) {
    (void)(node);
    throw std::runtime_error("Not implemented");
  }

  AggregateFunctionFactory& factory;
};

}  // namespace

ASTs CollectAggregateFunctions(const ASTs& expressions,
                               AggregateFunctionFactory& factory) {
  (void)(expressions);
  (void)(factory);
  throw std::runtime_error("Not implemented");
}

}  // namespace shdb
