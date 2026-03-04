-- Ejecuta esto en el editor SQL de Supabase para añadir roles a la tabla users

-- 1. Añadir columna role si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Actualizar usuario Admin existente o crearlo
INSERT INTO users (username, password, role)
VALUES ('Admin', '354', 'admin')
ON CONFLICT (username)
DO UPDATE SET password = '354', role = 'admin';

-- 3. Asegurar políticas RLS para usuarios
DROP POLICY IF EXISTS "Public Read Users" ON users;
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Update Users" ON users;
CREATE POLICY "Admin Update Users" ON users 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Verificar datos
SELECT * FROM users;
