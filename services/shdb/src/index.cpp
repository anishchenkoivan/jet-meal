#include "index.h"

#include <memory>

#include "btree.h"
#include "database.h"

namespace shdb {

IndexMetadata::IndexMetadata(const std::string& index_name,
                             std::shared_ptr<Schema> key_schema)
    : index_name_(index_name),
      key_schema_(std::move(key_schema)),
      key_schema_marshal_(std::make_shared<Marshal>(key_schema_)) {}

const std::string& IndexMetadata::GetIndexName() const { return index_name_; }

const std::shared_ptr<Schema>& IndexMetadata::GetKeySchema() const {
  return key_schema_;
}

const std::shared_ptr<Marshal>& IndexMetadata::GetKeyMarshal() const {
  return key_schema_marshal_;
}

bool IndexMetadata::HasVariableKeys() const {
  for (const auto& key_column : *key_schema_) {
    if (key_column.type == Type::kString) {
      return false;
    }
  }

  return true;
}

size_t IndexMetadata::FixedKeySizeInBytes() const {
  return key_schema_marshal_->GetFixedRowSpace();
}

void RegisterIndexImplementations(Database* database) {
  database->RegisterIndex(
      "btree",
      [](const IndexMetadata& metadata, Store& store) {
        return std::make_shared<BTree>(metadata, store);
      },
      [](const IndexMetadata& metadata, Store& store) {
        BTree::RemoveIndex(metadata.GetIndexName(), store);
      });
}

}  // namespace shdb
