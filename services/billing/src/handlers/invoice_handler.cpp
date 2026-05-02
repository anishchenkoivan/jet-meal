#include <handlers/invoice_handler.hpp>

#include <Poco/DateTimeFormatter.h>
#include <Poco/Exception.h>

#include <repository/balance/balance_repository.hpp>

namespace billing::handlers {

namespace svc = billing::service;
namespace bal_repo = billing::repository::balance;

namespace {

std::string format_datetime(const Poco::DateTime& datetime) {
    return Poco::DateTimeFormatter::format(datetime, "%Y-%m-%dT%H:%M:%SZ");
}

crow::json::wvalue invoice_to_json(const models::Invoice& invoice) {
    crow::json::wvalue json;
    json["id"] = invoice.id.toString();
    json["order_id"] = invoice.order_id.toString();
    json["user_id"] = invoice.user_id.toString();
    json["amount_minor"] = invoice.amount_minor;
    json["currency"] = invoice.currency;
    json["status"] = models::to_string(invoice.status);
    json["created_at"] = format_datetime(invoice.created_at);
    json["updated_at"] = format_datetime(invoice.updated_at);
    return json;
}

crow::response error_response(int code, const std::string& message) {
    crow::json::wvalue body;
    body["error"] = message;
    return {code, body};
}

bool parse_uuid(const std::string& uuid_str, Poco::UUID& out) {
    try { out.parse(uuid_str); return true; }
    catch (const Poco::SyntaxException&) { return false; }
}

} // namespace

InvoiceHandler::InvoiceHandler(service::PaymentService& svc) : _svc(svc) {}

crow::response InvoiceHandler::create(const crow::request& req) {
    auto body = crow::json::load(req.body);
    if (!body) {
        return error_response(400, "invalid JSON body");
    }

    Poco::UUID order_id, user_id;
    Poco::Int64 amount_minor;
    std::string currency;
    try {
        if (!parse_uuid(std::string(body["order_id"].s()), order_id)) {
            return error_response(400, "invalid or missing order_id");
        }
        if (!parse_uuid(std::string(body["user_id"].s()), user_id)) {
            return error_response(400, "invalid or missing user_id");
        }
        amount_minor = body["amount_minor"].i();
        currency = std::string(body["currency"].s());
    } catch (...) {
        return error_response(400, "order_id, user_id, amount_minor and currency are required");
    }

    try {
        return {201, invoice_to_json(_svc.create_invoice(order_id, user_id, amount_minor, currency))};
    } catch (const svc::ServiceError& service_error) {
        return error_response(400, service_error.what());
    } catch (...) {
        return error_response(500, "internal error");
    }
}

crow::response InvoiceHandler::get_by_id(const crow::request&, const std::string& id) {
    Poco::UUID uuid;
    if (!parse_uuid(id, uuid)) {
        return error_response(400, "invalid invoice id");
    }

    try {
        auto maybe_invoice = _svc.get_invoice(uuid);
        if (!maybe_invoice) {
            return error_response(404, "invoice not found");
        }
        return {200, invoice_to_json(*maybe_invoice)};
    } catch (...) {
        return error_response(500, "internal error");
    }
}

crow::response InvoiceHandler::get_by_user(const crow::request&, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid)) {
        return error_response(400, "invalid user id");
    }

    try {
        auto invoices = _svc.user_invoices(uuid);
        crow::json::wvalue response_json;
        crow::json::wvalue::list invoice_list;
        invoice_list.reserve(invoices.size());
        for (const auto& invoice : invoices) {
            invoice_list.push_back(invoice_to_json(invoice));
        }
        response_json["invoices"] = std::move(invoice_list);
        return {200, response_json};
    } catch (...) {
        return error_response(500, "internal error");
    }
}

crow::response InvoiceHandler::pay(const crow::request&, const std::string& id) {
    Poco::UUID uuid;
    if (!parse_uuid(id, uuid)) {
        return error_response(400, "invalid invoice id");
    }

    try {
        return {200, invoice_to_json(_svc.pay_invoice(uuid))};
    } catch (const svc::InvoiceNotFoundError& not_found_error) {
        return error_response(404, not_found_error.what());
    } catch (const svc::InvalidInvoiceStateError& state_error) {
        return error_response(409, state_error.what());
    } catch (const bal_repo::InsufficientFundsError& funds_error) {
        return error_response(409, funds_error.what());
    } catch (...) {
        return error_response(500, "internal error");
    }
}

crow::response InvoiceHandler::refund(const crow::request&, const std::string& id) {
    Poco::UUID uuid;
    if (!parse_uuid(id, uuid)) {
        return error_response(400, "invalid invoice id");
    }

    try {
        return {200, invoice_to_json(_svc.refund_invoice(uuid))};
    } catch (const svc::InvoiceNotFoundError& not_found_error) {
        return error_response(404, not_found_error.what());
    } catch (const svc::InvalidInvoiceStateError& state_error) {
        return error_response(409, state_error.what());
    } catch (...) {
        return error_response(500, "internal error");
    }
}

} // namespace billing::handlers
