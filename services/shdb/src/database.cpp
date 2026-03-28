#include "database.h"

#include <memory>

#include "fixed.h"
#include "flexible.h"

namespace shdb {

Database::Database(const std::filesystem::path& path, FrameIndex frame_count)
    : statistics_(std::make_shared<Statistics>()) {
  store_ = std::make_shared<Store>(path, frame_count, statistics_);
  catalog_ = std::make_shared<Catalog>(store_);
  RegisterIndexImplementations(this);
}

std::shared_ptr<ITable> Database::CreateTable(const std::string& name,
                                              std::shared_ptr<Schema> schema) {
  catalog_->SaveTableSchema(name, schema);
  auto provider = CreatePageProvider(std::move(schema));
  return store_->CreateAndOpenTable(name, std::move(provider));
}

std::shared_ptr<ITable> Database::GetTable(const std::string& name,
                                           std::shared_ptr<Schema> schema) {
  if (!schema) {
    schema = catalog_->FindTableSchema(name);
  }

  auto provider = CreatePageProvider(std::move(schema));
  return store_->OpenTable(name, std::move(provider));
}

bool Database::CheckTableExists(const std::string& name) {
  return store_->CheckTableExists(name);
}

void Database::DropTable(const std::string& name) {
  catalog_->ForgetTableSchema(name);
  store_->RemoveTable(name);
}

void Database::RegisterIndex(const std::string& index_type,
                             IndexCreateCallback index_create_callback,
                             IndexDropCallback index_drop_callback) {
  index_type_to_callbacks_.emplace(
      index_type, std::make_pair(std::move(index_create_callback),
                                 std::move(index_drop_callback)));
}

std::shared_ptr<IIndex> Database::CreateIndex(
    const std::string& index_name, std::shared_ptr<Schema> key_schema,
    const std::string& index_type) {
  if (key_schema->empty()) {
    throw std::runtime_error("Invalid empty index key schema");
  }

  std::shared_ptr<Schema> index_schema = std::make_shared<Schema>(*key_schema);
  index_schema->push_back(ColumnSchema{index_type, Type::kUint64, 0});
  catalog_->SaveTableSchema(index_name, index_schema);

  IndexMetadata metadata(index_name, std::move(key_schema));

  auto callbacks_it = index_type_to_callbacks_.find(index_type);
  if (callbacks_it == index_type_to_callbacks_.end()) {
    throw std::runtime_error(
        "No index implementation registered for index type " + index_type);
  }

  return callbacks_it->second.first(metadata, *store_);
}

std::shared_ptr<IIndex> Database::GetIndex(const std::string& index_name) {
  auto index_schema = catalog_->FindTableSchema(index_name);
  if (!index_schema) {
    throw std::runtime_error("No index exists with name " + index_name);
  }

  std::string index_type = index_schema->back().name;
  index_schema->pop_back();

  IndexMetadata metadata(index_name, std::move(index_schema));
  auto callbacks_it = index_type_to_callbacks_.find(index_type);
  if (callbacks_it == index_type_to_callbacks_.end()) {
    throw std::runtime_error(
        "No index implementation registered for index type " + index_type);
  }

  return callbacks_it->second.first(metadata, *store_);
}

void Database::DropIndex(const std::string& index_name) {
  auto index_schema = catalog_->FindTableSchema(index_name);
  if (!index_schema) {
    throw std::runtime_error("No index exists with name " + index_name);
  }

  catalog_->ForgetTableSchema(index_name);

  std::string index_type = index_schema->back().name;
  index_schema->pop_back();

  IndexMetadata metadata(index_name, std::move(index_schema));
  auto callbacks_it = index_type_to_callbacks_.find(index_type);
  if (callbacks_it == index_type_to_callbacks_.end()) {
    throw std::runtime_error(
        "No index implementation registered for index type " + index_type);
  }

  callbacks_it->second.second(metadata, *store_);
}

std::shared_ptr<Statistics> Database::GetStatistics() { return statistics_; }

std::shared_ptr<Schema> Database::FindTableSchema(
    const std::filesystem::path& name) {
  return catalog_->FindTableSchema(name);
}

std::shared_ptr<IPageProvider> Database::CreatePageProvider(
    std::shared_ptr<Schema> schema) {
  for (const auto& column : *schema) {
    if (column.type == Type::kString) {
      return CreateFlexiblePageProvider(std::move(schema));
    }
  }

  return CreateFixedPageProvider(std::move(schema));
}

std::shared_ptr<Database> Connect(const std::filesystem::path& path,
                                  FrameIndex frame_count) {
  if (!std::filesystem::exists(path)) {
    std::filesystem::create_directories(path);
  }

  return std::make_shared<Database>(path, frame_count);
}

}  // namespace shdb
