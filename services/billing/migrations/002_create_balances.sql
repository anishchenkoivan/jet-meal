CREATE TABLE IF NOT EXISTS balances (
    user_id      UUID        PRIMARY KEY,
    amount_minor BIGINT      NOT NULL DEFAULT 0 CHECK (amount_minor >= 0),
    currency     TEXT        NOT NULL DEFAULT 'RUB',
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS balance_transactions (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES balances (user_id),
    amount_minor BIGINT      NOT NULL,  -- positive = credit, negative = debit
    kind         TEXT        NOT NULL CHECK (kind IN ('deposit', 'charge', 'refund')),
    reference_id UUID,                  -- optional: invoice id for charges/refunds
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS balance_transactions_user_created_idx
    ON balance_transactions (user_id, created_at DESC);
