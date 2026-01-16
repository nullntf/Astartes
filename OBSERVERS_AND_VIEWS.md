# Observers y Database Views - Sistema POS

Este documento explica cómo funcionan los Observers y las Database Views implementadas para reemplazar los triggers y vistas SQL del schema original.

## 📋 Observers Implementados

### 1. SaleItemObserver
**Reemplaza:** `trg_after_sale_item_insert`

**Función:** Actualiza automáticamente el stock cuando se crea o elimina un item de venta.

```php
// Al crear un item de venta, reduce el stock
SaleItem::create([
    'sale_id' => $sale->id,
    'product_id' => $product->id,
    'quantity' => 5,
    'unit_price' => 100,
    'subtotal' => 500,
]);
// El observer automáticamente reduce 5 unidades del stock en store_product
```

### 2. SaleObserver
**Reemplaza:** `trg_after_sale_cancelled`

**Función:** Restaura el stock cuando una venta se anula.

```php
// Al anular una venta, restaura el stock
$sale = Sale::find(1);
$sale->update([
    'status' => 'anulada',
    'cancelled_by' => auth()->id(),
    'cancelled_at' => now(),
    'cancellation_reason' => 'Cliente solicitó devolución',
]);
// El observer automáticamente restaura el stock de todos los items
```

### 3. UserObserver
**Reemplaza:** `trg_before_user_insert` y `trg_before_user_update`

**Función:** Valida que los vendedores tengan tienda asignada y limpia store_id para otros roles.

```php
// Esto lanzará una excepción
User::create([
    'username' => 'vendedor1',
    'email' => 'vendedor@example.com',
    'password' => bcrypt('password'),
    'role' => 'vendedor',
    'store_id' => null, // ❌ Error: vendedor debe tener tienda
]);

// Esto funcionará correctamente
User::create([
    'username' => 'vendedor1',
    'email' => 'vendedor@example.com',
    'password' => bcrypt('password'),
    'role' => 'vendedor',
    'store_id' => 1, // ✅ Correcto
]);

// Esto limpiará automáticamente el store_id
User::create([
    'username' => 'admin1',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
    'role' => 'admin',
    'store_id' => 1, // El observer lo pondrá en null automáticamente
]);
```

### 4. CashRegisterObserver
**Reemplaza:** `trg_before_cash_register_close`

**Función:** Calcula automáticamente el balance esperado y la diferencia al cerrar caja.

```php
$cashRegister = CashRegister::find(1);
$cashRegister->update([
    'status' => 'cerrada',
    'closed_by' => auth()->id(),
    'closed_at' => now(),
    'closing_balance' => 5000.00,
]);
// El observer automáticamente calcula:
// - expected_balance = opening_balance + ventas en efectivo/mixto
// - difference = closing_balance - expected_balance
```

---

## 📊 Database Views (Modelos de Solo Lectura)

### 1. StoreInventoryView
**Reemplaza:** Vista SQL `v_store_inventory`

**Uso:**
```php
use App\Models\StoreInventoryView;

// Obtener todo el inventario de una tienda
$inventory = StoreInventoryView::byStore(1)->get();

// Productos con stock bajo
$lowStock = StoreInventoryView::lowStock()->get();

// Inventario de una tienda con stock bajo
$criticalItems = StoreInventoryView::byStore(1)
    ->lowStock()
    ->orderBy('stock', 'asc')
    ->get();

// Valor total del inventario
$totalValue = StoreInventoryView::byStore(1)->sum('inventory_value_sale');
```

**Campos disponibles:**
- `store_id`, `store_name`
- `product_id`, `sku`, `product_name`, `category_name`
- `stock`, `min_stock`, `sale_price`
- `inventory_value_cost`, `inventory_value_sale`

### 2. DailySalesSummaryView
**Reemplaza:** Vista SQL `v_daily_sales_summary`

**Uso:**
```php
use App\Models\DailySalesSummaryView;

// Resumen de ventas del mes actual
$monthlySales = DailySalesSummaryView::currentMonth()->get();

// Ventas de una tienda en un rango de fechas
$sales = DailySalesSummaryView::byStore(1)
    ->dateRange('2026-01-01', '2026-01-31')
    ->get();

// Total de ingresos del mes por tienda
$revenue = DailySalesSummaryView::byStore(1)
    ->currentMonth()
    ->sum('total_revenue');

// Ventas de hoy
$today = DailySalesSummaryView::whereDate('sale_date', today())->get();
```

**Campos disponibles:**
- `store_id`, `store_name`
- `sale_date`
- `total_sales` (cantidad de ventas)
- `total_revenue` (ingresos de ventas completadas)
- `total_cancelled` (total de ventas anuladas)

### 3. CashRegisterStatusView
**Reemplaza:** Vista SQL `v_cash_register_status`

**Uso:**
```php
use App\Models\CashRegisterStatusView;

// Cajas abiertas actualmente
$openRegisters = CashRegisterStatusView::open()->get();

// Cajas cerradas con discrepancia
$withDiscrepancy = CashRegisterStatusView::closed()
    ->withDiscrepancy()
    ->get();

// Historial de cajas de una tienda
$storeHistory = CashRegisterStatusView::byStore('Tienda Centro')
    ->orderBy('opened_at', 'desc')
    ->get();

// Cajas con diferencia mayor a $10
$significantDiscrepancies = CashRegisterStatusView::closed()
    ->whereRaw('ABS(difference) > 10')
    ->get();
```

**Campos disponibles:**
- `id`, `store_name`
- `opened_by`, `opened_at`, `opening_balance`
- `closed_by`, `closed_at`, `closing_balance`
- `expected_balance`, `difference`, `status`

---

## 🚀 Ventajas de esta Implementación

### Performance
- ✅ Las vistas SQL están optimizadas por el motor de base de datos
- ✅ Los observers solo se ejecutan cuando es necesario
- ✅ Queries más rápidos que múltiples JOINs en Eloquent

### Mantenibilidad
- ✅ Código PHP es más fácil de leer y debuggear que triggers SQL
- ✅ Los observers están en archivos separados y organizados
- ✅ Fácil agregar logging o notificaciones en observers

### Testing
- ✅ Cada observer puede testearse de forma aislada
- ✅ Las vistas pueden mockearse fácilmente en tests
- ✅ No dependes de triggers de base de datos en tests

### Flexibilidad
- ✅ Puedes agregar caché fácilmente en observers
- ✅ Las vistas pueden convertirse en materialized views si es necesario
- ✅ Funciona con cualquier base de datos compatible con Laravel

---

## 📝 Notas Importantes

1. **Los Observers están registrados automáticamente** en `AppServiceProvider`
2. **Las vistas son de solo lectura** - no intentes hacer `update()` o `delete()` en ellas
3. **Las transacciones son automáticas** - si un observer falla, Laravel hace rollback
4. **Los observers se ejecutan dentro de transacciones** - el stock se actualiza de forma atómica

---

## 🔄 Migración desde SQL Puro

Si ya tienes triggers en tu base de datos, **no necesitas eliminarlos manualmente**. Los observers de Laravel funcionarán en paralelo. Sin embargo, para evitar duplicación de lógica, es recomendable:

1. Ejecutar las migraciones de Laravel
2. Verificar que los observers funcionen correctamente
3. Eliminar los triggers SQL manualmente si lo deseas

Para las vistas, Laravel creará las vistas SQL automáticamente al ejecutar la migración `2026_01_16_000013_create_database_views.php`.
