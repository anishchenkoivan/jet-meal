--liquibase formatted sql

--changeset jetmeal:001-create-orders
CREATE TABLE orders (
	id UUID PRIMARY KEY,
	user_id VARCHAR(36) NOT NULL,
	restaurant_id VARCHAR(36) NOT NULL,
	courier_id UUID,
	status VARCHAR(32) NOT NULL,
	total_cost NUMERIC(12, 2) NOT NULL,
	menu_items JSONB NOT NULL,
	comment TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_user_id_hash ON orders USING HASH (user_id);
CREATE INDEX idx_orders_id_hash ON orders USING HASH (id);
