CREATE TABLE IF NOT EXISTS invoices (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID        NOT NULL,
    user_id      UUID        NOT NULL,
    amount_minor BIGINT      NOT NULL CHECK (amount_minor >= 0),
    currency     TEXT        NOT NULL DEFAULT 'RUB',
    status       TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx    ON invoices (user_id);
CREATE INDEX IF NOT EXISTS invoices_order_id_idx   ON invoices (order_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx     ON invoices (status);
