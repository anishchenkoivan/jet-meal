#pragma once

#include <memory>
#include <optional>
#include <vector>

#include "marshal.h"
#include "range_inference.h"
#include "row.h"
#include "schema.h"

namespace shdb {

using IndexKey = Row;

class IndexMetadata {
 public:
  IndexMetadata(const std::string& index_name,
                std::shared_ptr<Schema> key_schema);

  const std::string& GetIndexName() const;
  const std::shared_ptr<Schema>& GetKeySchema() const;
  const std::shared_ptr<Marshal>& GetKeyMarshal() const;

  bool HasVariableKeys() const;
  size_t FixedKeySizeInBytes() const;

 private:
  std::string index_name_;
  std::shared_ptr<Schema> key_schema_;
  std::shared_ptr<Marshal> key_schema_marshal_;
};

class IIndexIterator {
 public:
  virtual ~IIndexIterator() = default;

  virtual std::optional<std::pair<IndexKey, RowId>> NextRow() = 0;
};

class IIndex {
 public:
  virtual ~IIndex() = default;

  virtual const IndexMetadata& GetMetadata() const = 0;

  // Returns true if index supports variable length keys.
  virtual bool SupportsVariableLengthKeys() = 0;

  // Returns true if index cannot contain duplicate keys.
  virtual bool IsUnique() = 0;

  // Insert index key with row id into the index.
  virtual void Insert(const IndexKey& index_key, const RowId& row_id) = 0;

  // Remove index key with row id from the index. Returns true if key existed
  // in index, false otherwise.
  virtual bool Remove(const IndexKey& index_key, const RowId& row_id) = 0;

  // Lookup index key.
  virtual std::vector<RowId> Lookup(const IndexKey& index_key) = 0;

  // Returns an iterator for full index scan.
  virtual std::unique_ptr<IIndexIterator> Read() = 0;

  // Returns an iterator for selective index scan using the provided constraint.
  virtual std::unique_ptr<IIndexIterator> Read(
      const ColumnConstraint& constraint) = 0;
};

using IndexPtr = std::shared_ptr<IIndex>;

class Database;
void RegisterIndexImplementations(Database* database);

}  // namespace shdb
