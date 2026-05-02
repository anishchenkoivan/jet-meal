#include <service/payment_service.hpp>

#include <Poco/DateTime.h>
#include <Poco/UUIDGenerator.h>

namespace billing::service {

PaymentService::PaymentService(
    repository::invoices::InvoiceRepository& invoices,
    repository::balance::BalanceRepository&  balances)
    : _invoices(invoices), _balances(balances) {}

models::Invoice PaymentService::create_invoice(
    const Poco::UUID& order_id, const Poco::UUID& user_id,
    Poco::Int64 amount_minor, const std::string& currency)
{
    if (amount_minor <= 0)
        throw ServiceError("invoice amount must be positive");

    models::Invoice inv;
    inv.id           = Poco::UUIDGenerator::defaultGenerator().createRandom();
    inv.order_id     = order_id;
    inv.user_id      = user_id;
    inv.amount_minor = amount_minor;
    inv.currency     = currency;
    inv.status       = models::InvoiceStatus::Pending;
    inv.created_at   = Poco::DateTime();
    inv.updated_at   = inv.created_at;

    return _invoices.create(inv);
}

std::optional<models::Invoice> PaymentService::get_invoice(const Poco::UUID& id) {
    return _invoices.find_by_id(id);
}

std::vector<models::Invoice> PaymentService::user_invoices(const Poco::UUID& user_id) {
    return _invoices.find_by_user_id(user_id);
}

models::Invoice PaymentService::pay_invoice(const Poco::UUID& invoice_id) {
    auto maybe_inv = _invoices.find_by_id(invoice_id);
    if (!maybe_inv)
        throw InvoiceNotFoundError("invoice not found: " + invoice_id.toString());

    auto inv = *maybe_inv;
    if (inv.status != models::InvoiceStatus::Pending)
        throw InvalidInvoiceStateError("invoice must be Pending to be paid");

    _balances.debit(inv.user_id, inv.amount_minor, models::TransactionKind::Charge, invoice_id);

    try {
        _invoices.update_status(invoice_id, models::InvoiceStatus::Paid);
    } catch (...) {
        // Saga compensation: roll back the debit if the status update fails.
        try { _balances.credit(inv.user_id, inv.amount_minor, models::TransactionKind::Refund, invoice_id); }
        catch (...) {}
        throw;
    }

    inv.status = models::InvoiceStatus::Paid;
    return inv;
}

models::Invoice PaymentService::refund_invoice(const Poco::UUID& invoice_id) {
    auto maybe_inv = _invoices.find_by_id(invoice_id);
    if (!maybe_inv)
        throw InvoiceNotFoundError("invoice not found: " + invoice_id.toString());

    auto inv = *maybe_inv;
    if (inv.status != models::InvoiceStatus::Paid)
        throw InvalidInvoiceStateError("only Paid invoices can be refunded");

    _invoices.update_status(invoice_id, models::InvoiceStatus::Refunded);

    try {
        _balances.credit(inv.user_id, inv.amount_minor, models::TransactionKind::Refund, invoice_id);
    } catch (...) {
        // Saga compensation: restore Paid status if the credit fails.
        try { _invoices.update_status(invoice_id, models::InvoiceStatus::Paid); }
        catch (...) {}
        throw;
    }

    inv.status = models::InvoiceStatus::Refunded;
    return inv;
}

models::Balance PaymentService::deposit(
    const Poco::UUID& user_id, Poco::Int64 amount, const std::string& currency)
{
    if (amount <= 0)
        throw ServiceError("deposit amount must be positive");

    _balances.initialize(user_id, currency);
    _balances.credit(user_id, amount, models::TransactionKind::Deposit);

    auto bal = _balances.get(user_id);
    if (!bal)
        throw ServiceError("balance not found after deposit");
    return *bal;
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
