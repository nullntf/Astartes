DROP VIEW IF EXISTS v_cash_register_status;

CREATE VIEW v_cash_register_status AS
SELECT 
    cr.id,
    cr.store_id,
    s.name AS store_name,
    u1.name AS opened_by,
    cr.opened_at,
    cr.opening_balance,
    u2.name AS closed_by,
    cr.closed_at,
    cr.closing_balance,
    cr.expected_balance,
    cr.difference,
    cr.status
FROM cash_registers cr
INNER JOIN stores s ON cr.store_id = s.id
INNER JOIN users u1 ON cr.opened_by = u1.id
LEFT JOIN users u2 ON cr.closed_by = u2.id;

SHOW COLUMNS FROM v_cash_register_status;
