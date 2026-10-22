-- Щоденник нотаток: записи з датою до кожного клієнта.
-- Якщо клієнта видалити назавжди, його записи видаляються разом з ним.

CREATE TABLE IF NOT EXISTS client_notes (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id  integer NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_notes_client_idx
  ON client_notes (client_id, created_at DESC);
