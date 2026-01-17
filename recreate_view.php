<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Recreando vista v_cash_register_status...\n\n";

try {
    DB::statement('DROP VIEW IF EXISTS v_cash_register_status');
    echo "✓ Vista anterior eliminada\n";
    
    $sql = "CREATE VIEW v_cash_register_status AS
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
        LEFT JOIN users u2 ON cr.closed_by = u2.id";
    
    DB::statement($sql);
    echo "✓ Vista creada exitosamente\n\n";
    
    $columns = DB::select('SHOW COLUMNS FROM v_cash_register_status');
    echo "Columnas en v_cash_register_status:\n";
    foreach($columns as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    
    echo "\n✅ Vista recreada correctamente con columna store_id\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
