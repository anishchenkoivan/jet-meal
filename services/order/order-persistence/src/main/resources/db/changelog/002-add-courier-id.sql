--liquibase formatted sql

--changeset jetmeal:002-add-courier-id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_id UUID;
