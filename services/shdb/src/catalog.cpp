#include "catalog.h"

#include <algorithm>
#include <cstdint>
#include <memory>

#include "fixed.h"
#include "scan.h"
#include "schema.h"

namespace shdb {

namespace {

Schema tables_schema{{"table_name", Type::kVarchar, 64},
                     {"table_id", Type::kUint64},
                     {"column_count", Type::kUint64}};
Schema schemas_schema{{"table_id", Type::kUint64},
                      {"column_index", Type::kUint64},
                      {"column_name", Type::kVarchar, 64},
                      {"column_type", Type::kUint64},
                      {"column_length", Type::kUint64}};

const char* tables_table = "shdb_tables";
const char* schemas_table = "shdb_schemas";

}  // namespace

Catalog::Catalog(std::shared_ptr<Store> store) {
  tables_ = CreateAndOpenTable(store, tables_schema, tables_table);
  schemas_ = CreateAndOpenTable(store, schemas_schema, schemas_table);

  for (auto row : Scan(tables_)) {
    if (row.empty()) {
      continue;
    }
    tables_count_ = std::max(tables_count_, std::get<uint64_t>(row[2]));
  }
  tables_count_ += 1;
}

void Catalog::SaveTableSchema(const std::filesystem::path& name,
                              std::shared_ptr<Schema> schema) {
  size_t table_id = tables_count_;
  tables_count_ += 1;
  tables_->InsertRow({name, table_id, schema->size()});

  uint64_t index = 0;
  for (ColumnSchema column : *schema) {
    Row row({Value(table_id), Value(index), Value(column.name),
             Value(static_cast<uint64_t>(column.type)),
             Value(static_cast<uint64_t>(column.length))});
    schemas_->InsertRow(std::move(row));
    index += 1;
  }
}

std::shared_ptr<Schema> Catalog::FindTableSchema(
    const std::filesystem::path& name) {
  ssize_t table_id = -1;
  size_t columns = 0;

  for (auto table : Scan(tables_)) {
    if (table.empty()) {
      continue;
    }
    if (std::get<std::string>(table[0]) == name) {
      table_id = std::get<uint64_t>(table[1]);
      columns = std::get<uint64_t>(table[2]);
      break;
    }
  }

  if (table_id == -1) {
    return nullptr;
  }

  auto schema = std::make_shared<Schema>(columns);

  for (auto column : Scan(schemas_)) {
    if (column.empty()) {
      continue;
    }
    if (std::get<uint64_t>(column[0]) != table_id) {
      continue;
    }
    const auto column_index = std::get<uint64_t>(column[1]);
    const auto& column_name = std::get<std::string>(column[2]);
    const auto columnt_type = static_cast<Type>(std::get<uint64_t>(column[3]));
    const auto columnt_length = std::get<uint64_t>(column[4]);
    assert(column_index < schema->size());
    (*schema)[column_index] =
        ColumnSchema(column_name, columnt_type, columnt_length);
  }
  return schema;
}

void Catalog::ForgetTableSchema(const std::filesystem::path& name) {
  RowId row;
  ssize_t table_id = -1;

  auto scan = Scan(tables_);

  for (auto it = scan.begin(); it != scan.end(); ++it) {
    if (it.GetRow().empty()) {
      continue;
    }
    if (std::get<std::string>((*it)[0]) == name) {
      row = it.GetRowId();
      table_id = std::get<uint64_t>((*it)[1]);
      tables_->DeleteRow(row);
      break;
    }
  }

  if (table_id == -1) {
    return;
  }

  scan = Scan(schemas_);

  for (auto it = scan.begin(); it != scan.end(); ++it) {
    if (it.GetRow().empty()) {
      continue;
    }
    if (std::get<uint64_t>((*it)[0]) == table_id) {
      row = it.GetRowId();
      schemas_->DeleteRow(row);
    }
  }
}

std::shared_ptr<ITable> Catalog::CreateAndOpenTable(
    std::shared_ptr<Store> store, const Schema& schema,
    const std::string& table) {
  if (!store->CheckTableExists(table)) {
    store->CreateTable(table);
  }
  auto tables_provider =
      CreateFixedPageProvider(std::make_shared<Schema>(schema));
  auto res = store->OpenTable(table, tables_provider);
  return res;
}

}  // namespace shdb
