#pragma once

#include "aggregate_function.h"
#include "db.h"
#include "rowset.h"

#include <string>

namespace shdb {

class Interpreter {
public:
  explicit Interpreter(std::shared_ptr<Database> db);

  RowSet Execute(const std::string &query);

private:
  std::shared_ptr<Database> db_;
  std::shared_ptr<AggregateFunctionFactory> aggregate_function_factory_;
};

} // namespace shdb
