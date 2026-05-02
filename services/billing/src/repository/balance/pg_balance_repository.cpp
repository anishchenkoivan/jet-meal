#include <repository/balance/pg_balance_repository.hpp>

#include <Poco/Data/Session.h>
#include <Poco/Data/Statement.h>
#include <Poco/Exception.h>
#include <Poco/Nullable.h>
#include <Poco/UUID.h>
#include <Poco/UUIDGenerator.h>

namespace kw = Poco::Data::Keywords;

namespace billing::repository::balance {

PgBalanceRepository::PgBalanceRepository(Poco::Data::SessionPool& pool)
    : _pool(pool) {}

std::optional<Balance> PgBalanceRepository::get(const Poco::UUID& user_id) {
    auto session = _pool.get();

    std::string user_id_str = user_id.toString();
    Poco::Int64 amount_minor = 0;
    std::string currency;
    Poco::DateTime updated_at;

    Poco::Data::Statement stmt(session);
    stmt << "SELECT amount_minor, currency, updated_at "
            "FROM balances WHERE user_id = $1",
        kw::bind(user_id_str),
        kw::into(amount_minor), kw::into(currency), kw::into(updated_at),
        kw::limit(1);

    try {
        if (stmt.execute() == 0) {
            return std::nullopt;
        }
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    Balance balance;
    balance.user_id.parse(user_id_str);
    balance.amount_minor = amount_minor;
    balance.currency = currency;
    balance.updated_at = updated_at;
    return balance;
}

Balance PgBalanceRepository::initialize(const Poco::UUID& user_id, const std::string& currency) {
    auto session = _pool.get();

    std::string user_id_str = user_id.toString();
    Poco::Int64 amount_minor = 0;
    Poco::DateTime updated_at;

    try {
        Poco::Data::Statement stmt(session);
        stmt << "INSERT INTO balances (user_id, amount_minor, currency, updated_at) "
                "VALUES ($1, 0, $2, NOW()) "
                "ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id "
                "RETURNING amount_minor, updated_at",
            kw::bind(user_id_str), kw::bind(currency),
            kw::into(amount_minor), kw::into(updated_at),
            kw::limit(1);
        stmt.execute();
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    Balance balance;
    balance.user_id.parse(user_id_str);
    balance.amount_minor = amount_minor;
    balance.currency = currency;
    balance.updated_at = updated_at;
    return balance;
}

BalanceTransaction PgBalanceRepository::credit(
    const Poco::UUID& user_id, Poco::Int64 amount,
    TransactionKind kind, const std::optional<Poco::UUID>& reference_id)
{
    return apply(user_id, +amount, kind, reference_id, false);
}

BalanceTransaction PgBalanceRepository::debit(
    const Poco::UUID& user_id, Poco::Int64 amount,
    TransactionKind kind, const std::optional<Poco::UUID>& reference_id)
{
    return apply(user_id, -amount, kind, reference_id, true);
}

BalanceTransaction PgBalanceRepository::apply(
    const Poco::UUID& user_id,
    Poco::Int64 signed_delta,
    TransactionKind kind,
    const std::optional<Poco::UUID>& reference_id,
    bool check_sufficient_funds)
{
    auto session = _pool.get();

    std::string user_id_str = user_id.toString();
    std::string kind_str = models::to_string(kind);
    Poco::UUID tx_id = Poco::UUIDGenerator::defaultGenerator().createRandom();
    std::string tx_id_str = tx_id.toString();

    Poco::Nullable<std::string> ref_str;
    if (reference_id.has_value()) {
        ref_str = reference_id->toString();
    }

    Poco::DateTime created_at;

    try {
        session.begin();

        if (check_sufficient_funds) {
            Poco::Int64 debit_amount = -signed_delta;
            Poco::Data::Statement stmt(session);
            stmt << "UPDATE balances "
                    "SET amount_minor = amount_minor - $1, updated_at = NOW() "
                    "WHERE user_id = $2 AND amount_minor >= $1",
                kw::bind(debit_amount), kw::bind(user_id_str);

            if (stmt.execute() == 0) {
                session.rollback();
                throw InsufficientFundsError(
                    "insufficient balance for user " + user_id_str);
            }
        } else {
            session << "INSERT INTO balances (user_id, amount_minor, currency, updated_at) "
                       "VALUES ($1, $2, 'RUB', NOW()) "
                       "ON CONFLICT (user_id) DO UPDATE "
                       "SET amount_minor = balances.amount_minor + EXCLUDED.amount_minor, "
                       "    updated_at = NOW()",
                kw::bind(user_id_str), kw::bind(signed_delta),
                kw::now;
        }

        Poco::Data::Statement insert(session);
        insert << "INSERT INTO balance_transactions "
                  "(id, user_id, amount_minor, kind, reference_id, created_at) "
                  "VALUES ($1, $2, $3, $4, $5, NOW()) "
                  "RETURNING created_at",
            kw::bind(tx_id_str), kw::bind(user_id_str), kw::bind(signed_delta),
            kw::bind(kind_str), kw::bind(ref_str),
            kw::into(created_at),
            kw::limit(1);
        insert.execute();

        session.commit();
    } catch (const InsufficientFundsError&) {
        throw;
    } catch (const Poco::Exception& e) {
        session.rollback();
        throw RepositoryError(e.message());
    }

    BalanceTransaction transaction;
    transaction.id.parse(tx_id_str);
    transaction.user_id.parse(user_id_str);
    transaction.amount_minor = signed_delta;
    transaction.kind = kind;
    transaction.created_at = created_at;
    if (reference_id.has_value()) {
        transaction.reference_id = reference_id;
    }
    return transaction;
}

std::vector<BalanceTransaction> PgBalanceRepository::history(
    const Poco::UUID& user_id, int limit)
{
    auto session = _pool.get();

    std::string user_id_str = user_id.toString();
    std::vector<std::string> ids, user_ids, kinds;
    std::vector<Poco::Int64> amounts;
    std::vector<Poco::Nullable<std::string>> ref_ids;
    std::vector<Poco::DateTime> created_ats;

    try {
        session << "SELECT id, user_id, amount_minor, kind, reference_id, created_at "
                   "FROM balance_transactions "
                   "WHERE user_id = $1 "
                   "ORDER BY created_at DESC "
                   "LIMIT $2",
            kw::bind(user_id_str), kw::bind(limit),
            kw::into(ids), kw::into(user_ids), kw::into(amounts), kw::into(kinds),
            kw::into(ref_ids), kw::into(created_ats),
            kw::now;
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    std::vector<BalanceTransaction> result;
    result.reserve(ids.size());
    for (std::size_t i = 0; i < ids.size(); ++i) {
        BalanceTransaction transaction;
        transaction.id.parse(ids[i]);
        transaction.user_id.parse(user_ids[i]);
        transaction.amount_minor = amounts[i];
        transaction.kind = models::transaction_kind_from_string(kinds[i]);
        transaction.created_at = created_ats[i];
        if (!ref_ids[i].isNull()) {
            Poco::UUID reference_uuid;
            reference_uuid.parse(ref_ids[i].value());
            transaction.reference_id = reference_uuid;
        }
        result.push_back(std::move(transaction));
    }
    return result;
}

} // namespace billing::repository::balance
