-- Клієнти. Кожен клієнт належить користувачу (owner_id), статус: lead, active або archived.
-- Правило для всіх файлів у цій папці: одна команда закінчується крапкою з комою,
-- а всередині текстових значень крапки з комою немає.

CREATE TABLE IF NOT EXISTS clients (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id   text NOT NULL,
  name       text NOT NULL,
  company    text NOT NULL,
  email      text NOT NULL,
  status     text NOT NULL DEFAULT 'lead'
             CHECK (status IN ('lead', 'active', 'archived')),
  created_at date NOT NULL DEFAULT CURRENT_DATE,
  notes      text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS clients_owner_idx ON clients (owner_id);
