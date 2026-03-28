#pragma once

#include <memory>

#include "row.h"
#include "schema.h"

namespace shdb {

class IAggregateFunction {
 public:
  virtual ~IAggregateFunction() = default;

  // Type alias for row data aggregate state pointer.
  // Allows each aggregate function to define its own state structure.
  using StatePtr = void*;

  virtual size_t GetStateSize() = 0;

  virtual Type GetResultType() = 0;

  virtual void Init(StatePtr state) = 0;

  virtual void Update(StatePtr state, Row arguments) = 0;

  // Merges two aggregate states together.
  // Saves the result state into self state ptr.
  virtual void Merge(StatePtr self, StatePtr incoming) = 0;

  virtual Value Finalize(StatePtr state) = 0;
};

using AggregateFunctionPtr = std::shared_ptr<IAggregateFunction>;

using AggregateFunctionBuilder =
    std::function<AggregateFunctionPtr(const Types& arguments)>;

class AggregateFunctionFactory {
 public:
  void Register(std::string name, AggregateFunctionBuilder builder);

  AggregateFunctionPtr Create(const std::string& name, const Types& arguments);

 private:
  std::unordered_map<std::string, AggregateFunctionBuilder> registry_;
};

std::shared_ptr<AggregateFunctionFactory> BuildAggregateFunctionsFactory();

}  // namespace shdb
