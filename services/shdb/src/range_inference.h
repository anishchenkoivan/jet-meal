#pragma once

#include <vector>

#include "row.h"

namespace shdb {

class ValueBound {
 public:
  // -infinity for lower bounds, +infinity for upper bounds.
  // If a bound is infinity, `value` holds no meaning.
  const bool infinity;

  // Bounds are located between values.
  // Flag denotes whether the bound is before the value or after it.
  // For upper bound flag === Included.
  // For lower bound flag === !Included.
  // For infinity flag determines the sign, flag === +.
  const bool flag;
  const Value value;

  static ValueBound MakeInfinity(bool flag);
  static ValueBound MakeFinite(bool flag, ::shdb::Value value);

 private:
  ValueBound(bool infinity, bool flag, ::shdb::Value value);
};

class ColumnConstraint {
 public:
  const ValueBound lower;
  const ValueBound upper;

  bool IsUniversal() const;
  bool IsEmpty() const;

  static ColumnConstraint Make(ValueBound lower, ValueBound upper);
  static ColumnConstraint MakeUniversal();
  static ColumnConstraint MakeEmpty();

 private:
  ColumnConstraint(ValueBound lower, ValueBound upper);
};

// Should not overlap and should be sorted.
using ColumnConstraints = std::vector<ColumnConstraint>;

bool AreUndefined(const ColumnConstraints& constraints);
ColumnConstraints MakeUndefinedConstraints();

ColumnConstraints InvertConstraints(const ColumnConstraints& constraints);
ColumnConstraints IntersectConstraints(const ColumnConstraints& lhs,
                                       const ColumnConstraints& rhs);
ColumnConstraints UniteConstraints(const ColumnConstraints& lhs,
                                   const ColumnConstraints& rhs);

}  // namespace shdb
