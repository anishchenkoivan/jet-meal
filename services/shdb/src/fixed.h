#pragma once

#include "page_provider.h"
#include "schema.h"

namespace shdb {

std::shared_ptr<IPageProvider> CreateFixedPageProvider(
    std::shared_ptr<Schema> schema);

}
