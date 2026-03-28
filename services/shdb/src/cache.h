#pragma once

#include <cassert>
#include <exception>
#include <optional>
#include <stdexcept>
#include <unordered_map>
#include <vector>

namespace shdb {

template <class Key, class Value>
class ClockCache {
 public:
  explicit ClockCache(std::vector<Value> free_values)
      : free_values_(std::move(free_values)),
        locked_(free_values_.size()),
        ref_bit_(free_values_.size()),
        clock_init_(0) {
  }

  std::pair<bool, Value> Find(const Key& key) {
    if (!map_.contains(key)) {
      return std::make_pair(false, Value{});
    }
    size_t idx = map_[key];
    return std::make_pair(true, free_values_[idx]);
  }

  Value Put(const Key& key) {
    if (map_.contains(key)) {
      return free_values_[map_[key]];
    }

    for (size_t i = 0; i < free_values_.size() * 2 + 1; ++i) {
      clock_init_ = (clock_init_ + 1) % free_values_.size();
      if (locked_[clock_init_]) {
        continue;
      }
      if (ref_bit_[clock_init_]) {
        ref_bit_[clock_init_] = false;
        continue;
      }

      if (reverse_map_.contains(clock_init_)) {
        map_.erase(reverse_map_[clock_init_]);
      }
      map_[key] = clock_init_;
      ref_bit_[clock_init_] = true;
      reverse_map_[clock_init_] = key;
      return free_values_[clock_init_];
    }
    throw std::runtime_error("No available slot in ClockCache");
  }

  void Lock(const Key& key) {
    if (!map_.contains(key)) {
      throw std::out_of_range("No such key");
    }
    size_t idx = map_[key];
    locked_[idx] = true;
    ref_bit_[idx] = true;
  }

  void Unlock(const Key& key) {
    if (!map_.contains(key)) {
      throw std::out_of_range("No such key");
    }
    size_t idx = map_[key];
    locked_[idx] = false;
    ref_bit_[idx] = true;
  }

 private:
  std::vector<Value> free_values_;
  std::vector<bool> locked_;
  std::vector<bool> ref_bit_;
  std::unordered_map<Key, size_t> map_;
  std::unordered_map<size_t, Key> reverse_map_;
  int clock_init_;
};

}  // namespace shdb
