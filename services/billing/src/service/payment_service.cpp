#include <service/payment_service.hpp>

#include <Poco/DateTime.h>
#include <Poco/UUIDGenerator.h>

namespace billing::service {

PaymentService::PaymentService(
    repository::invoices::InvoiceRepository& invoices,
    repository::balance::BalanceRepository& balances)
    : _invoices(invoices), _balances(balances) {}

models::Invoice PaymentService::create_invoice(
    const Poco::UUID& order_id, const Poco::UUID& user_id,
    Poco::Int64 amount_minor, const std::string& currency)
{
    if (amount_minor <= 0) {
        throw ServiceError("invoice amount must be positive");
    }

    models::Invoice invoice;
    invoice.id = Poco::UUIDGenerator::defaultGenerator().createRandom();
    invoice.order_id = order_id;
    invoice.user_id = user_id;
    invoice.amount_minor = amount_minor;
    invoice.currency = currency;
    invoice.status = models::InvoiceStatus::Pending;
    invoice.created_at = Poco::DateTime();
    invoice.updated_at = invoice.created_at;

    return _invoices.create(invoice);
}

std::optional<models::Invoice> PaymentService::get_invoice(const Poco::UUID& id) {
    return _invoices.find_by_id(id);
}

std::vector<models::Invoice> PaymentService::user_invoices(const Poco::UUID& user_id) {
    return _invoices.find_by_user_id(user_id);
}

models::Invoice PaymentService::pay_invoice(const Poco::UUID& invoice_id) {
    auto maybe_invoice = _invoices.find_by_id(invoice_id);
    if (!maybe_invoice) {
        throw InvoiceNotFoundError("invoice not found: " + invoice_id.toString());
    }

    auto invoice = *maybe_invoice;
    if (invoice.status != models::InvoiceStatus::Pending) {
        throw InvalidInvoiceStateError("invoice must be Pending to be paid");
    }

    _balances.debit(invoice.user_id, invoice.amount_minor, models::TransactionKind::Charge, invoice_id);

    try {
        _invoices.update_status(invoice_id, models::InvoiceStatus::Paid);
    } catch (...) {
        // Saga compensation: roll back the debit if the status update fails.
        try { _balances.credit(invoice.user_id, invoice.amount_minor, models::TransactionKind::Refund, invoice_id); }
        catch (...) {}
        throw;
    }

    invoice.status = models::InvoiceStatus::Paid;
    return invoice;
}

models::Invoice PaymentService::refund_invoice(const Poco::UUID& invoice_id) {
    auto maybe_invoice = _invoices.find_by_id(invoice_id);
    if (!maybe_invoice) {
        throw InvoiceNotFoundError("invoice not found: " + invoice_id.toString());
    }

    auto invoice = *maybe_invoice;
    if (invoice.status != models::InvoiceStatus::Paid) {
        throw InvalidInvoiceStateError("only Paid invoices can be refunded");
    }

    _invoices.update_status(invoice_id, models::InvoiceStatus::Refunded);

    try {
        _balances.credit(invoice.user_id, invoice.amount_minor, models::TransactionKind::Refund, invoice_id);
    } catch (...) {
        // Saga compensation: restore Paid status if the credit fails.
        try { _invoices.update_status(invoice_id, models::InvoiceStatus::Paid); }
        catch (...) {}
        throw;
    }

    invoice.status = models::InvoiceStatus::Refunded;
    return invoice;
}

models::Balance PaymentService::deposit(
    const Poco::UUID& user_id, Poco::Int64 amount, const std::string& currency)
{
    if (amount <= 0) {
        throw ServiceError("deposit amount must be positive");
    }

    _balances.initialize(user_id, currency);
    _balances.credit(user_id, amount, models::TransactionKind::Deposit);

    auto balance = _balances.get(user_id);
    if (!balance) {
        throw ServiceError("balance not found after deposit");
    }
    return *balance;
}

std::optional<models::Balance> PaymentService::get_balance(const Poco::UUID& user_id) {
    return _balances.get(user_id);
}

std::vector<models::BalanceTransaction> PaymentService::transaction_history(
    const Poco::UUID& user_id, int limit)
{
    return _balances.history(user_id, limit);
}

} // namespace billing::service
