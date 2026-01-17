<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecreateViews extends Command
{
    protected $signature = 'db:recreate-views';
    protected $description = 'Recreate database views';

    public function handle()
    {
        $this->info('Recreando vistas de base de datos...');

        try {
            DB::statement('DROP VIEW IF EXISTS v_cash_register_status');
            $this->line('✓ Vista v_cash_register_status eliminada');

            DB::statement("
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
            ");
            $this->line('✓ Vista v_cash_register_status creada');

            $columns = DB::select('SHOW COLUMNS FROM v_cash_register_status');
            $this->newLine();
            $this->info('Columnas en v_cash_register_status:');
            foreach ($columns as $column) {
                $this->line("  - {$column->Field}");
            }

            $this->newLine();
            $this->info('✅ Vistas recreadas exitosamente');

            return 0;
        } catch (\Exception $e) {
            $this->error('Error al recrear vistas: ' . $e->getMessage());
            return 1;
        }
    }
}
