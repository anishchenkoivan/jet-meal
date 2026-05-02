#pragma once

#include <optional>
#include <string>

#include <Poco/DateTime.h>
#include <Poco/Types.h>
#include <Poco/UUID.h>

namespace billing::models {

enum class TransactionKind { Deposit, Charge, Refund };

inline std::string to_string(TransactionKind k) {
    switch (k) {
    case TransactionKind::Deposit: return "deposit";
    case TransactionKind::Charge:  return "charge";
    case TransactionKind::Refund:  return "refund";
    }
    return "deposit";
}

inline TransactionKind transaction_kind_from_string(const std::string& s) {
    if (s == "charge")  return TransactionKind::Charge;
    if (s == "refund")  return TransactionKind::Refund;
    return TransactionKind::Deposit;
}

struct Balance {
    Poco::UUID     user_id;
    Poco::Int64    amount_minor;  // Minor currency units (e.g. kopecks for RUB)
    std::string    currency;      // ISO 4217 (e.g. "RUB")
    Poco::DateTime updated_at;
};

struct BalanceTransaction {
    Poco::UUID               id;
    Poco::UUID               user_id;
    Poco::Int64              amount_minor;  // Signed: positive = credit, negative = debit
    TransactionKind          kind;
    std::optional<Poco::UUID> reference_id;  // e.g. invoice id for charges/refunds
    Poco::DateTime           created_at;
};

} // namespace billing::models
