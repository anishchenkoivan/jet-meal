#include <handlers/balance_handler.hpp>

#include <Poco/DateTimeFormatter.h>
#include <Poco/Exception.h>

#include <repository/balance/balance_repository.hpp>

namespace svc       = billing::service;

namespace billing::handlers {

static std::string fmt_dt(const Poco::DateTime& dt) {
    return Poco::DateTimeFormatter::format(dt, "%Y-%m-%dT%H:%M:%SZ");
}

static crow::json::wvalue balance_to_json(const models::Balance& b) {
    crow::json::wvalue j;
    j["user_id"]      = b.user_id.toString();
    j["amount_minor"] = b.amount_minor;
    j["currency"]     = b.currency;
    j["updated_at"]   = fmt_dt(b.updated_at);
    return j;
}

static crow::json::wvalue transaction_to_json(const models::BalanceTransaction& tx) {
    crow::json::wvalue j;
    j["id"]           = tx.id.toString();
    j["user_id"]      = tx.user_id.toString();
    j["amount_minor"] = tx.amount_minor;
    j["kind"]         = models::to_string(tx.kind);
    j["reference_id"] = tx.reference_id ? tx.reference_id->toString() : "";
    j["created_at"]   = fmt_dt(tx.created_at);
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

BalanceHandler::BalanceHandler(service::PaymentService& svc) : _svc(svc) {}

crow::response BalanceHandler::get(const crow::request&, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid))
        return err(400, "invalid user id");

    try {
        auto bal = _svc.get_balance(uuid);
        if (!bal) return err(404, "balance not found");
        return {200, balance_to_json(*bal)};
    } catch (...) {
        return err(500, "internal error");
    }
}

crow::response BalanceHandler::deposit(const crow::request& req, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid))
        return err(400, "invalid user id");

    auto body = crow::json::load(req.body);
    if (!body)
        return err(400, "invalid JSON body");

    Poco::Int64 amount_minor;
    std::string currency;
    try {
        amount_minor = body["amount_minor"].i();
        currency     = std::string(body["currency"].s());
    } catch (...) {
        return err(400, "amount_minor (integer) and currency (string) are required");
    }

    try {
        return {200, balance_to_json(_svc.deposit(uuid, amount_minor, currency))};
    } catch (const svc::ServiceError& e) {
        return err(400, e.what());
    } catch (...) {
        return err(500, "internal error");
    }
}

crow::response BalanceHandler::history(const crow::request& req, const std::string& user_id) {
    Poco::UUID uuid;
    if (!parse_uuid(user_id, uuid))
        return err(400, "invalid user id");

    int limit = 50;
    if (const char* p = req.url_params.get("limit")) {
        try { limit = std::stoi(p); }
        catch (...) { return err(400, "limit must be an integer"); }
        if (limit <= 0 || limit > 200)
            return err(400, "limit must be between 1 and 200");
    }

    try {
        auto txs = _svc.transaction_history(uuid, limit);
        crow::json::wvalue res;
        crow::json::wvalue::list list;
        list.reserve(txs.size());
        for (const auto& tx : txs)
            list.push_back(transaction_to_json(tx));
        res["transactions"] = std::move(list);
        return {200, res};
    } catch (...) {
        return err(500, "internal error");
    }
}

} // namespace billing::handlers
