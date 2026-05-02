#include <crow.h>

#include <Poco/Data/PostgreSQL/Connector.h>
#include <Poco/Data/SessionPool.h>

#include <config.hpp>
#include <handlers/balance_handler.hpp>
#include <handlers/invoice_handler.hpp>
#include <repository/balance/pg_balance_repository.hpp>
#include <repository/invoices/pg_invoice_repository.hpp>
#include <service/payment_service.hpp>

int main() {
    Poco::Data::PostgreSQL::Connector::registerConnector();

    Poco::Data::SessionPool pool("PostgreSQL", get_postgres_dsn());

    billing::repository::invoices::PgInvoiceRepository invoices(pool);
    billing::repository::balance::PgBalanceRepository  balances(pool);
    billing::service::PaymentService                   svc(invoices, balances);
    billing::handlers::InvoiceHandler                  invoice_h(svc);
    billing::handlers::BalanceHandler                  balance_h(svc);

    crow::SimpleApp app;

    CROW_ROUTE(app, "/health")
        .methods(crow::HTTPMethod::GET)
        ([](){ return crow::response(200); });

    CROW_ROUTE(app, "/api/v1/invoices")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req) {
            return invoice_h.create(req);
        });

    CROW_ROUTE(app, "/api/v1/invoices/<string>")
        .methods(crow::HTTPMethod::GET)
        ([&](const crow::request& req, const std::string& id) {
            return invoice_h.get_by_id(req, id);
        });

    CROW_ROUTE(app, "/api/v1/invoices/<string>/pay")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req, const std::string& id) {
            return invoice_h.pay(req, id);
        });

    CROW_ROUTE(app, "/api/v1/invoices/<string>/refund")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req, const std::string& id) {
            return invoice_h.refund(req, id);
        });

    CROW_ROUTE(app, "/api/v1/users/<string>/invoices")
        .methods(crow::HTTPMethod::GET)
        ([&](const crow::request& req, const std::string& user_id) {
            return invoice_h.get_by_user(req, user_id);
        });

    CROW_ROUTE(app, "/api/v1/users/<string>/balance")
        .methods(crow::HTTPMethod::GET)
        ([&](const crow::request& req, const std::string& user_id) {
            return balance_h.get(req, user_id);
        });

    CROW_ROUTE(app, "/api/v1/users/<string>/balance/deposit")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req, const std::string& user_id) {
            return balance_h.deposit(req, user_id);
        });

    CROW_ROUTE(app, "/api/v1/users/<string>/balance/history")
        .methods(crow::HTTPMethod::GET)
        ([&](const crow::request& req, const std::string& user_id) {
            return balance_h.history(req, user_id);
        });

    app.port(get_port()).multithreaded().run();
}
