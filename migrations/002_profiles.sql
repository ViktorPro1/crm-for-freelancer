-- Профілі користувачів: статус заявки (pending, approved, rejected).

CREATE TABLE IF NOT EXISTS profiles (
  user_id    text PRIMARY KEY,
  email      text NOT NULL,
  name       text NOT NULL DEFAULT '',
  status     text NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);
