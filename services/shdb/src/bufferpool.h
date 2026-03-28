#pragma once

#include <memory>

#include "cache.h"
#include "file.h"
#include "page.h"
#include "statistics.h"

namespace shdb {

using FrameIndex = int;

class FramePool {
 public:
  FramePool(std::shared_ptr<Statistics> statistics, FrameIndex frame_count);

  ~FramePool();

  FramePool(const FramePool& other) = delete;

  std::pair<FrameIndex, uint8_t*> AcquireFrame(std::shared_ptr<File> file,
                                               PageIndex page_index);

  void ReleaseFrame(FrameIndex frame_index);

 private:
  struct Frame {
    uint8_t* data = nullptr;
    std::shared_ptr<File> file;
    PageIndex page_index = 0;
    size_t ref_count = 0;
  };

  void DumpFrame(Frame& frame);

  uint8_t* data_;
  std::vector<Frame> frames_;
  ClockCache<PageId, FrameIndex> cache_;
  std::shared_ptr<Statistics> statistics_;
};

class Frame {
 public:
  Frame(std::shared_ptr<FramePool> frame_pool, FrameIndex frame_index,
        uint8_t* data);

  Frame(const Frame& other) = delete;

  ~Frame();

  const uint8_t* GetData() const;

  uint8_t* GetData();

 private:
  std::shared_ptr<FramePool> frame_pool_;
  size_t frame_index_;
  uint8_t* data_;
};

class BufferPool {
 public:
  BufferPool(std::shared_ptr<Statistics> statistics, FrameIndex frame_count);

  std::shared_ptr<Frame> GetPage(std::shared_ptr<File> file,
                                 PageIndex page_index);

 private:
  friend class Frame;
  std::shared_ptr<FramePool> frame_pool_;
};

}  // namespace shdb
