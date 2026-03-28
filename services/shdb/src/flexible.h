#pragma once

#include "page_provider.h"
#include "schema.h"

namespace shdb {

std::shared_ptr<IPageProvider> CreateFlexiblePageProvider(
    std::shared_ptr<Schema> schema);

}
