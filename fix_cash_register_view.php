#!/usr/bin/env php
<?php

// Script directo para recrear la vista
$host = '127.0.0.1';
$db = 'codexastartesdb';
$user = 'root';
$pass = '5378';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conexión exitosa a la base de datos\n\n";
    
    // Eliminar vista anterior
    $pdo->exec("DROP VIEW IF EXISTS v_cash_register_status");
    echo "✓ Vista anterior eliminada\n";
    
    // Crear nueva vista con store_id
    $sql = "
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
        LEFT JOIN users u2 ON cr.closed_by = u2.id
    ";
    
    $pdo->exec($sql);
    echo "✓ Vista creada exitosamente\n\n";
    
    // Verificar columnas
    $stmt = $pdo->query("
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'v_cash_register_status' 
        AND TABLE_SCHEMA = '$db'
        ORDER BY ORDINAL_POSITION
    ");
    
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Columnas en v_cash_register_status:\n";
    foreach ($columns as $col) {
        echo "  - $col\n";
    }
    
    echo "\n✅ Vista recreada correctamente con columna store_id\n";
    
    // Verificar que la consulta funcione
    $test = $pdo->query("SELECT * FROM v_cash_register_status LIMIT 1");
    echo "✓ Vista es consultable\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
