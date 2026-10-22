-- Підписка: до якої дати відкритий доступ і чи просив користувач рахунок.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS access_until date;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invoice_requested_at timestamptz;

-- Тим, кого вже схвалено, але термін ще не заданий, даємо 14 днів від сьогодні.
UPDATE profiles
SET access_until = CURRENT_DATE + 14
WHERE status = 'approved' AND access_until IS NULL;
