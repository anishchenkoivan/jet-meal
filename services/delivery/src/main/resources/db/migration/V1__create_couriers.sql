CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE couriers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    last_updated BIGINT NOT NULL,
    assigned BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX couriers_location_gix ON couriers USING GIST (location);
CREATE INDEX couriers_user_id_idx ON couriers (user_id);

