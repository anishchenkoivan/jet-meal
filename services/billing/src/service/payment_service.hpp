#pragma once

#include <optional>
#include <stdexcept>
#include <vector>

#include <Poco/Types.h>
#include <Poco/UUID.h>

#include <models/balance.hpp>
#include <models/invoice.hpp>
#include <repository/balance/balance_repository.hpp>
#include <repository/invoices/invoice_repository.hpp>

namespace billing::service {

class ServiceError : public std::runtime_error {
    using std::runtime_error::runtime_error;
};

class InvoiceNotFoundError : public ServiceError {
    using ServiceError::ServiceError;
};

class InvalidInvoiceStateError : public ServiceError {
    using ServiceError::ServiceError;
};

class PaymentService {
public:
    PaymentService(
        repository::invoices::InvoiceRepository& invoices,
        repository::balance::BalanceRepository&  balances);

    models::Invoice create_invoice(
        const Poco::UUID& order_id,
        const Poco::UUID& user_id,
        Poco::Int64 amount_minor,
        const std::string& currency);

    std::optional<models::Invoice> get_invoice(const Poco::UUID& id);
    std::vector<models::Invoice>   user_invoices(const Poco::UUID& user_id);

    models::Invoice pay_invoice(const Poco::UUID& invoice_id);
    models::Invoice refund_invoice(const Poco::UUID& invoice_id);

    models::Balance deposit(
        const Poco::UUID& user_id, Poco::Int64 amount, const std::string& currency);

    std::optional<models::Balance> get_balance(const Poco::UUID& user_id);

    std::vector<models::BalanceTransaction> transaction_history(
        const Poco::UUID& user_id, int limit = 50);

private:
    repository::invoices::InvoiceRepository& _invoices;
    repository::balance::BalanceRepository&  _balances;
};

} // namespace billing::service
