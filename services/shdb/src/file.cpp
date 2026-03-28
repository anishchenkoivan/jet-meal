#include "file.h"

#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>

#include <cstdio>
#include <cstring>
#include <filesystem>
#include <functional>

namespace shdb {

namespace {

void SafeSyscall(size_t count, const std::function<ssize_t()>& call) {
  for (auto r = call(); r != static_cast<ssize_t>(count); r = call()) {
    if (r == -1 && (errno != EINTR && errno != EAGAIN)) {
      perror("Unable to perform I/O");
      throw std::runtime_error("Unable to perform I/O");
    }
  }
}

}  // namespace

File::File(const std::filesystem::path& path, bool create) {
  int flags = create ? (O_CREAT | O_EXCL) : 0;
  int mode = S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH;
  fd_ = open(path.c_str(), O_DIRECT | O_SYNC | O_RDWR | flags, mode);
  if (fd_ == -1) {
    perror("Unable to open file");
    throw std::runtime_error("Unable to open file");
  }

  size_ = DiscoverSize();
}

File::~File() {
  if (fd_ > 0) {
    close(fd_);
  }
}

int File::GetFd() const { return fd_; }

off_t File::GetSize() const { return size_; }

off_t File::GetPageCount() const {
  return (GetSize() + kPageSize - 1) / kPageSize;
}

void File::ReadPage(void* buf, PageIndex index) const {
  Read(buf, kPageSize, kPageSize * index);
}

void File::WritePage(void* buf, PageIndex index) const {
  Write(buf, kPageSize, kPageSize * index);
}

PageIndex File::AllocPage() {
  PageIndex page_index = size_ / kPageSize;
  Alloc(kPageSize);
  return page_index;
}

void File::Sync() { fdatasync(fd_); }

void File::Read(void* buf, size_t count, off_t offset) const {
  SafeSyscall(count, [=, this] { return pread(fd_, buf, count, offset); });
}

void File::Write(void* buf, size_t count, off_t offset) const {
  SafeSyscall(count, [=, this] { return pwrite(fd_, buf, count, offset); });
}

void File::Alloc(off_t len) {
  if (fallocate(fd_, FALLOC_FL_ZERO_RANGE, size_, len) == -1) {
    perror("Unable to allocate space to file");
    throw std::runtime_error("Unable to allocate space to file");
  }
  size_ += len;
}

size_t File::DiscoverSize() const {
  struct stat statbuf;
  if (fstat(fd_, &statbuf) == -1) {
    perror("Unable to get file stat");
    throw std::runtime_error("Unable to get file stat");
  }

  return statbuf.st_size;
}

}  // namespace shdb
