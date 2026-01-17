<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite no soporta CREATE OR REPLACE VIEW, así que eliminamos primero
        DB::statement('DROP VIEW IF EXISTS v_store_inventory');
        DB::statement("
            CREATE VIEW v_store_inventory AS
            SELECT 
                s.id AS store_id,
                s.name AS store_name,
                p.id AS product_id,
                p.sku,
                p.name AS product_name,
                c.name AS category_name,
                sp.stock,
                sp.min_stock,
                p.sale_price,
                (sp.stock * p.cost_price) AS inventory_value_cost,
                (sp.stock * p.sale_price) AS inventory_value_sale
            FROM stores s
            INNER JOIN store_product sp ON s.id = sp.store_id
            INNER JOIN products p ON sp.product_id = p.id
            INNER JOIN categories c ON p.category_id = c.id
            WHERE s.is_active = TRUE AND p.is_active = TRUE
        ");

        DB::statement('DROP VIEW IF EXISTS v_daily_sales_summary');
        DB::statement("
            CREATE VIEW v_daily_sales_summary AS
            SELECT 
                s.store_id,
                st.name AS store_name,
                DATE(s.created_at) AS sale_date,
                COUNT(s.id) AS total_sales,
                SUM(CASE WHEN s.status = 'completada' THEN s.total ELSE 0 END) AS total_revenue,
                SUM(CASE WHEN s.status = 'anulada' THEN s.total ELSE 0 END) AS total_cancelled
            FROM sales s
            INNER JOIN stores st ON s.store_id = st.id
            GROUP BY s.store_id, st.name, DATE(s.created_at)
        ");

        DB::statement('DROP VIEW IF EXISTS v_cash_register_status');
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
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_cash_register_status');
        DB::statement('DROP VIEW IF EXISTS v_daily_sales_summary');
        DB::statement('DROP VIEW IF EXISTS v_store_inventory');
    }
};
