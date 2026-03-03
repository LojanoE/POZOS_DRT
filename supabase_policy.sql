-- EJECUTA ESTO EN EL EDITOR SQL DE SUPABASE
-- Esto permite que el formulario web (que es público) pueda leer y escribir datos.

-- 1. Habilitar la seguridad a nivel de fila (es una buena práctica, aunque la dejaremos pública por ahora)
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- 2. Crear una política para permitir que CUALQUIERA (público/anon) pueda VER (SELECT) los datos
CREATE POLICY "Permitir lectura publica" 
ON inspections 
FOR SELECT 
USING (true);

-- 3. Crear una política para permitir que CUALQUIERA (público/anon) pueda INSERTAR (INSERT) datos
CREATE POLICY "Permitir insercion publica" 
ON inspections 
FOR INSERT 
WITH CHECK (true);

-- 4. Crear una política para permitir que CUALQUIERA (público/anon) pueda ACTUALIZAR (UPDATE) datos
CREATE POLICY "Permitir actualizacion publica" 
ON inspections 
FOR UPDATE 
USING (true);

-- --- NUEVAS POLÍTICAS PARA pump_records ---
ALTER TABLE pump_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica pump_records" 
ON pump_records FOR SELECT USING (true);

CREATE POLICY "Permitir insercion publica pump_records" 
ON pump_records FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizacion publica pump_records" 
ON pump_records FOR UPDATE USING (true);
