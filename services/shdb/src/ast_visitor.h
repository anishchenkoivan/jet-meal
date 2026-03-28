#pragma once

#include "aggregate_function.h"
#include "ast.h"

namespace shdb {

template <typename Derived>
class ASTVisitor {
 public:
  bool NeedChildVisit(const ASTPtr& /*parent*/, const ASTPtr& /*child*/) {
    return true;
  }

  void Visit(const ASTPtr& query_tree_node) {
    GetDerived().VisitImpl(query_tree_node);
    VisitChildren(query_tree_node);
  }

 private:
  Derived& GetDerived() { return *static_cast<Derived*>(this); }

  const Derived& GetDerived() const { return *static_cast<Derived*>(this); }

  void VisitChildren(const ASTPtr& expression) {
    for (const auto& child : expression->GetChildren()) {
      if (!child) {
        continue;
      }

      bool need_visit_child = GetDerived().NeedChildVisit(expression, child);
      if (need_visit_child) {
        Visit(child);
      }
    }
  }
};

ASTs CollectAggregateFunctions(const ASTs& expressions,
                               AggregateFunctionFactory& factory);

}  // namespace shdb
