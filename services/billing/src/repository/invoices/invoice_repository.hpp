#pragma once

#include <optional>
#include <vector>

#include <Poco/UUID.h>

#include <models/invoice.hpp>
#include <repository/repository_error.hpp>

namespace billing::repository::invoices {

using Invoice       = billing::models::Invoice;
using InvoiceStatus = billing::models::InvoiceStatus;

class InvoiceRepository {
public:
    virtual ~InvoiceRepository() = default;

    virtual std::optional<Invoice> find_by_id(const Poco::UUID& id) = 0;
    virtual std::vector<Invoice>   find_by_user_id(const Poco::UUID& user_id) = 0;
    virtual std::vector<Invoice>   find_by_order_id(const Poco::UUID& order_id) = 0;
    virtual Invoice                create(const Invoice& invoice) = 0;
    virtual bool                   update_status(const Poco::UUID& id, InvoiceStatus status) = 0;
};

} // namespace billing::repository::invoices
