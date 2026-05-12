#pragma once

#include <optional>
#include <string>

#include "money.hpp"

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
    Poco::DateTime updated_at;
    Money          money;
};

struct BalanceTransaction {
    Poco::UUID                id;
    Poco::UUID                user_id;
    TransactionKind           kind;
    std::optional<Poco::UUID> reference_id;  // e.g. invoice id for charges/refunds
    Poco::DateTime            created_at;
    Money                     money;
};

} // namespace billing::models
