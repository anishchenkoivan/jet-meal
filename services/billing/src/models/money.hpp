#pragma once

#include <string>
#include <Poco/Types.h>

namespace billing::models {

struct Money {
  Poco::Int64 amount_minor; // Minor currency units (e.g. kopecks for RUB)
  std::string currency;     // ISO 4217 (e.g. "RUB")
};

} // namespace billing::models
