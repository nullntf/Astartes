# Documentación de Controladores - Sistema POS

Este documento describe todos los controladores creados para el sistema POS multitienda.

## 📋 Controladores Creados (7 controladores)

### 1. StoreController
**Archivo:** `app/Http/Controllers/StoreController.php`

**Responsabilidad:** Gestión de tiendas (CRUD completo)

**Métodos:**
- `index()` - Lista todas las tiendas con paginación
- `create()` - Formulario para crear tienda
- `store()` - Guarda nueva tienda
- `show($store)` - Muestra detalles de tienda con productos, usuarios y cajas
- `edit($store)` - Formulario para editar tienda
- `update($store)` - Actualiza tienda existente
- `destroy($store)` - Elimina tienda

**Validaciones:**
- `name`: requerido, máx 100 caracteres
- `code`: requerido, único, máx 20 caracteres
- `address`: opcional
- `phone`: opcional, máx 20 caracteres
- `is_active`: boolean

**Auditoría:** Registra `created_by` y `updated_by` automáticamente

---

### 2. CategoryController
**Archivo:** `app/Http/Controllers/CategoryController.php`

**Responsabilidad:** Gestión de categorías de productos (CRUD completo)

**Métodos:**
- `index()` - Lista categorías con conteo de productos
- `create()` - Formulario para crear categoría
- `store()` - Guarda nueva categoría
- `show($category)` - Muestra categoría con productos activos
- `edit($category)` - Formulario para editar categoría
- `update($category)` - Actualiza categoría
- `destroy($category)` - Elimina categoría

**Validaciones:**
- `name`: requerido, máx 100 caracteres
- `description`: opcional
- `is_active`: boolean

**Auditoría:** Registra `created_by` y `updated_by` automáticamente

---

### 3. ProductController
**Archivo:** `app/Http/Controllers/ProductController.php`

**Responsabilidad:** Gestión de productos e inventario

**Métodos:**
- `index()` - Lista productos con filtros (búsqueda, categoría)
- `create()` - Formulario para crear producto
- `store()` - Guarda nuevo producto
- `show($product)` - Muestra producto con stock por tienda
- `edit($product)` - Formulario para editar producto
- `update($product)` - Actualiza producto
- `destroy($product)` - Elimina producto
- `assignToStore($product)` - Asigna producto a tienda con stock inicial

**Validaciones:**
- `category_id`: requerido, debe existir
- `sku`: requerido, único, máx 50 caracteres
- `name`: requerido, máx 200 caracteres
- `description`: opcional
- `cost_price`: requerido, numérico, mínimo 0
- `sale_price`: requerido, numérico, mínimo 0
- `is_active`: boolean

**Filtros disponibles:**
- `search`: busca en nombre y SKU
- `category_id`: filtra por categoría

**Auditoría:** Registra `created_by` y `updated_by` automáticamente

---

### 4. SaleController
**Archivo:** `app/Http/Controllers/SaleController.php`

**Responsabilidad:** Gestión de ventas y punto de venta

**Métodos:**
- `index()` - Lista ventas con filtros (tienda, estado, fechas)
- `create()` - Formulario POS para nueva venta
- `store()` - Procesa venta (transacción con items)
- `show($sale)` - Muestra detalles de venta con items
- `cancel($sale)` - Anula venta (restaura stock vía Observer)
- `getProductsByStore($store)` - API: obtiene productos disponibles por tienda

**Validaciones:**
- `store_id`: requerido, debe existir
- `cash_register_id`: requerido, debe existir
- `payment_method`: requerido, valores: efectivo, tarjeta, transferencia, mixto
- `items`: requerido, array mínimo 1 item
- `items.*.product_id`: requerido, debe existir
- `items.*.quantity`: requerido, entero mínimo 1
- `items.*.unit_price`: requerido, numérico mínimo 0
- `tax`: opcional, numérico mínimo 0
- `discount`: opcional, numérico mínimo 0

**Lógica de negocio:**
- Genera número de venta automático (formato: VTA00000001)
- Calcula subtotal, total con impuestos y descuentos
- Crea venta y items en transacción
- Observer `SaleItemObserver` reduce stock automáticamente
- Observer `SaleObserver` restaura stock al anular

**Filtros disponibles:**
- `store_id`: filtra por tienda
- `status`: completada o anulada
- `date_from`: fecha desde
- `date_to`: fecha hasta

---

### 5. CashRegisterController
**Archivo:** `app/Http/Controllers/CashRegisterController.php`

**Responsabilidad:** Gestión de cajas registradoras y movimientos de efectivo

**Métodos:**
- `index()` - Lista cajas con filtros (tienda, estado)
- `create()` - Formulario para abrir caja
- `store()` - Abre nueva caja (valida que no haya otra abierta)
- `show($cashRegister)` - Muestra caja con ventas, movimientos y balance actual
- `close($cashRegister)` - Cierra caja (Observer calcula expected_balance y difference)
- `addMovement($cashRegister)` - Registra depósito o retiro

**Validaciones (apertura):**
- `store_id`: requerido, debe existir
- `opening_balance`: requerido, numérico mínimo 0
- `notes`: opcional

**Validaciones (cierre):**
- `closing_balance`: requerido, numérico mínimo 0
- `notes`: opcional

**Validaciones (movimiento):**
- `type`: requerido, valores: deposito, retiro
- `amount`: requerido, numérico mínimo 0.01
- `reason`: requerido, máx 500 caracteres

**Lógica de negocio:**
- Solo permite una caja abierta por tienda
- Calcula balance actual: apertura + ventas + depósitos - retiros
- Observer `CashRegisterObserver` calcula automáticamente:
  - `expected_balance` = apertura + ventas en efectivo/mixto
  - `difference` = closing_balance - expected_balance
- No permite movimientos en cajas cerradas

**Filtros disponibles:**
- `store_id`: filtra por tienda
- `status`: abierta o cerrada

---

### 6. ExpenseController
**Archivo:** `app/Http/Controllers/ExpenseController.php`

**Responsabilidad:** Gestión de gastos por tienda

**Métodos:**
- `index()` - Lista gastos con filtros (tienda, estado, fechas)
- `create()` - Formulario para registrar gasto
- `store()` - Guarda gasto con items opcionales (transacción)
- `show($expense)` - Muestra gasto con items
- `edit($expense)` - Formulario para editar gasto (solo si está activo)
- `update($expense)` - Actualiza gasto y recrea items
- `cancel($expense)` - Anula gasto

**Validaciones:**
- `store_id`: requerido, debe existir
- `category`: requerido, máx 100 caracteres
- `description`: requerido
- `amount`: requerido, numérico mínimo 0
- `expense_date`: requerido, fecha
- `items`: opcional, array
- `items.*.description`: requerido, máx 200 caracteres
- `items.*.amount`: requerido, numérico mínimo 0

**Validaciones (anulación):**
- `cancellation_reason`: requerido, máx 500 caracteres

**Lógica de negocio:**
- Permite desglosar gastos en múltiples items
- No permite editar/actualizar gastos anulados
- Registra usuario que anuló y razón

**Filtros disponibles:**
- `store_id`: filtra por tienda
- `status`: activo o anulado
- `date_from`: fecha desde
- `date_to`: fecha hasta

---

### 7. DashboardController
**Archivo:** `app/Http/Controllers/DashboardController.php`

**Responsabilidad:** Dashboard principal con métricas y resúmenes

**Métodos:**
- `index()` - Muestra dashboard con métricas del día y mes

**Datos mostrados:**
- Ventas de hoy (por tienda si es vendedor)
- Ventas del mes actual
- Productos con stock bajo (top 10)
- Cajas abiertas actualmente
- Total de ingresos del día
- Total de ventas del día

**Lógica de negocio:**
- Si el usuario es vendedor, filtra automáticamente por su tienda asignada
- Si es admin/bodega, puede filtrar por tienda vía query param
- Usa las vistas SQL optimizadas:
  - `DailySalesSummaryView`
  - `StoreInventoryView`
  - `CashRegisterStatusView`

---

## 🔐 Seguridad y Autorización

**Todos los controladores requieren autenticación** (middleware `auth`).

**Recomendaciones para implementar:**
1. Agregar middleware de autorización por rol:
   - Admin: acceso completo
   - Bodega: gestión de inventario y productos
   - Vendedor: solo ventas de su tienda asignada

2. Políticas (Policies) sugeridas:
   - `StorePolicy` - Solo admin puede crear/editar/eliminar tiendas
   - `SalePolicy` - Vendedor solo ve ventas de su tienda
   - `CashRegisterPolicy` - Solo puede cerrar quien abrió la caja
   - `ExpensePolicy` - Solo admin puede gestionar gastos

---

## 📊 Uso de Database Views

Los controladores aprovechan las vistas SQL optimizadas:

```php
// Dashboard - Ventas del mes
DailySalesSummaryView::currentMonth()->get();

// Dashboard - Stock bajo
StoreInventoryView::lowStock()->limit(10)->get();

// Dashboard - Cajas abiertas
CashRegisterStatusView::open()->get();
```

---

## 🔄 Observers Integrados

Los controladores trabajan automáticamente con los Observers:

1. **SaleController** → `SaleObserver` + `SaleItemObserver`
   - Al crear venta: reduce stock automáticamente
   - Al anular venta: restaura stock automáticamente

2. **CashRegisterController** → `CashRegisterObserver`
   - Al cerrar caja: calcula expected_balance y difference automáticamente

3. **UserController** (pendiente) → `UserObserver`
   - Al crear/actualizar usuario: valida vendedor con tienda asignada

---

## 📝 Rutas Sugeridas

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('stores', StoreController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('products', ProductController::class);
    Route::post('products/{product}/assign-store', [ProductController::class, 'assignToStore'])
        ->name('products.assign-store');
    
    Route::resource('sales', SaleController::class)->only(['index', 'create', 'store', 'show']);
    Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
    Route::get('stores/{store}/products', [SaleController::class, 'getProductsByStore'])
        ->name('stores.products');
    
    Route::resource('cash-registers', CashRegisterController::class)
        ->only(['index', 'create', 'store', 'show']);
    Route::post('cash-registers/{cashRegister}/close', [CashRegisterController::class, 'close'])
        ->name('cash-registers.close');
    Route::post('cash-registers/{cashRegister}/movements', [CashRegisterController::class, 'addMovement'])
        ->name('cash-registers.movements');
    
    Route::resource('expenses', ExpenseController::class);
    Route::post('expenses/{expense}/cancel', [ExpenseController::class, 'cancel'])
        ->name('expenses.cancel');
});
```

---

## ✅ Resumen

| Controlador | Métodos | Validaciones | Observers | Vistas SQL |
|-------------|---------|--------------|-----------|------------|
| StoreController | 7 | ✅ | - | - |
| CategoryController | 7 | ✅ | - | - |
| ProductController | 8 | ✅ | - | - |
| SaleController | 6 | ✅ | ✅ | - |
| CashRegisterController | 6 | ✅ | ✅ | - |
| ExpenseController | 7 | ✅ | - | - |
| DashboardController | 1 | - | - | ✅ |

**Total:** 7 controladores, 42 métodos públicos

---

## 🚀 Próximos Pasos

1. **Crear vistas Inertia/React** para cada controlador
2. **Implementar Policies** para autorización por rol
3. **Agregar FormRequests** para validaciones más complejas
4. **Crear tests** para cada controlador
5. **Implementar API endpoints** si se requiere app móvil
