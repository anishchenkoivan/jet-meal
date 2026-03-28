#include "range_inference.h"

#include <cassert>
#include <iterator>

#include "comparator.h"
#include "row.h"

namespace shdb {

ValueBound::ValueBound(bool infinity, bool flag, ::shdb::Value value)
    : infinity(infinity), flag(flag), value(std::move(value)) {}

ValueBound ValueBound::MakeInfinity(bool plus) {
  return ValueBound(true, plus, 0);
}

ValueBound ValueBound::MakeFinite(bool flag, ::shdb::Value value) {
  return ValueBound(false, flag, std::move(value));
}

ColumnConstraint ColumnConstraint::Make(ValueBound lower, ValueBound upper) {
  return ColumnConstraint(std::move(lower), std::move(upper));
}

ColumnConstraint::ColumnConstraint(ValueBound lower, ValueBound upper)
    : lower(std::move(lower)), upper(std::move(upper)) {}

ColumnConstraint ColumnConstraint::MakeEmpty() {
  return ColumnConstraint(ValueBound::MakeInfinity(true),
                          ValueBound::MakeInfinity(false));
}

ColumnConstraint ColumnConstraint::MakeUniversal() {
  return ColumnConstraint(ValueBound::MakeInfinity(false),
                          ValueBound::MakeInfinity(true));
}

bool ColumnConstraint::IsUniversal() const {
  if (lower.infinity && upper.infinity) {
    assert(lower.flag != upper.flag);
    return !lower.flag && upper.flag;
  }
  return false;
}

bool ColumnConstraint::IsEmpty() const {
  if (lower.infinity && upper.infinity) {
    assert(lower.flag != upper.flag);
    return lower.flag && !upper.flag;
  }
  return false;
}

bool AreUndefined(const ColumnConstraints& constraints) {
  return constraints.empty();
}

ColumnConstraints MakeUndefinedConstraints() { return {}; }

std::string ToString(const ValueBound& v)
{
  std::string res;
  if (v.infinity) {
    res += v.flag ? '+' : '-';
    res += "inf";
  } else {
    res += ToString(v.value);
    res += v.flag ? '+' : '-';
  }
  return res;
}

std::string ToString(const ColumnConstraint& c)
{
  std::string res = "{";

  res += ToString(c.lower);
  res += "; ";
  res += ToString(c.upper);

  res += '}';
  return res;
}

void ValidateConstraints(const ColumnConstraints& constraints) {
  for (size_t index = 1; index < constraints.size(); ++index) {
    assert(!constraints[index - 1].upper.infinity);
    assert(!constraints[index].lower.infinity);

    assert(CompareValue(constraints[index - 1].upper.value,
                        constraints[index].lower.value) <= 0);
  }
}

ColumnConstraints InvertConstraints(const ColumnConstraints& constraints) {
  (void)constraints;
  throw std::runtime_error("Not implemented");
}

int Compare(const ValueBound& lhs, const ValueBound& rhs) {
  (void)lhs;
  (void)rhs;
  throw std::runtime_error("Not implemented");
}

ColumnConstraints IntersectConstraints(const ColumnConstraints& lhs,
                                       const ColumnConstraints& rhs) {
  ValidateConstraints(lhs);
  ValidateConstraints(rhs);

  throw std::runtime_error("Not implemented");
}

ColumnConstraints UniteConstraints(const ColumnConstraints& lhs,
                                   const ColumnConstraints& rhs) {
  ValidateConstraints(lhs);
  ValidateConstraints(rhs);

  throw std::runtime_error("Not implemented");
}

}  // namespace shdb
