#include <handlers/balance_handler.hpp>

#include <Poco/DateTimeFormatter.h>
#include <Poco/Exception.h>

#include <repository/balance/balance_repository.hpp>

namespace billing::handlers {

namespace svc = billing::service;

namespace {

std::string format_datetime(const Poco::DateTime& datetime) {
    return Poco::DateTimeFormatter::format(datetime, "%Y-%m-%dT%H:%M:%SZ");
}

crow::json::wvalue balance_to_json(const models::Balance& balance) {
    crow::json::wvalue json;
    json["user_id"] = balance.user_id.toString();
    json["amount_minor"] = balance.amount_minor;
    json["currency"] = balance.currency;
    json["updated_at"] = format_datetime(balance.updated_at);
    return json;
}

crow::json::wvalue transaction_to_json(const models::BalanceTransaction& transaction) {
    crow::json::wvalue json;
    json["id"] = transaction.id.toString();
    json["user_id"] = transaction.user_id.toString();
    json["amount_minor"] = transaction.amount_minor;
    json["kind"] = models::to_string(transaction.kind);
    json["reference_id"] = transaction.reference_id ? transaction.reference_id->toString() : "";
    json["created_at"] = format_datetime(transaction.created_at);
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

BalanceHandler::BalanceHandler(service::PaymentService& svc) : _svc(svc) {}

crow::response BalanceHandler::get(const crow::request&, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid)) {
        return error_response(400, "invalid user id");
    }

    try {
        auto balance = _svc.get_balance(uuid);
        if (!balance) {
            return error_response(404, "balance not found");
        }
        return {200, balance_to_json(*balance)};
    } catch (...) {
        return error_response(500, "internal error");
    }
}

crow::response BalanceHandler::deposit(const crow::request& req, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid)) {
        return error_response(400, "invalid user id");
    }

    auto body = crow::json::load(req.body);
    if (!body) {
        return error_response(400, "invalid JSON body");
    }

    Poco::Int64 amount_minor;
    std::string currency;
    try {
        amount_minor = body["amount_minor"].i();
        currency = std::string(body["currency"].s());
    } catch (...) {
        return error_response(400, "amount_minor (integer) and currency (string) are required");
    }

    try {
        return {200, balance_to_json(_svc.deposit(uuid, amount_minor, currency))};
    } catch (const svc::ServiceError& service_error) {
        return error_response(400, service_error.what());
    } catch (...) {
        return error_response(500, "internal error");
    }
}

crow::response BalanceHandler::history(const crow::request& req, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid)) {
        return error_response(400, "invalid user id");
    }

    int limit = 50;
    if (const char* limit_param = req.url_params.get("limit")) {
        try { limit = std::stoi(limit_param); }
        catch (...) { return error_response(400, "limit must be an integer"); }
        if (limit <= 0 || limit > 200) {
            return error_response(400, "limit must be between 1 and 200");
        }
    }

    try {
        auto transactions = _svc.transaction_history(uuid, limit);
        crow::json::wvalue response_json;
        crow::json::wvalue::list transaction_list;
        transaction_list.reserve(transactions.size());
        for (const auto& transaction : transactions) {
            transaction_list.push_back(transaction_to_json(transaction));
        }
        response_json["transactions"] = std::move(transaction_list);
        return {200, response_json};
    } catch (...) {
        return error_response(500, "internal error");
    }
}

} // namespace billing::handlers
