#include <repository/invoices/pg_invoice_repository.hpp>

#include <Poco/Data/Session.h>
#include <Poco/Data/Statement.h>
#include <Poco/Exception.h>

namespace kw = Poco::Data::Keywords;
namespace models = billing::models;

namespace billing::repository::invoices {

PgInvoiceRepository::PgInvoiceRepository(Poco::Data::SessionPool& pool)
    : _pool(pool) {}

Invoice PgInvoiceRepository::make_invoice(
    const std::string& id, const std::string& order_id,
    const std::string& user_id, Poco::Int64 amount_minor,
    const std::string& currency, const std::string& status_str,
    const Poco::DateTime& created_at, const Poco::DateTime& updated_at)
{
    Invoice invoice;
    invoice.id.parse(id);
    invoice.order_id.parse(order_id);
    invoice.user_id.parse(user_id);
    invoice.amount_minor = amount_minor;
    invoice.currency = currency;
    invoice.status = models::invoice_status_from_string(status_str);
    invoice.created_at = created_at;
    invoice.updated_at = updated_at;
    return invoice;
}

std::optional<Invoice> PgInvoiceRepository::find_by_id(const Poco::UUID& id) {
    auto session = _pool.get();

    std::string id_str = id.toString();
    std::string result_id, result_order_id, result_user_id, currency, status_str;
    Poco::Int64 amount_minor = 0;
    Poco::DateTime created_at, updated_at;

    Poco::Data::Statement stmt(session);
    stmt << "SELECT id, order_id, user_id, amount_minor, currency, status, created_at, updated_at "
            "FROM invoices WHERE id = $1",
        kw::bind(id_str),
        kw::into(result_id), kw::into(result_order_id), kw::into(result_user_id),
        kw::into(amount_minor), kw::into(currency), kw::into(status_str),
        kw::into(created_at), kw::into(updated_at),
        kw::limit(1);

    try {
        if (stmt.execute() == 0) {
            return std::nullopt;
        }
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    return make_invoice(result_id, result_order_id, result_user_id,
                        amount_minor, currency, status_str,
                        created_at, updated_at);
}

std::vector<Invoice> PgInvoiceRepository::find_by_user_id(const Poco::UUID& user_id) {
    auto session = _pool.get();

    std::string user_id_str = user_id.toString();
    std::vector<std::string> ids, order_ids, user_ids, currencies, statuses;
    std::vector<Poco::Int64> amounts;
    std::vector<Poco::DateTime> created_ats, updated_ats;

    try {
        session << "SELECT id, order_id, user_id, amount_minor, currency, status, created_at, updated_at "
                   "FROM invoices WHERE user_id = $1 ORDER BY created_at DESC",
            kw::bind(user_id_str),
            kw::into(ids), kw::into(order_ids), kw::into(user_ids),
            kw::into(amounts), kw::into(currencies), kw::into(statuses),
            kw::into(created_ats), kw::into(updated_ats),
            kw::now;
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    std::vector<Invoice> result;
    result.reserve(ids.size());
    for (std::size_t i = 0; i < ids.size(); ++i) {
        result.push_back(make_invoice(ids[i], order_ids[i], user_ids[i],
                                      amounts[i], currencies[i], statuses[i],
                                      created_ats[i], updated_ats[i]));
    }
    return result;
}

std::vector<Invoice> PgInvoiceRepository::find_by_order_id(const Poco::UUID& order_id) {
    auto session = _pool.get();

    std::string order_id_str = order_id.toString();
    std::vector<std::string> ids, order_ids, user_ids, currencies, statuses;
    std::vector<Poco::Int64> amounts;
    std::vector<Poco::DateTime> created_ats, updated_ats;

    try {
        session << "SELECT id, order_id, user_id, amount_minor, currency, status, created_at, updated_at "
                   "FROM invoices WHERE order_id = $1 ORDER BY created_at DESC",
            kw::bind(order_id_str),
            kw::into(ids), kw::into(order_ids), kw::into(user_ids),
            kw::into(amounts), kw::into(currencies), kw::into(statuses),
            kw::into(created_ats), kw::into(updated_ats),
            kw::now;
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    std::vector<Invoice> result;
    result.reserve(ids.size());
    for (std::size_t i = 0; i < ids.size(); ++i) {
        result.push_back(make_invoice(ids[i], order_ids[i], user_ids[i],
                                      amounts[i], currencies[i], statuses[i],
                                      created_ats[i], updated_ats[i]));
    }
    return result;
}

Invoice PgInvoiceRepository::create(const Invoice& invoice) {
    auto session = _pool.get();

    std::string id_str = invoice.id.toString();
    std::string order_id_str = invoice.order_id.toString();
    std::string user_id_str = invoice.user_id.toString();
    std::string status_str = models::to_string(invoice.status);

    try {
        session << "INSERT INTO invoices "
                   "(id, order_id, user_id, amount_minor, currency, status, created_at, updated_at) "
                   "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            kw::bind(id_str), kw::bind(order_id_str), kw::bind(user_id_str),
            kw::bind(invoice.amount_minor), kw::bind(invoice.currency), kw::bind(status_str),
            kw::bind(invoice.created_at), kw::bind(invoice.updated_at),
            kw::now;
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }

    return invoice;
}

bool PgInvoiceRepository::update_status(const Poco::UUID& id, InvoiceStatus status) {
    auto session = _pool.get();

    std::string id_str = id.toString();
    std::string status_str = models::to_string(status);

    Poco::Data::Statement stmt(session);
    stmt << "UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2",
        kw::bind(status_str), kw::bind(id_str);

    try {
        return stmt.execute() > 0;
    } catch (const Poco::Exception& e) {
        throw RepositoryError(e.message());
    }
}

} // namespace billing::repository::invoices
