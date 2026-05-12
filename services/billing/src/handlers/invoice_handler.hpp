#pragma once

#include <crow.h>

#include <service/payment_service.hpp>

namespace billing::handlers {

class InvoiceHandler {
public:
    explicit InvoiceHandler(service::PaymentService& svc);

    crow::response create(const crow::request& req);
    crow::response get_by_id(const crow::request& req, const std::string& id);
    crow::response get_by_user(const crow::request& req, const std::string& user_id);
    crow::response pay(const crow::request& req, const std::string& id);
    crow::response refund(const crow::request& req, const std::string& id);

private:
    service::PaymentService& _svc;
};

} // namespace billing::handlers
