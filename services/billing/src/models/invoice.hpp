#pragma once

#include <string>

#include <Poco/DateTime.h>
#include <Poco/Types.h>
#include <Poco/UUID.h>

namespace billing::models {

enum class InvoiceStatus { Pending, Paid, Failed, Refunded };

inline std::string to_string(InvoiceStatus s) {
    switch (s) {
    case InvoiceStatus::Pending:  return "pending";
    case InvoiceStatus::Paid:     return "paid";
    case InvoiceStatus::Failed:   return "failed";
    case InvoiceStatus::Refunded: return "refunded";
    }
    return "pending";
}

inline InvoiceStatus invoice_status_from_string(const std::string& s) {
    if (s == "paid")     return InvoiceStatus::Paid;
    if (s == "failed")   return InvoiceStatus::Failed;
    if (s == "refunded") return InvoiceStatus::Refunded;
    return InvoiceStatus::Pending;
}

struct Invoice {
    Poco::UUID     id;
    Poco::UUID     order_id;
    Poco::UUID     user_id;
    Poco::Int64    amount_minor;  // Minor currency units (e.g. kopecks for RUB)
    std::string    currency;      // ISO 4217 (e.g. "RUB")
    InvoiceStatus  status;
    Poco::DateTime created_at;
    Poco::DateTime updated_at;
};

} // namespace billing::models
