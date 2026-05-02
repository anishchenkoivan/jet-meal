#pragma once

#include <repository/invoices/invoice_repository.hpp>

#include <Poco/Data/SessionPool.h>

namespace billing::repository::invoices {

class PgInvoiceRepository : public InvoiceRepository {
public:
    explicit PgInvoiceRepository(Poco::Data::SessionPool& pool);

    std::optional<Invoice> find_by_id(const Poco::UUID& id) override;
    std::vector<Invoice>   find_by_user_id(const Poco::UUID& user_id) override;
    std::vector<Invoice>   find_by_order_id(const Poco::UUID& order_id) override;
    Invoice                create(const Invoice& invoice) override;
    bool                   update_status(const Poco::UUID& id, InvoiceStatus status) override;

private:
    Poco::Data::SessionPool& _pool;

    static Invoice make_invoice(
        const std::string& id,       const std::string& order_id,
        const std::string& user_id,  Poco::Int64 amount_minor,
        const std::string& currency, const std::string& status_str,
        const Poco::DateTime& created_at, const Poco::DateTime& updated_at);
};

} // namespace billing::repository::invoices
