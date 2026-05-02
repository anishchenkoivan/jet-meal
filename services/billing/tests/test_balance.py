import uuid

import requests

CURRENCY = "RUB"


def deposit(url, user_id, amount_minor=1000, currency=CURRENCY):
    return requests.post(
        f"{url}/api/v1/users/{user_id}/balance/deposit",
        json={"amount_minor": amount_minor, "currency": currency},
    )


def test_get_balance_not_found_returns_404(url):
    resp = requests.get(f"{url}/api/v1/users/{uuid.uuid4()}/balance")
    assert resp.status_code == 404


def test_get_balance_after_deposit_returns_200(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id)
    resp = requests.get(f"{url}/api/v1/users/{user_id}/balance")
    assert resp.status_code == 200


def test_get_balance_returns_expected_fields(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=750)
    body = requests.get(f"{url}/api/v1/users/{user_id}/balance").json()
    assert body["user_id"] == user_id
    assert body["amount_minor"] == 750
    assert body["currency"] == CURRENCY
    assert "updated_at" in body


def test_get_balance_invalid_user_id_returns_400(url):
    resp = requests.get(f"{url}/api/v1/users/not-a-uuid/balance")
    assert resp.status_code == 400


def test_deposit_creates_balance_returns_200(url):
    user_id = str(uuid.uuid4())
    resp = deposit(url, user_id, amount_minor=500)
    assert resp.status_code == 200


def test_deposit_returns_updated_balance(url):
    user_id = str(uuid.uuid4())
    resp = deposit(url, user_id, amount_minor=500)
    body = resp.json()
    assert body["user_id"] == user_id
    assert body["amount_minor"] == 500
    assert body["currency"] == CURRENCY
    assert "updated_at" in body


def test_deposit_accumulates_balance(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=300)
    resp = deposit(url, user_id, amount_minor=200)
    assert resp.json()["amount_minor"] == 500


def test_deposit_zero_amount_returns_400(url):
    resp = deposit(url, str(uuid.uuid4()), amount_minor=0)
    assert resp.status_code == 400


def test_deposit_negative_amount_returns_400(url):
    resp = deposit(url, str(uuid.uuid4()), amount_minor=-1)
    assert resp.status_code == 400


def test_deposit_invalid_json_returns_400(url):
    user_id = str(uuid.uuid4())
    resp = requests.post(
        f"{url}/api/v1/users/{user_id}/balance/deposit",
        data="not json",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 400


def test_deposit_missing_fields_returns_400(url):
    user_id = str(uuid.uuid4())
    resp = requests.post(
        f"{url}/api/v1/users/{user_id}/balance/deposit",
        json={"amount_minor": 100},
    )
    assert resp.status_code == 400


def test_deposit_invalid_user_id_returns_400(url):
    resp = requests.post(
        f"{url}/api/v1/users/not-a-uuid/balance/deposit",
        json={"amount_minor": 100, "currency": CURRENCY},
    )
    assert resp.status_code == 400


def test_history_empty_list_for_unknown_user(url):
    resp = requests.get(f"{url}/api/v1/users/{uuid.uuid4()}/balance/history")
    assert resp.status_code == 200
    assert resp.json()["transactions"] == []


def test_history_reflects_deposits(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=100)
    deposit(url, user_id, amount_minor=200)
    resp = requests.get(f"{url}/api/v1/users/{user_id}/balance/history")
    assert resp.status_code == 200
    txs = resp.json()["transactions"]
    assert len(txs) == 2


def test_history_transaction_has_expected_fields(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=400)
    tx = requests.get(f"{url}/api/v1/users/{user_id}/balance/history").json()["transactions"][0]
    assert tx["user_id"] == user_id
    assert tx["amount_minor"] == 400
    assert tx["kind"] == "deposit"
    assert "id" in tx
    assert "created_at" in tx


def test_history_charge_after_payment(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=5000)
    invoice = requests.post(
        f"{url}/api/v1/invoices",
        json={"order_id": str(uuid.uuid4()), "user_id": user_id, "amount_minor": 1000, "currency": CURRENCY},
    ).json()
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    txs = requests.get(f"{url}/api/v1/users/{user_id}/balance/history").json()["transactions"]
    kinds = {tx["kind"] for tx in txs}
    assert "deposit" in kinds
    assert "charge" in kinds


def test_history_refund_after_refund(url):
    user_id = str(uuid.uuid4())
    deposit(url, user_id, amount_minor=5000)
    invoice = requests.post(
        f"{url}/api/v1/invoices",
        json={"order_id": str(uuid.uuid4()), "user_id": user_id, "amount_minor": 1000, "currency": CURRENCY},
    ).json()
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/pay")
    requests.post(f"{url}/api/v1/invoices/{invoice['id']}/refund")
    txs = requests.get(f"{url}/api/v1/users/{user_id}/balance/history").json()["transactions"]
    kinds = [tx["kind"] for tx in txs]
    assert "refund" in kinds


def test_history_limit_param(url):
    user_id = str(uuid.uuid4())
    for _ in range(5):
        deposit(url, user_id, amount_minor=10)
    resp = requests.get(f"{url}/api/v1/users/{user_id}/balance/history?limit=3")
    assert resp.status_code == 200
    assert len(resp.json()["transactions"]) == 3


def test_history_limit_too_large_returns_400(url):
    resp = requests.get(f"{url}/api/v1/users/{uuid.uuid4()}/balance/history?limit=201")
    assert resp.status_code == 400


def test_history_limit_zero_returns_400(url):
    resp = requests.get(f"{url}/api/v1/users/{uuid.uuid4()}/balance/history?limit=0")
    assert resp.status_code == 400


def test_history_limit_non_integer_returns_400(url):
    resp = requests.get(f"{url}/api/v1/users/{uuid.uuid4()}/balance/history?limit=abc")
    assert resp.status_code == 400


def test_history_invalid_user_id_returns_400(url):
    resp = requests.get(f"{url}/api/v1/users/not-a-uuid/balance/history")
    assert resp.status_code == 400
