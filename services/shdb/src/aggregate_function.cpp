#include "aggregate_function.h"

#include <cstdint>
#include <cstring>
#include <limits>
#include <memory>
#include <stdexcept>

#include "schema.h"

namespace shdb {

namespace detail {

class Min : public IAggregateFunction {
 public:
  size_t GetStateSize() override {
    throw std::runtime_error("Not implemented");
  }

  void Init(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  void Update(StatePtr state, Row arguments) override {
    (void)state;
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }

  void Merge(StatePtr self, StatePtr incoming) override {
    (void)self;
    (void)incoming;
    throw std::runtime_error("Not implemented");
  }

  Value Finalize(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  Type GetResultType() override {
    throw std::runtime_error("Not implemented");
  }

  static AggregateFunctionPtr Build(const Types& arguments) {
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }
};

class Max : public IAggregateFunction {
 public:
  size_t GetStateSize() override {
    throw std::runtime_error("Not implemented");
  }

  void Init(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  void Update(StatePtr state, Row arguments) override {
    (void)state;
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }

  void Merge(StatePtr self, StatePtr incoming) override {
    (void)self;
    (void)incoming;
    throw std::runtime_error("Not implemented");
  }

  Value Finalize(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  Type GetResultType() override {
    throw std::runtime_error("Not implemented");
  }

  static AggregateFunctionPtr Build(const Types& arguments) {
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }
};

class Sum : public IAggregateFunction {
 public:
  size_t GetStateSize() override {
    throw std::runtime_error("Not implemented");
  }

  void Init(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  void Update(StatePtr state, Row arguments) override {
    (void)state;
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }

  void Merge(StatePtr self, StatePtr incoming) override {
    (void)self;
    (void)incoming;
    throw std::runtime_error("Not implemented");
  }

  Value Finalize(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  Type GetResultType() override {
    throw std::runtime_error("Not implemented");
  }

  static AggregateFunctionPtr Build(const Types& arguments) {
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }
};

class Avg : public IAggregateFunction {
 public:
  size_t GetStateSize() override {
    throw std::runtime_error("Not implemented");
  }

  void Init(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  void Update(StatePtr state, Row arguments) override {
    (void)state;
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }

  void Merge(StatePtr self, StatePtr incoming) override {
    (void)self;
    (void)incoming;
    throw std::runtime_error("Not implemented");
  }

  Value Finalize(StatePtr state) override {
    (void)state;
    throw std::runtime_error("Not implemented");
  }

  Type GetResultType() override {
    throw std::runtime_error("Not implemented");
  }

  static AggregateFunctionPtr Build(const Types& arguments) {
    (void)arguments;
    throw std::runtime_error("Not implemented");
  }
};

}  // namespace detail

void AggregateFunctionFactory::Register(std::string name,
                                        AggregateFunctionBuilder builder) {
  registry_[name] = std::move(builder);
}

AggregateFunctionPtr AggregateFunctionFactory::Create(const std::string& name,
                                                      const Types& arguments) {
  return registry_.at(name)(arguments);
}

std::shared_ptr<AggregateFunctionFactory> BuildAggregateFunctionsFactory() {
  auto result = std::make_shared<AggregateFunctionFactory>();

  result->Register("min", detail::Min::Build);
  result->Register("max", detail::Max::Build);
  result->Register("sum", detail::Sum::Build);
  result->Register("avg", detail::Avg::Build);

  return result;
}

}  // namespace shdb
