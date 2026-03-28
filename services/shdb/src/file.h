#pragma once

#include <filesystem>

#include "page.h"

namespace shdb {

class File {
 public:
  File(const std::filesystem::path& path, bool create);

  ~File();

  int GetFd() const;

  off_t GetSize() const;

  off_t GetPageCount() const;

  void ReadPage(void* buf, PageIndex index) const;

  void WritePage(void* buf, PageIndex index) const;

  PageIndex AllocPage();

  void Sync();

 private:
  void Read(void* buf, size_t count, off_t offset) const;

  void Write(void* buf, size_t count, off_t offset) const;

  void Alloc(off_t len);

  size_t DiscoverSize() const;

  int fd_ = -1;
  off_t size_;
};

}  // namespace shdb
