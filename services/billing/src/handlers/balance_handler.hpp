#pragma once

#include <crow.h>

#include <service/payment_service.hpp>

namespace billing::handlers {

class BalanceHandler {
public:
    explicit BalanceHandler(service::PaymentService& svc);

    crow::response get(const crow::request& req, const std::string& user_id);
    crow::response deposit(const crow::request& req, const std::string& user_id);
    crow::response history(const crow::request& req, const std::string& user_id);

private:
    service::PaymentService& _svc;
};

} // namespace billing::handlers
