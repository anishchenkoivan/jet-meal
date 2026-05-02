#include <handlers/invoice_handler.hpp>

#include <Poco/DateTimeFormatter.h>
#include <Poco/Exception.h>

#include <repository/balance/balance_repository.hpp>

namespace svc       = billing::service;
namespace bal_repo  = billing::repository::balance;

namespace billing::handlers {

static std::string fmt_dt(const Poco::DateTime& dt) {
    return Poco::DateTimeFormatter::format(dt, "%Y-%m-%dT%H:%M:%SZ");
}

static crow::json::wvalue invoice_to_json(const models::Invoice& inv) {
    crow::json::wvalue j;
    j["id"]           = inv.id.toString();
    j["order_id"]     = inv.order_id.toString();
    j["user_id"]      = inv.user_id.toString();
    j["amount_minor"] = inv.amount_minor;
    j["currency"]     = inv.currency;
    j["status"]       = models::to_string(inv.status);
    j["created_at"]   = fmt_dt(inv.created_at);
    j["updated_at"]   = fmt_dt(inv.updated_at);
    return j;
}

static crow::response err(int code, const std::string& msg) {
    crow::json::wvalue body;
    body["error"] = msg;
    return {code, body};
}

static bool parse_uuid(const std::string& s, Poco::UUID& out) {
    try { out.parse(s); return true; }
    catch (const Poco::SyntaxException&) { return false; }
}

InvoiceHandler::InvoiceHandler(service::PaymentService& svc) : _svc(svc) {}

crow::response InvoiceHandler::create(const crow::request& req) {
    auto body = crow::json::load(req.body);
    if (!body)
        return err(400, "invalid JSON body");

    Poco::UUID order_id, user_id;
    Poco::Int64 amount_minor;
    std::string currency;
    try {
        if (!parse_uuid(std::string(body["order_id"].s()), order_id))
            return err(400, "invalid or missing order_id");
        if (!parse_uuid(std::string(body["user_id"].s()), user_id))
            return err(400, "invalid or missing user_id");
        amount_minor = body["amount_minor"].i();
        currency     = std::string(body["currency"].s());
    } catch (...) {
        return err(400, "order_id, user_id, amount_minor and currency are required");
    }

    try {
        return {201, invoice_to_json(_svc.create_invoice(order_id, user_id, amount_minor, currency))};
    } catch (const svc::ServiceError& e) {
        return err(400, e.what());
    } catch (...) {
        return err(500, "internal error");
    }
}

crow::response InvoiceHandler::get_by_id(const crow::request&, const std::string& id) {
    Poco::UUID uuid;
    if (!parse_uuid(id, uuid))
        return err(400, "invalid invoice id");

    try {
        auto inv = _svc.get_invoice(uuid);
        if (!inv) return err(404, "invoice not found");
        return {200, invoice_to_json(*inv)};
    } catch (...) {
        return err(500, "internal error");
    }
}

crow::response InvoiceHandler::get_by_user(const crow::request&, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid))
        return err(400, "invalid user id");

    try {
        auto invoices = _svc.user_invoices(uuid);
        crow::json::wvalue res;
        crow::json::wvalue::list list;
        list.reserve(invoices.size());
        for (const auto& inv : invoices)
            list.push_back(invoice_to_json(inv));
        res["invoices"] = std::move(list);
        return {200, res};
    } catch (...) {
        return err(500, "internal error");
    }
}

crow::response InvoiceHandler::pay(const crow::request&, const std::string& id) {
    Poco::UUID uuid;
    if (!parse_uuid(id, uuid))
        return err(400, "invalid invoice id");

    try {
        return {200, invoice_to_json(_svc.pay_invoice(uuid))};
    } catch (const svc::InvoiceNotFoundError& e) {
        return err(404, e.what());
    } catch (const svc::InvalidInvoiceStateError& e) {
        return err(409, e.what());
    } catch (const bal_repo::InsufficientFundsError& e) {
        return err(409, e.what());
    } catch (...) {
        return err(500, "internal error");
    }
}

crow::response InvoiceHandler::refund(const crow::request&, const std::string& id) {
    Poco::UUID uuid;
    if (!parse_uuid(id, uuid))
        return err(400, "invalid invoice id");

    try {
        return {200, invoice_to_json(_svc.refund_invoice(uuid))};
    } catch (const svc::InvoiceNotFoundError& e) {
        return err(404, e.what());
    } catch (const svc::InvalidInvoiceStateError& e) {
        return err(409, e.what());
    } catch (...) {
        return err(500, "internal error");
    }
}

} // namespace billing::handlers
