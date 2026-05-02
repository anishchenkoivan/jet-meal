import uuid

import pytest
import requests

AMOUNT = 1000
CURRENCY = "RUB"


def new_ids():
    return str(uuid.uuid4()), str(uuid.uuid4())


def create_invoice(url, user_id=None, order_id=None, amount_minor=AMOUNT, currency=CURRENCY):
    user_id = user_id or str(uuid.uuid4())
    order_id = order_id or str(uuid.uuid4())
    return requests.post(
        f"{url}/api/v1/invoices",
        json={"order_id": order_id, "user_id": user_id, "amount_minor": amount_minor, "currency": currency},
    )


def deposit(url, user_id, amount_minor=AMOUNT * 10, currency=CURRENCY):
    requests.post(
        f"{url}/api/v1/users/{user_id}/balance/deposit",
        json={"amount_minor": amount_minor, "currency": currency},
    )


@pytest.fixture
def funded_invoice(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id)
    resp = create_invoice(url, user_id=user_id, amount_minor=AMOUNT)
    return resp.json(), user_id


def test_create_invoice_returns_201(url):
    resp = create_invoice(url)
    assert resp.status_code == 201


def test_create_invoice_returns_expected_fields(url):
    user_id, order_id = new_ids()
    resp = create_invoice(url, user_id=user_id, order_id=order_id)
    body = resp.json()
    assert body["user_id"] == user_id
    assert body["order_id"] == order_id
    assert body["amount_minor"] == AMOUNT
    assert body["currency"] == CURRENCY
    assert body["status"] == "pending"
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_create_invoice_invalid_json_returns_400(url):
    resp = requests.post(
        f"{url}/api/v1/invoices",
        data="not json",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 400


def test_create_invoice_missing_fields_returns_400(url):
    resp = requests.post(f"{url}/api/v1/invoices", json={"order_id": str(uuid.uuid4())})
    assert resp.status_code == 400


def test_create_invoice_invalid_uuid_returns_400(url):
    resp = requests.post(
        f"{url}/api/v1/invoices",
        json={"order_id": "not-a-uuid", "user_id": str(uuid.uuid4()), "amount_minor": AMOUNT, "currency": CURRENCY},
    )
    assert resp.status_code == 400


def test_create_invoice_zero_amount_returns_400(url):
    resp = create_invoice(url, amount_minor=0)
    assert resp.status_code == 400


def test_create_invoice_negative_amount_returns_400(url):
    resp = create_invoice(url, amount_minor=-1)
    assert resp.status_code == 400


def test_get_invoice_by_id_returns_200(url):
    created = create_invoice(url).json()
    resp = requests.get(f"{url}/api/v1/invoices/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_invoice_by_id_not_found_returns_404(url):
    resp = requests.get(f"{url}/api/v1/invoices/{uuid.uuid4()}")
    assert resp.status_code == 404


def test_get_invoice_by_id_invalid_id_returns_400(url):
    resp = requests.get(f"{url}/api/v1/invoices/not-a-uuid")
    assert resp.status_code == 400


def test_get_user_invoices_returns_200(url):
    user_id = str(uuid.uuid4())
    create_invoice(url, user_id=user_id)
    create_invoice(url, user_id=user_id)
    resp = requests.get(f"{url}/api/v1/users/{user_id}/invoices")
    assert resp.status_code == 200
    body = resp.json()
    assert "invoices" in body
    assert len(body["invoices"]) == 2


def test_get_user_invoices_empty_for_unknown_user(url):
    resp = requests.get(f"{url}/api/v1/users/{uuid.uuid4()}/invoices")
    assert resp.status_code == 200
    assert resp.json()["invoices"] == []


def test_get_user_invoices_invalid_user_id_returns_400(url):
    resp = requests.get(f"{url}/api/v1/users/bad-id/invoices")
    assert resp.status_code == 400


# --- pay ---

def test_pay_invoice_with_sufficient_balance_returns_200(url, funded_invoice):
    invoice, _ = funded_invoice
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    assert resp.status_code == 200
    assert resp.json()["status"] == "paid"


def test_pay_invoice_deducts_balance(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=5000)
    invoice = create_invoice(url, user_id=user_id, amount_minor=1000).json()
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    bal = requests.get(f"{url}/api/v1/users/{user_id}/balance").json()
    assert bal["amount_minor"] == 4000


def test_pay_invoice_insufficient_funds_returns_409(url):
    user_id = str(uuid.uuid4())
    invoice = create_invoice(url, user_id=user_id, amount_minor=AMOUNT).json()
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    assert resp.status_code == 409


def test_pay_invoice_not_found_returns_404(url):
    resp = requests.post(f"{url}/api/v1/invoices/{uuid.uuid4()}/pay")
    assert resp.status_code == 404


def test_pay_already_paid_invoice_returns_409(url, funded_invoice):
    invoice, _ = funded_invoice
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    assert resp.status_code == 409


def test_pay_refunded_invoice_returns_409(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id)
    invoice = create_invoice(url, user_id=user_id, amount_minor=AMOUNT).json()
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    assert resp.status_code == 409


def test_pay_invoice_invalid_id_returns_400(url):
    resp = requests.post(f"{url}/api/v1/invoices/not-a-uuid/pay")
    assert resp.status_code == 400


def test_refund_paid_invoice_returns_200(url, funded_invoice):
    invoice, _ = funded_invoice
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    assert resp.status_code == 200
    assert resp.json()["status"] == "refunded"


def test_refund_restores_balance(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=2000)
    invoice = create_invoice(url, user_id=user_id, amount_minor=2000).json()
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    bal = requests.get(f"{url}/api/v1/users/{user_id}/balance").json()
    assert bal["amount_minor"] == 2000


def test_refund_pending_invoice_returns_409(url):
    invoice = create_invoice(url).json()
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    assert resp.status_code == 409


def test_refund_invoice_not_found_returns_404(url):
    resp = requests.post(f"{url}/api/v1/invoices/{uuid.uuid4()}/refund")
    assert resp.status_code == 404


def test_refund_invoice_invalid_id_returns_400(url):
    resp = requests.post(f"{url}/api/v1/invoices/not-a-uuid/refund")
    assert resp.status_code == 400


def test_refund_already_refunded_invoice_returns_409(url, funded_invoice):
    invoice, _ = funded_invoice
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    resp = requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    assert resp.status_code == 409


def test_error_response_has_error_field(url):
    resp = requests.get(f"{url}/api/v1/invoices/{uuid.uuid4()}")
    assert "error" in resp.json()
