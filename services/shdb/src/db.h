#pragma once

#include <filesystem>
#include <memory>

namespace shdb {

class Database;

std::shared_ptr<Database> Connect(const std::filesystem::path& path,
                                  int frame_count);

}  // namespace shdb
