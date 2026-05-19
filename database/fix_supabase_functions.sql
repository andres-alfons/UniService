-- =====================================================
-- FIX: Limpieza automática y recreación de funciones
-- =====================================================

-- PASO 1: Eliminar AUTOMÁTICAMENTE todas las versiones duplicadas
-- Este bloque busca todas las funciones conflictivas y las borra una por una
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
                   n.nspname, 
                   p.proname, 
                   pg_get_function_identity_arguments(p.oid)) as drop_stmt
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname IN ('sp_gestionarsolicitud', 'sp_crearusuario', 'sp_crearservicio', 'sp_actualizarusuario')
          AND n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Eliminando: %', r.drop_stmt;
        EXECUTE r.drop_stmt;
    END LOOP;
END $$;

-- PASO 2: Crear las versiones corregidas con tipos TEXT (compatibles con .NET)

-- 1. sp_gestionarsolicitud
CREATE OR REPLACE FUNCTION public.sp_gestionarsolicitud(
    p_id_cliente INT,
    p_id_proveedor INT,
    p_id_servicio INT,
    p_tipo_servicio TEXT,
    p_tema TEXT,
    p_descripcion TEXT,
    p_fecha_deseada DATE,
    p_hora_deseada TIME,
    p_duracion TEXT,
    p_modalidad TEXT,
    p_metodo_pago TEXT,
    p_presupuesto NUMERIC,
    p_urgencia TEXT,
    p_pago_anticipado BOOLEAN DEFAULT FALSE,
    p_archivo TEXT DEFAULT NULL
)
RETURNS TABLE(Resultado TEXT, id_solicitud INT) AS $$
BEGIN
    IF p_id_cliente = p_id_proveedor THEN
        RAISE EXCEPTION 'No puedes solicitar tu propio servicio.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM solicitudes
        WHERE id_cliente = p_id_cliente
          AND id_servicio = p_id_servicio
          AND estado = 'Pendiente'
    ) THEN
        RAISE EXCEPTION 'Ya tienes una solicitud pendiente para este servicio.';
    END IF;

    RETURN QUERY
    INSERT INTO solicitudes (
        id_cliente, id_proveedor, id_servicio, fue_aceptada,
        tipo_servicio, tema, descripcion,
        fecha_deseada, hora_deseada, duracion, modalidad,
        metodo_pago, presupuesto, pago_anticipado,
        urgencia, archivo, estado
    ) VALUES (
        p_id_cliente, p_id_proveedor, p_id_servicio, FALSE,
        p_tipo_servicio, p_tema, p_descripcion,
        p_fecha_deseada, p_hora_deseada, p_duracion, p_modalidad,
        p_metodo_pago, p_presupuesto, p_pago_anticipado,
        p_urgencia, p_archivo, 'Pendiente'
    )
    RETURNING 'Solicitud enviada correctamente'::TEXT, solicitudes.id_solicitud;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2. sp_crearusuario
CREATE OR REPLACE FUNCTION public.sp_crearusuario(
    p_correo TEXT,
    p_password_hash TEXT,
    p_nombre TEXT,
    p_telefono TEXT DEFAULT NULL,
    p_universidad TEXT DEFAULT 'Sin universidad'
)
RETURNS TABLE(id_usuario INT) AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM usuarios WHERE correo = p_correo) THEN
        RAISE EXCEPTION 'Este correo electrónico ya se encuentra registrado.';
    END IF;

    INSERT INTO usuarios (telefono, password_hash, nombre, correo, id_rol, universidad)
    VALUES (p_telefono, p_password_hash, p_nombre, p_correo, 2, p_universidad)
    RETURNING usuarios.id_usuario INTO id_usuario;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 3. sp_crearservicio
CREATE OR REPLACE FUNCTION public.sp_crearservicio(
    p_id_proveedor INT,
    p_titulo TEXT,
    p_descripcion TEXT,
    p_id_categoria INT,
    p_precio_hora NUMERIC,
    p_contacto TEXT,
    p_modalidad INT,
    p_disponibilidad INT,
    p_icono TEXT
)
RETURNS TABLE(nuevo_servicio_id INT) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_proveedor) THEN
        RAISE EXCEPTION 'El proveedor especificado no existe.';
    END IF;

    INSERT INTO servicios (id_proveedor, titulo, descripcion, id_categoria, precio_hora, contacto, modalidad, disponibilidad, icono)
    VALUES (p_id_proveedor, p_titulo, p_descripcion, p_id_categoria, p_precio_hora, p_contacto, p_modalidad, p_disponibilidad, p_icono)
    RETURNING servicios.id_servicio INTO nuevo_servicio_id;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 4. sp_actualizarusuario
CREATE OR REPLACE FUNCTION public.sp_actualizarusuario(
    p_id_usuario INT,
    p_telefono TEXT DEFAULT NULL,
    p_password_hash TEXT DEFAULT NULL,
    p_nombre TEXT DEFAULT NULL,
    p_descripcion TEXT DEFAULT NULL,
    p_correo TEXT DEFAULT NULL,
    p_estado BOOLEAN DEFAULT NULL,
    p_bloqueado BOOLEAN DEFAULT NULL,
    p_universidad TEXT DEFAULT NULL,
    p_avatar TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        RAISE EXCEPTION 'El usuario con el ID proporcionado no existe.';
    END IF;

    IF p_correo IS NOT NULL AND EXISTS (
        SELECT 1 FROM usuarios WHERE correo = p_correo AND id_usuario <> p_id_usuario
    ) THEN
        RAISE EXCEPTION 'El nuevo correo electrónico ya está registrado por otro usuario.';
    END IF;

    UPDATE usuarios
    SET 
        telefono      = COALESCE(p_telefono, telefono),
        password_hash = COALESCE(p_password_hash, password_hash),
        nombre        = COALESCE(p_nombre, nombre),
        descripcion   = COALESCE(p_descripcion, descripcion),
        correo        = COALESCE(p_correo, correo),
        estado        = COALESCE(p_estado, estado),
        bloqueado     = COALESCE(p_bloqueado, bloqueado),
        universidad   = COALESCE(p_universidad, universidad),
        avatar        = COALESCE(p_avatar, avatar)
    WHERE id_usuario = p_id_usuario;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
    proname AS nombre_funcion,
    pg_get_function_arguments(oid) AS argumentos
FROM 
    pg_proc 
WHERE 
    proname = 'sp_gestionarsolicitud';
