#include "bufferpool.h"

#include <algorithm>
#include <cassert>

#include "malloc.h"

namespace shdb {

FramePool::FramePool(std::shared_ptr<Statistics> statistics,
                     FrameIndex frame_count)
    : frames_(frame_count),
      cache_([=] {
        std::vector<FrameIndex> free_frames(frame_count);
        FrameIndex index = 0;
        std::generate_n(free_frames.begin(), frame_count,
                        [&] { return index++; });
        return free_frames;
      }()),
      statistics_(std::move(statistics)) {
  data_ = reinterpret_cast<uint8_t*>(pvalloc(frame_count * kPageSize));
  for (FrameIndex index = 0; index < frame_count; ++index) {
    frames_[index].data = data_ + index * kPageSize;
  }
}

FramePool::~FramePool() {
  for (auto& frame : frames_) {
    DumpFrame(frame);
  }
  free(data_);
}

void FramePool::DumpFrame(Frame& frame) {
  if (frame.file) {
    frame.file->WritePage(frame.data, frame.page_index);
    ++statistics_->page_written;
  }
}

std::pair<FrameIndex, uint8_t*> FramePool::AcquireFrame(
    std::shared_ptr<File> file, PageIndex page_index) {
  FrameIndex frame_index;
  auto key = std::make_pair(file->GetFd(), page_index);
  if (auto [found, index] = cache_.Find(key); found) {
    frame_index = index;
    assert(frames_[frame_index].page_index == page_index);
    assert(frames_[frame_index].file->GetFd() == file->GetFd());
  } else {
    frame_index = cache_.Put(key);
    auto& frame = frames_[frame_index];
    DumpFrame(frame);
    frame.file = std::move(file);
    frame.page_index = page_index;
    frame.file->ReadPage(frame.data, frame.page_index);
    ++statistics_->page_read;
  }
  ++frames_[frame_index].ref_count;
  if (frames_[frame_index].ref_count == 1) {
    cache_.Lock(key);
  }
  ++statistics_->page_accessed;
  return {frame_index, frames_[frame_index].data};
}

void FramePool::ReleaseFrame(FrameIndex frame_index) {
  auto& frame = frames_[frame_index];
  --frame.ref_count;
  if (frame.ref_count == 0) {
    cache_.Unlock(std::make_pair(frame.file->GetFd(), frame.page_index));
  }
}

Frame::Frame(std::shared_ptr<FramePool> frame_pool, FrameIndex frame_index,
             uint8_t* data)
    : frame_pool_(std::move(frame_pool)),
      frame_index_(frame_index),
      data_(data) {}

Frame::~Frame() {
  if (frame_pool_) {
    frame_pool_->ReleaseFrame(frame_index_);
  }
}

const uint8_t* Frame::GetData() const { return data_; }

uint8_t* Frame::GetData() { return data_; }

BufferPool::BufferPool(std::shared_ptr<Statistics> statistics,
                       FrameIndex frame_count)
    : frame_pool_(
          std::make_shared<FramePool>(std::move(statistics), frame_count)) {}

std::shared_ptr<Frame> BufferPool::GetPage(std::shared_ptr<File> file,
                                           PageIndex page_index) {
  auto [frame_index, data] = frame_pool_->AcquireFrame(file, page_index);
  return std::make_shared<Frame>(frame_pool_, frame_index, data);
}

}  // namespace shdb
