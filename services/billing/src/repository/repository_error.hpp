#pragma once

#include <stdexcept>

namespace billing::repository {

class RepositoryError : public std::runtime_error {
    using std::runtime_error::runtime_error;
};

} // namespace billing::repository
