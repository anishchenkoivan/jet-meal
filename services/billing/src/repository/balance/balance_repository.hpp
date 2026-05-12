#pragma once

#include <optional>
#include <stdexcept>
#include <vector>

#include <Poco/UUID.h>

#include <models/balance.hpp>
#include <repository/repository_error.hpp>

namespace billing::repository::balance {

using Balance            = billing::models::Balance;
using BalanceTransaction = billing::models::BalanceTransaction;
using TransactionKind    = billing::models::TransactionKind;

class InsufficientFundsError : public std::runtime_error {
    using std::runtime_error::runtime_error;
};

class BalanceRepository {
public:
    virtual ~BalanceRepository() = default;

    virtual std::optional<Balance> get(const Poco::UUID& user_id) = 0;

    virtual Balance initialize(const Poco::UUID& user_id, const std::string& currency) = 0;

    virtual BalanceTransaction credit(
        const Poco::UUID& user_id,
        Poco::Int64 amount,
        TransactionKind kind,
        const std::optional<Poco::UUID>& reference_id = {}) = 0;

    virtual BalanceTransaction debit(
        const Poco::UUID& user_id,
        Poco::Int64 amount,
        TransactionKind kind,
        const std::optional<Poco::UUID>& reference_id = {}) = 0;

    virtual std::vector<BalanceTransaction> history(
        const Poco::UUID& user_id, int limit = 50) = 0;
};

} // namespace billing::repository::balance
