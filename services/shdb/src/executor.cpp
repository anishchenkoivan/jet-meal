#include "executor.h"

#include <algorithm>
#include <cassert>
#include <cstddef>
#include <iostream>
#include <memory>
#include <stdexcept>
#include <unordered_map>
#include <vector>

#include "comparator.h"
#include "expression.h"
#include "scan.h"
#include "schema.h"

namespace shdb {

namespace {

class ReadFromRowsExecutor : public IExecutor {
 public:
  ReadFromRowsExecutor(Rows rows, std::shared_ptr<Schema> rows_schema)
      : rows_(std::move(rows)), rows_schema_(std::move(rows_schema)) {}

  std::optional<Row> Next() override {
    if (read_index_ == rows_.size()) {
      return std::nullopt;
    }

    return rows_[read_index_++];
  }

  std::shared_ptr<Schema> GetOutputSchema() override { return rows_schema_; }

 private:
  Rows rows_;
  std::shared_ptr<Schema> rows_schema_;
  size_t read_index_ = 0;
};

class ReadFromTableExecutor : public IExecutor {
 public:
  ReadFromTableExecutor(std::shared_ptr<ITable> table,
                        std::shared_ptr<Schema> table_schema)
      : scan_(table),
        table_schema_(std::move(table_schema)),
        end_(scan_.end()) {}

  std::optional<Row> Next() override {
    if (!read_iterator_.has_value()) {
      read_iterator_ = scan_.begin();
    }

    if (read_iterator_ == end_) {
      return std::nullopt;
    }

    auto res = read_iterator_;
    ++read_iterator_.value();
    return *res.value();
  }

  std::shared_ptr<Schema> GetOutputSchema() override { return table_schema_; }

 private:
  Scan scan_;
  std::shared_ptr<Schema> table_schema_;
  std::optional<ScanIterator> read_iterator_;
  ScanIterator end_;
};

class ExpressionsExecutor : public IExecutor {
 public:
  ExpressionsExecutor(ExecutorPtr input_executor, Expressions expressions)
      : input_executor_(std::move(input_executor)),
        expressions_(std::move(expressions)),
        input_schema_(input_executor_->GetOutputSchema()),
        expressions_schema_(std::make_shared<Schema>()) {
    for (auto exp : expressions_) {
      expressions_schema_->push_back(exp->GetResultType());
    }
  }

  std::optional<Row> Next() override {
    auto input = input_executor_->Next();

    if (!input.has_value()) {
      return std::nullopt;
    }

    Row res;

    for (auto exp : expressions_) {
      res.push_back(exp->Evaluate(input.value()));
    }

    return res;
  }

  std::shared_ptr<Schema> GetOutputSchema() override {
    return expressions_schema_;
  }

 private:
  ExecutorPtr input_executor_;
  Expressions expressions_;
  std::shared_ptr<Schema> input_schema_;
  std::shared_ptr<Schema> expressions_schema_;
};

class FilterExecutor : public IExecutor {
 public:
  FilterExecutor(ExecutorPtr input_executor, ExpressionPtr filter_expression)
      : input_executor_(std::move(input_executor)),
        filter_expression_(std::move(filter_expression)) {
    assert(input_executor_ != nullptr);
    assert(filter_expression_ != nullptr);

    if (filter_expression_->GetResultType() != Type::kBoolean) {
      throw std::runtime_error("Filter expression has non-boolean type");
    }
  }

  std::optional<Row> Next() override {
    auto res = input_executor_->Next();

    if (!res.has_value()) {
      return std::nullopt;
    }

    auto filter_res = filter_expression_->Evaluate(res.value());

    if (std::get<bool>(filter_res)) {
      return res;
    }

    return Next();
  }

  std::shared_ptr<Schema> GetOutputSchema() override {
    return input_executor_->GetOutputSchema();
  }

 private:
  ExecutorPtr input_executor_;
  ExpressionPtr filter_expression_;
};

class SortExecutor : public IExecutor {
 public:
  SortExecutor(ExecutorPtr input_executor, SortExpressions sort_expressions)
      : input_executor_(std::move(input_executor)),
        sort_expressions_(std::move(sort_expressions)) {
    for (auto row = input_executor_->Next(); row.has_value();
         row = input_executor_->Next()) {
      rows_.push_back(row.value());
      indexes_.push_back(indexes_.size());
    }

    std::sort(indexes_.begin(), indexes_.end(),
              [this](size_t left, size_t right) -> bool {
                for (const auto& expr : sort_expressions_) {
                  auto left_key = expr.expression->Evaluate(rows_[left]);
                  auto right_key = expr.expression->Evaluate(rows_[right]);
                  if (left_key != right_key) {
                    bool res = CompareValue(left_key, right_key) >= 0;
                    return expr.desc ? res : !res;
                  }
                }
                return left < right;
              });
  }

  std::optional<Row> Next() override {
    if (read_index_ == rows_.size()) {
      return std::nullopt;
    }

    return rows_[indexes_[read_index_++]];
  }

  std::shared_ptr<Schema> GetOutputSchema() override {
    return input_executor_->GetOutputSchema();
  }

 private:
  ExecutorPtr input_executor_;
  SortExpressions sort_expressions_;
  std::vector<Row> rows_;
  std::vector<size_t> indexes_;
  size_t read_index_ = 0;
};

class JoinExecutor : public IExecutor {
 public:
  JoinExecutor(ExecutorPtr left_input_executor,
               ExecutorPtr right_input_executor)
      : left_input_executor_(std::move(left_input_executor)),
        right_input_executor_(std::move(right_input_executor)),
        left_schema_(left_input_executor_->GetOutputSchema()),
        right_schema_(right_input_executor_->GetOutputSchema()),
        output_schema_(
            std::make_shared<Schema>(*left_input_executor_->GetOutputSchema())),
        join_schema_(std::make_shared<Schema>()) {
    std::vector<size_t> left_join_indexes;
    std::vector<size_t> right_join_indexes;

    for (const auto& column : *right_schema_) {
      if (std::find(output_schema_->begin(), output_schema_->end(), column) ==
          output_schema_->end()) {
        output_schema_->push_back(column);
      } else {
        size_t left_idx =
            std::find(left_schema_->begin(), left_schema_->end(), column) -
            left_schema_->begin();
        size_t right_idx =
            std::find(right_schema_->begin(), right_schema_->end(), column) -
            right_schema_->begin();
        join_schema_->push_back(column);
        left_join_indexes.push_back(left_idx);
        right_join_indexes.push_back(right_idx);

        assert(left_idx < left_join_indexes.size());
        assert(right_idx < right_join_indexes.size());
      }
    }

    std::vector<Row> left;

    assert(join_schema_->size() == left_join_indexes.size());
    assert(join_schema_->size() == right_join_indexes.size());

    for (auto row = left_input_executor_->Next(); row.has_value();
         row = left_input_executor_->Next()) {
      left.push_back(row.value());
    }

    for (auto right_row_opt = right_input_executor_->Next();
         right_row_opt.has_value();
         right_row_opt = right_input_executor_->Next()) {
      for (const auto& left_row : left) {
        const auto& right_row = right_row_opt.value();

        bool join = true;
        for (size_t i = 0; i < join_schema_->size(); ++i) {
          if (left_row[left_join_indexes[i]] !=
              right_row[right_join_indexes[i]]) {
            join = false;
            break;
          }
        }

        if (!join) {
          continue;
        }

        Row res;

        for (size_t i = 0; i < left_schema_->size(); ++i) {
          assert(left_row.size() == left_schema_->size());
          res.push_back(left_row[i]);
        }
        for (size_t i = 0; i < right_schema_->size(); ++i) {
          if (std::find(right_join_indexes.begin(), right_join_indexes.end(),
                        i) != right_join_indexes.end()) {
            continue;
          }
          assert(right_row.size() == right_schema_->size());
          res.push_back(right_row[i]);
        }

        res_.push_back(res);
      }
    }
  }

  std::optional<Row> Next() override {
    if (read_index_ == res_.size()) {
      return std::nullopt;
    }
    return res_[read_index_++];
  }

  std::shared_ptr<Schema> GetOutputSchema() override { return output_schema_; }

 private:
  ExecutorPtr left_input_executor_;
  ExecutorPtr right_input_executor_;

  std::shared_ptr<Schema> left_schema_;
  std::shared_ptr<Schema> right_schema_;
  std::shared_ptr<Schema> output_schema_;
  std::shared_ptr<Schema> join_schema_;

  std::vector<Row> res_;
  size_t read_index_ = 0;
};

class GroupByExecutor : public IExecutor {
 public:
  GroupByExecutor(ExecutorPtr input_executor, GroupByKeys group_by_keys,
                  GroupByExpressions group_by_expressions)
      : input_executor_(std::move(input_executor)),
        input_schema_accessor_(std::make_shared<SchemaAccessor>(
            input_executor_->GetOutputSchema())),
        group_by_keys_(std::move(group_by_keys)),
        group_by_expressions_(std::move(group_by_expressions)),
        output_schema_(std::make_shared<Schema>()) {
    std::vector<size_t> key_indexes;
    for (const auto& key : group_by_keys_) {
      const size_t i = input_schema_accessor_->GetColumnIndexOrThrow(
          key.expression_column_name);
      key_indexes.push_back(i);
    }

    for (auto row = input_executor_->Next(); row.has_value();
         row = input_executor->Next()) {
      Row key;

      for (size_t i : key_indexes) {
        auto key_item =
            group_by_keys_[i].expression->Evaluate({row.value()[i]});
        key.push_back(std::move(key_item));
      }

      if (res_.contains(key)) {
      } else {
        res_[key] = row.value();
      }
    }
  }

  std::optional<Row> Next() override {
    if (iter_ == res_.end()) {
      return std::nullopt;
    }
    return (*iter_++).second;
  }

  std::shared_ptr<Schema> GetOutputSchema() override { return output_schema_; }

 private:
  ExecutorPtr input_executor_;
  SchemaAccessorPtr input_schema_accessor_;
  GroupByKeys group_by_keys_;
  GroupByExpressions group_by_expressions_;
  std::shared_ptr<Schema> output_schema_;

  std::unordered_map<Row, Row> res_;
  std::unordered_map<Row, Row>::iterator iter_;
};

}  // namespace

ExecutorPtr CreateReadFromRowsExecutor(Rows rows,
                                       std::shared_ptr<Schema> rows_schema) {
  return std::make_unique<ReadFromRowsExecutor>(rows, rows_schema);
}

ExecutorPtr CreateReadFromTableExecutor(std::shared_ptr<ITable> table,
                                        std::shared_ptr<Schema> table_schema) {
  return std::make_unique<ReadFromTableExecutor>(table, table_schema);
}

ExecutorPtr CreateExpressionsExecutor(ExecutorPtr input_executor,
                                      Expressions expressions) {
  return std::make_unique<ExpressionsExecutor>(std::move(input_executor),
                                               expressions);
}

ExecutorPtr CreateFilterExecutor(ExecutorPtr input_executor,
                                 ExpressionPtr filter_expression) {
  return std::make_unique<FilterExecutor>(std::move(input_executor),
                                          filter_expression);
}

ExecutorPtr CreateSortExecutor(ExecutorPtr input_executor,
                               SortExpressions sort_expressions) {
  return std::make_unique<SortExecutor>(std::move(input_executor),
                                        sort_expressions);
}

ExecutorPtr CreateJoinExecutor(ExecutorPtr left_input_executor,
                               ExecutorPtr right_input_executor) {
  return std::make_unique<JoinExecutor>(std::move(left_input_executor),
                                        std::move(right_input_executor));
}

ExecutorPtr CreateGroupByExecutor(ExecutorPtr input_executor,
                                  GroupByKeys group_by_keys,
                                  GroupByExpressions group_by_expressions) {
  return std::make_unique<GroupByExecutor>(std::move(input_executor),
                                           group_by_keys, group_by_expressions);
}

RowSet Execute(ExecutorPtr executor) {
  RowSet res(executor->GetOutputSchema());

  for (std::optional<Row> row; row.has_value(); row = executor->Next()) {
    res.AddRow(row.value());
  }

  return res;
}

}  // namespace shdb
