-- Нагадування біля клієнта: дата, до якої треба зв'язатися. Порожня дата означає "без нагадування".

ALTER TABLE clients ADD COLUMN IF NOT EXISTS follow_up_on date;

CREATE INDEX IF NOT EXISTS clients_follow_up_idx
  ON clients (owner_id, follow_up_on)
  WHERE follow_up_on IS NOT NULL;
