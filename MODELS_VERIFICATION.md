# Verificación de Modelos Eloquent

Este documento confirma que todos los modelos están correctamente configurados según las migraciones del sistema POS.

## ✅ Modelos Verificados (13 modelos)

### 1. User (`app/Models/User.php`)
**Migración:** `2026_01_16_000001_update_users_table_for_pos.php`

**Campos fillable:**
- ✅ `username`, `name`, `email`, `password`
- ✅ `role` (admin, bodega, vendedor)
- ✅ `store_id` (nullable, FK a stores)
- ✅ `is_active`

**Relaciones:**
- ✅ `store()` - BelongsTo Store
- ✅ `sales()` - HasMany Sale
- ✅ `expenses()` - HasMany Expense
- ✅ `openedCashRegisters()` - HasMany CashRegister (opened_by)
- ✅ `closedCashRegisters()` - HasMany CashRegister (closed_by)
- ✅ `cashMovements()` - HasMany CashMovement

**Casts:**
- ✅ `is_active` → boolean
- ✅ `email_verified_at` → datetime
- ✅ `password` → hashed

---

### 2. Store (`app/Models/Store.php`)
**Migración:** `2026_01_16_000002_create_stores_table.php`

**Campos fillable:**
- ✅ `name`, `code`, `address`, `phone`
- ✅ `is_active`
- ✅ `created_by`, `updated_by` (FK a users)

**Relaciones:**
- ✅ `products()` - BelongsToMany Product (pivot: store_product)
- ✅ `users()` - HasMany User
- ✅ `sales()` - HasMany Sale
- ✅ `cashRegisters()` - HasMany CashRegister
- ✅ `expenses()` - HasMany Expense
- ✅ `createdBy()` - BelongsTo User
- ✅ `updatedBy()` - BelongsTo User

**Casts:**
- ✅ `is_active` → boolean

---

### 3. Category (`app/Models/Category.php`)
**Migración:** `2026_01_16_000004_create_categories_table.php`

**Campos fillable:**
- ✅ `name`, `description`
- ✅ `is_active`
- ✅ `created_by`, `updated_by`

**Relaciones:**
- ✅ `products()` - HasMany Product
- ✅ `createdBy()` - BelongsTo User
- ✅ `updatedBy()` - BelongsTo User

**Casts:**
- ✅ `is_active` → boolean

---

### 4. Product (`app/Models/Product.php`)
**Migración:** `2026_01_16_000005_create_products_table.php`

**Campos fillable:**
- ✅ `category_id`, `sku`, `name`, `description`
- ✅ `cost_price`, `sale_price`
- ✅ `is_active`
- ✅ `created_by`, `updated_by`

**Relaciones:**
- ✅ `category()` - BelongsTo Category
- ✅ `stores()` - BelongsToMany Store (pivot: store_product)
- ✅ `saleItems()` - HasMany SaleItem
- ✅ `createdBy()` - BelongsTo User
- ✅ `updatedBy()` - BelongsTo User

**Casts:**
- ✅ `cost_price` → decimal:2
- ✅ `sale_price` → decimal:2
- ✅ `is_active` → boolean

---

### 5. StoreProduct (Tabla Pivot)
**Migración:** `2026_01_16_000006_create_store_product_table.php`

**Nota:** No requiere modelo dedicado, se maneja via `withPivot()` en relaciones BelongsToMany.

**Campos pivot:**
- ✅ `stock`, `min_stock`
- ✅ `created_by`, `updated_by`

---

### 6. CashRegister (`app/Models/CashRegister.php`)
**Migración:** `2026_01_16_000007_create_cash_registers_table.php`

**Campos fillable:**
- ✅ `store_id`, `opened_by`, `opened_at`, `opening_balance`
- ✅ `closed_by`, `closed_at`, `closing_balance`
- ✅ `expected_balance`, `difference`
- ✅ `status` (abierta, cerrada)
- ✅ `notes`

**Relaciones:**
- ✅ `store()` - BelongsTo Store
- ✅ `openedBy()` - BelongsTo User
- ✅ `closedBy()` - BelongsTo User
- ✅ `sales()` - HasMany Sale
- ✅ `cashMovements()` - HasMany CashMovement

**Casts:**
- ✅ `opened_at` → datetime
- ✅ `closed_at` → datetime
- ✅ `opening_balance`, `closing_balance`, `expected_balance`, `difference` → decimal:2

**Timestamps:** Deshabilitados (`public $timestamps = false`)

---

### 7. CashMovement (`app/Models/CashMovement.php`)
**Migración:** `2026_01_16_000008_create_cash_movements_table.php`

**Campos fillable:**
- ✅ `cash_register_id`, `user_id`
- ✅ `type` (deposito, retiro)
- ✅ `amount`, `reason`
- ✅ `created_by`

**Relaciones:**
- ✅ `cashRegister()` - BelongsTo CashRegister
- ✅ `user()` - BelongsTo User
- ✅ `createdBy()` - BelongsTo User

**Casts:**
- ✅ `amount` → decimal:2

**Timestamps:** Solo `created_at`

---

### 8. Sale (`app/Models/Sale.php`)
**Migración:** `2026_01_16_000009_create_sales_table.php`

**Campos fillable:**
- ✅ `store_id`, `cash_register_id`, `user_id`
- ✅ `sale_number`, `subtotal`, `tax`, `discount`, `total`
- ✅ `payment_method` (efectivo, tarjeta, transferencia, mixto)
- ✅ `status` (completada, anulada)
- ✅ `cancelled_by`, `cancelled_at`, `cancellation_reason`

**Relaciones:**
- ✅ `store()` - BelongsTo Store
- ✅ `cashRegister()` - BelongsTo CashRegister
- ✅ `user()` - BelongsTo User
- ✅ `cancelledBy()` - BelongsTo User
- ✅ `items()` - HasMany SaleItem

**Casts:**
- ✅ `subtotal`, `tax`, `discount`, `total` → decimal:2
- ✅ `cancelled_at` → datetime

---

### 9. SaleItem (`app/Models/SaleItem.php`)
**Migración:** `2026_01_16_000010_create_sale_items_table.php`

**Campos fillable:**
- ✅ `sale_id`, `product_id`
- ✅ `quantity`, `unit_price`, `subtotal`
- ✅ `created_by`

**Relaciones:**
- ✅ `sale()` - BelongsTo Sale
- ✅ `product()` - BelongsTo Product
- ✅ `createdBy()` - BelongsTo User

**Casts:**
- ✅ `quantity` → integer
- ✅ `unit_price`, `subtotal` → decimal:2

**Timestamps:** Solo `created_at`

---

### 10. Expense (`app/Models/Expense.php`)
**Migración:** `2026_01_16_000011_create_expenses_table.php`

**Campos fillable:**
- ✅ `store_id`, `user_id`
- ✅ `category`, `description`, `amount`
- ✅ `status` (activo, anulado)
- ✅ `cancelled_by`, `cancelled_at`, `cancellation_reason`
- ✅ `expense_date`

**Relaciones:**
- ✅ `store()` - BelongsTo Store
- ✅ `user()` - BelongsTo User
- ✅ `cancelledBy()` - BelongsTo User
- ✅ `items()` - HasMany ExpenseItem

**Casts:**
- ✅ `amount` → decimal:2
- ✅ `expense_date` → date
- ✅ `cancelled_at` → datetime

---

### 11. ExpenseItem (`app/Models/ExpenseItem.php`)
**Migración:** `2026_01_16_000012_create_expenses_items_table.php`

**Tabla:** `expenses_items`

**Campos fillable:**
- ✅ `expense_id`, `description`, `amount`
- ✅ `created_by`

**Relaciones:**
- ✅ `expense()` - BelongsTo Expense
- ✅ `createdBy()` - BelongsTo User

**Casts:**
- ✅ `amount` → decimal:2

**Timestamps:** Solo `created_at`

---

### 12. StoreInventoryView (`app/Models/StoreInventoryView.php`)
**Migración:** `2026_01_16_000013_create_database_views.php`

**Vista SQL:** `v_store_inventory`

**Campos (solo lectura):**
- ✅ `store_id`, `store_name`
- ✅ `product_id`, `sku`, `product_name`, `category_name`
- ✅ `stock`, `min_stock`, `sale_price`
- ✅ `inventory_value_cost`, `inventory_value_sale`

**Scopes:**
- ✅ `lowStock()` - Productos con stock <= min_stock
- ✅ `byStore($storeId)` - Filtrar por tienda

---

### 13. DailySalesSummaryView (`app/Models/DailySalesSummaryView.php`)
**Migración:** `2026_01_16_000013_create_database_views.php`

**Vista SQL:** `v_daily_sales_summary`

**Campos (solo lectura):**
- ✅ `store_id`, `store_name`
- ✅ `sale_date`, `total_sales`
- ✅ `total_revenue`, `total_cancelled`

**Scopes:**
- ✅ `byStore($storeId)` - Filtrar por tienda
- ✅ `dateRange($start, $end)` - Rango de fechas
- ✅ `currentMonth()` - Mes actual

---

### 14. CashRegisterStatusView (`app/Models/CashRegisterStatusView.php`)
**Migración:** `2026_01_16_000013_create_database_views.php`

**Vista SQL:** `v_cash_register_status`

**Campos (solo lectura):**
- ✅ `id`, `store_name`
- ✅ `opened_by`, `opened_at`, `opening_balance`
- ✅ `closed_by`, `closed_at`, `closing_balance`
- ✅ `expected_balance`, `difference`, `status`

**Scopes:**
- ✅ `open()` - Cajas abiertas
- ✅ `closed()` - Cajas cerradas
- ✅ `byStore($storeName)` - Filtrar por nombre de tienda
- ✅ `withDiscrepancy()` - Cajas con diferencia != 0

---

## 📊 Resumen de Verificación

| Modelo | Migración | Fillable | Relaciones | Casts | Estado |
|--------|-----------|----------|------------|-------|--------|
| User | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| Store | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| Category | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| Product | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| CashRegister | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| CashMovement | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| Sale | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| SaleItem | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| Expense | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| ExpenseItem | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| StoreInventoryView | ✅ | N/A | N/A | ✅ | ✅ Completo |
| DailySalesSummaryView | ✅ | N/A | N/A | ✅ | ✅ Completo |
| CashRegisterStatusView | ✅ | N/A | N/A | ✅ | ✅ Completo |

---

## ✅ Conclusión

**Todos los modelos están correctamente configurados y coinciden con las migraciones.**

- ✅ 13 modelos creados
- ✅ Todos los campos fillable coinciden con las migraciones
- ✅ Todas las relaciones Eloquent están definidas
- ✅ Todos los casts de tipos de datos están configurados
- ✅ Observers registrados en AppServiceProvider
- ✅ Database views creadas y modelos de solo lectura configurados

**No se requieren cambios adicionales en los modelos.**
