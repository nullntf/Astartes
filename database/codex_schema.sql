-- ============================================
-- SISTEMA DE GESTIÓN DE INVENTARIO Y POS MULTI-TIENDA
-- ============================================

-- TABLA: users
-- Almacena todos los usuarios del sistema (admin, bodega, vendedor)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'bodega', 'vendedor') NOT NULL,
    store_id INT NULL, -- Solo para vendedores (tienda asignada)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_store_id (store_id),
    INDEX idx_active (is_active)
);

-- TABLA: stores
-- Gestión de tiendas
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_active (is_active),
    INDEX idx_code (code)
);

-- TABLA: categories
-- Categorías de productos
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_active (is_active)
);

-- TABLA: products
-- Productos del inventario
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    cost_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_sku (sku)
);

-- TABLA: store_product (TABLA ASOCIATIVA)
-- Asigna stock de productos a cada tienda
CREATE TABLE store_product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 0, -- Stock mínimo para alertas
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_store_product (store_id, product_id),
    INDEX idx_store (store_id),
    INDEX idx_product (product_id),
    INDEX idx_stock (stock)
);

-- TABLA: cash_registers
-- Cajas registradoras (una por tienda)
CREATE TABLE cash_registers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    opened_by INT NOT NULL, -- Usuario que abrió la caja
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opening_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    closed_by INT NULL, -- Usuario que cerró la caja
    closed_at TIMESTAMP NULL,
    closing_balance DECIMAL(10, 2) NULL,
    expected_balance DECIMAL(10, 2) NULL, -- Balance esperado según ventas
    difference DECIMAL(10, 2) NULL, -- Diferencia (cuadre)
    status ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    notes TEXT,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (opened_by) REFERENCES users(id),
    FOREIGN KEY (closed_by) REFERENCES users(id),
    INDEX idx_store (store_id),
    INDEX idx_status (status),
    INDEX idx_opened_at (opened_at)
);

-- TABLA: cash_movements
-- Movimientos de efectivo en la caja (retiros/depósitos)
-- Estos NO afectan el cuadre de caja
CREATE TABLE cash_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cash_register_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('deposito', 'retiro') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cash_register (cash_register_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- TABLA: sales
-- Ventas realizadas
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    cash_register_id INT NOT NULL,
    user_id INT NOT NULL, -- Vendedor que realizó la venta
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') NOT NULL,
    status ENUM('completada', 'anulada') DEFAULT 'completada',
    cancelled_by INT NULL, -- Usuario que anuló
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id),
    INDEX idx_store (store_id),
    INDEX idx_cash_register (cash_register_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_sale_number (sale_number)
);

-- TABLA: sale_items
-- Detalles de productos vendidos
CREATE TABLE sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sale (sale_id),
    INDEX idx_product (product_id)
);

-- TABLA: expenses
-- Gastos por tienda
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    user_id INT NOT NULL, -- Admin que registró el gasto
    category VARCHAR(100) NOT NULL, -- Ej: servicios, mantenimiento, etc.
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('activo', 'anulado') DEFAULT 'activo',
    cancelled_by INT NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id),
    INDEX idx_store (store_id),
    INDEX idx_status (status),
    INDEX idx_expense_date (expense_date),
    INDEX idx_created_at (created_at)
);

-- TABLA: expenses_items (OPCIONAL)
-- Si necesitas detallar gastos con múltiples items
CREATE TABLE expenses_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expense_id INT NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_expense (expense_id)
);

-- ============================================
-- TRIGGERS
-- ============================================

-- TRIGGER: Actualizar stock al realizar una venta
DELIMITER //
CREATE TRIGGER trg_after_sale_item_insert
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
    DECLARE v_store_id INT;
    
    -- Obtener la tienda de la venta
    SELECT store_id INTO v_store_id
    FROM sales
    WHERE id = NEW.sale_id;
    
    -- Reducir el stock en store_product
    UPDATE store_product
    SET stock = stock - NEW.quantity
    WHERE store_id = v_store_id AND product_id = NEW.product_id;
END//
DELIMITER ;

-- TRIGGER: Restaurar stock al anular una venta
DELIMITER //
CREATE TRIGGER trg_after_sale_cancelled
AFTER UPDATE ON sales
FOR EACH ROW
BEGIN
    IF NEW.status = 'anulada' AND OLD.status = 'completada' THEN
        -- Restaurar el stock de todos los items de la venta
        UPDATE store_product sp
        INNER JOIN sale_items si ON sp.product_id = si.product_id
        SET sp.stock = sp.stock + si.quantity
        WHERE si.sale_id = NEW.id AND sp.store_id = NEW.store_id;
    END IF;
END//
DELIMITER ;

-- TRIGGER: Validar que vendedor tenga tienda asignada
DELIMITER //
CREATE TRIGGER trg_before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'vendedor' AND NEW.store_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un vendedor debe tener una tienda asignada';
    END IF;
    
    IF NEW.role != 'vendedor' AND NEW.store_id IS NOT NULL THEN
        SET NEW.store_id = NULL;
    END IF;
END//
DELIMITER ;

-- TRIGGER: Validar al actualizar usuarios
DELIMITER //
CREATE TRIGGER trg_before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'vendedor' AND NEW.store_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un vendedor debe tener una tienda asignada';
    END IF;
    
    IF NEW.role != 'vendedor' AND NEW.store_id IS NOT NULL THEN
        SET NEW.store_id = NULL;
    END IF;
END//
DELIMITER ;

-- TRIGGER: Calcular balance esperado al cerrar caja
DELIMITER //
CREATE TRIGGER trg_before_cash_register_close
BEFORE UPDATE ON cash_registers
FOR EACH ROW
BEGIN
    IF NEW.status = 'cerrada' AND OLD.status = 'abierta' THEN
        -- Calcular ventas totales en efectivo
        SELECT COALESCE(SUM(total), 0) INTO @total_ventas
        FROM sales
        WHERE cash_register_id = NEW.id 
        AND status = 'completada'
        AND payment_method IN ('efectivo', 'mixto');
        
        -- Calcular retiros
        SELECT COALESCE(SUM(amount), 0) INTO @total_retiros
        FROM cash_movements
        WHERE cash_register_id = NEW.id AND type = 'retiro';
        
        -- Calcular depósitos
        SELECT COALESCE(SUM(amount), 0) INTO @total_depositos
        FROM cash_movements
        WHERE cash_register_id = NEW.id AND type = 'deposito';
        
        -- Balance esperado = apertura + ventas (sin contar retiros/depósitos)
        SET NEW.expected_balance = NEW.opening_balance + @total_ventas;
        
        -- Diferencia = balance real - balance esperado
        SET NEW.difference = NEW.closing_balance - NEW.expected_balance;
    END IF;
END//
DELIMITER ;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Inventario por tienda
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
WHERE s.is_active = TRUE AND p.is_active = TRUE;

-- Vista: Ventas por tienda (resumen diario)
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
GROUP BY s.store_id, st.name, DATE(s.created_at);

-- Vista: Estado de cajas
CREATE VIEW v_cash_register_status AS
SELECT 
    cr.id,
    s.name AS store_name,
    u1.full_name AS opened_by,
    cr.opened_at,
    cr.opening_balance,
    u2.full_name AS closed_by,
    cr.closed_at,
    cr.closing_balance,
    cr.expected_balance,
    cr.difference,
    cr.status
FROM cash_registers cr
INNER JOIN stores s ON cr.store_id = s.id
INNER JOIN users u1 ON cr.opened_by = u1.id
LEFT JOIN users u2 ON cr.closed_by = u2.id;

-- ============================================
-- CONSTRAINT ADICIONAL
-- ============================================

-- Agregar foreign key de users a stores
ALTER TABLE users
ADD CONSTRAINT fk_users_store
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;