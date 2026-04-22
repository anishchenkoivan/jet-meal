#pragma once

#include <string>

#include "aggregate_function.h"
#include "db.h"
#include "rowset.h"

namespace shdb {

class Interpreter {
 public:
  explicit Interpreter(std::shared_ptr<Database> db);

  RowSet Execute(const std::string& query);

 private:
  std::shared_ptr<Database> db_;
  std::shared_ptr<AggregateFunctionFactory> aggregate_function_factory_;
};

}  // namespace shdb
