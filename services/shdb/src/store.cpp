#include "store.h"

namespace shdb {

namespace {

void ThrowTableAlreadyExistsError(const std::string& table_name) {
  throw std::runtime_error("Table with name " + table_name + " already exists");
}

}  // namespace

Store::Store(const std::filesystem::path& path, FrameIndex frame_count,
             std::shared_ptr<Statistics> statistics)
    : path_(path) {
  buffer_pool_ =
      std::make_shared<BufferPool>(std::move(statistics), frame_count);
}

void Store::CreateTable(const std::filesystem::path& table_name) {
  if (CheckTableExists(table_name)) {
    ThrowTableAlreadyExistsError(table_name);
  }

  auto file = std::make_unique<File>(path_ / table_name, /*create=*/true);
}

void Store::CreateIndexTable(const std::filesystem::path& table_name) {
  if (CheckTableExists(table_name)) {
    ThrowTableAlreadyExistsError(table_name);
  }

  auto file = std::make_unique<File>(path_ / table_name, /*create=*/true);
}

std::shared_ptr<ITable> Store::OpenTable(
    const std::filesystem::path& table_name,
    std::shared_ptr<IPageProvider> provider) {
  auto file = std::make_unique<File>(path_ / table_name, /*create=*/false);
  return shdb::CreateTable(buffer_pool_, std::move(file), std::move(provider));
}

std::shared_ptr<IIndexTable> Store::OpenIndexTable(
    const std::filesystem::path& table_name,
    std::shared_ptr<IPageProvider> provider) {
  auto file = std::make_unique<File>(path_ / table_name, /*create=*/false);
  return shdb::CreateIndexTable(buffer_pool_, std::move(file),
                                std::move(provider));
}

std::shared_ptr<ITable> Store::CreateAndOpenTable(
    const std::filesystem::path& table_name,
    std::shared_ptr<IPageProvider> provider) {
  if (CheckTableExists(table_name)) {
    ThrowTableAlreadyExistsError(table_name);
  }

  auto file = std::make_unique<File>(path_ / table_name, /*create=*/true);
  return shdb::CreateTable(buffer_pool_, std::move(file), std::move(provider));
}

std::shared_ptr<IIndexTable> Store::CreateAndOpenIndexTable(
    const std::filesystem::path& table_name,
    std::shared_ptr<IPageProvider> provider) {
  if (CheckTableExists(table_name)) {
    ThrowTableAlreadyExistsError(table_name);
  }

  auto file = std::make_unique<File>(path_ / table_name, /*create=*/true);
  return shdb::CreateIndexTable(buffer_pool_, std::move(file),
                                std::move(provider));
}

std::shared_ptr<ITable> Store::CreateOrOpenTable(
    const std::filesystem::path& table_name,
    std::shared_ptr<IPageProvider> provider) {
  if (CheckTableExists(table_name)) {
    return OpenTable(table_name, provider);
  }

  return CreateAndOpenTable(table_name, provider);
}

std::shared_ptr<IIndexTable> Store::CreateOrOpenIndexTable(
    const std::filesystem::path& table_name,
    std::shared_ptr<IPageProvider> provider) {
  if (CheckTableExists(table_name)) {
    return OpenIndexTable(table_name, provider);
  }

  return CreateAndOpenIndexTable(table_name, provider);
}

bool Store::CheckTableExists(const std::filesystem::path& table_name) {
  return std::filesystem::exists(path_ / table_name);
}

bool Store::RemoveTable(const std::filesystem::path& table_name) {
  return std::filesystem::remove(path_ / table_name);
}

bool Store::RemoveTableIfExists(const std::filesystem::path& table_name) {
  if (CheckTableExists(table_name)) {
    return RemoveTable(table_name);
  }

  return false;
}

}  // namespace shdb
