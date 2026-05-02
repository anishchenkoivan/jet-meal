#pragma once

#include <repository/balance/balance_repository.hpp>

#include <Poco/Data/SessionPool.h>

namespace billing::repository::balance {

class PgBalanceRepository : public BalanceRepository {
public:
    explicit PgBalanceRepository(Poco::Data::SessionPool& pool);

    std::optional<Balance> get(const Poco::UUID& user_id) override;
    Balance                initialize(const Poco::UUID& user_id, const std::string& currency) override;

    BalanceTransaction credit(
        const Poco::UUID& user_id, Poco::Int64 amount,
        TransactionKind kind,
        const std::optional<Poco::UUID>& reference_id = {}) override;

    BalanceTransaction debit(
        const Poco::UUID& user_id, Poco::Int64 amount,
        TransactionKind kind,
        const std::optional<Poco::UUID>& reference_id = {}) override;

    std::vector<BalanceTransaction> history(
        const Poco::UUID& user_id, int limit = 50) override;

private:
    Poco::Data::SessionPool& _pool;

    BalanceTransaction apply(
        const Poco::UUID& user_id,
        Poco::Int64 signed_delta,
        TransactionKind kind,
        const std::optional<Poco::UUID>& reference_id,
        bool check_sufficient_funds);
};

} // namespace billing::repository::balance
