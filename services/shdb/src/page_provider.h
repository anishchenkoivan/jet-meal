#pragma once

#include <memory>

namespace shdb {

class IPage;
class Frame;

class IPageProvider {
 public:
  virtual ~IPageProvider() = default;

  virtual std::shared_ptr<IPage> GetPage(std::shared_ptr<Frame> frame) = 0;
};

}  // namespace shdb
