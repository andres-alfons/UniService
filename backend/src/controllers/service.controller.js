import sql from "mssql";
import { pool } from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "imagenes-servicios");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadImagenes = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split("/")[1]);
    if (ext && mime) cb(null, true);
    else cb(new Error("Solo se permiten imagenes (jpg, png, webp)"));
  },
});

// 🔹 OBTENER SERVICIO (UNO O TODOS)
export const getServices = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool;

    if (id) {
      const result = await conn.request().input("id", sql.Int, parseInt(id))
        .query(`
          SELECT 
            s.*,
            u.nombre AS proveedor,
            c.nombre_categoria
          FROM servicios s
          LEFT JOIN usuarios u ON s.id_proveedor = u.id_usuario
          LEFT JOIN categorias c ON s.id_categoria = c.id_categoria
          WHERE s.id_servicio = @id
        `);

      const servicio = result.recordset[0];
      if (!servicio)
        return res.status(404).json({ error: "Servicio no encontrado" });

      const resenas = await conn.request().input("id", sql.Int, parseInt(id))
        .query(`
          SELECT 
            c.puntuacion,
            c.comentario,
            c.fecha_calificacion AS fecha,
            u.nombre AS autor
          FROM calificaciones c
          INNER JOIN usuarios u ON u.id_usuario = c.id_cliente
          WHERE c.id_servicio = @id
        `);

      const imagenes = await conn.request().input("id", sql.Int, parseInt(id))
        .query(`
          SELECT id_imagen, url_imagen, es_principal, fecha_subida
          FROM servicios_imagenes
          WHERE id_servicio = @id
          ORDER BY es_principal DESC, fecha_subida ASC
        `);

      return res.json({
        ...servicio,
        resenas: resenas.recordset,
        estrellas: resenas.recordset.map((r) => r.puntuacion),
        imagenes: imagenes.recordset,
      });
    }

    // 🔹 TODOS LOS SERVICIOS
    const result = await conn.request().query(`
      SELECT 
        s.*,
        u.nombre AS proveedor,
        c.nombre_categoria
      FROM servicios s
      LEFT JOIN usuarios u ON s.id_proveedor = u.id_usuario
      LEFT JOIN categorias c ON s.id_categoria = c.id_categoria
    `);

    const servicios = await Promise.all(
      result.recordset.map(async (servicio) => {
        const imgs = await conn.request()
          .input("id", sql.Int, servicio.id_servicio)
          .query(`
            SELECT id_imagen, url_imagen, es_principal
            FROM servicios_imagenes
            WHERE id_servicio = @id
            ORDER BY es_principal DESC, fecha_subida ASC
          `);
        return { ...servicio, imagenes: imgs.recordset };
      })
    );

    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CREAR SERVICIO
export const createService = async (req, res) => {
  try {
    const {
      id_proveedor,
      titulo,
      descripcion,
      id_categoria,
      precio_hora,
      contacto,
      modalidad,
      icono,
      disponibilidad,
    } = req.body;

    const conn = await pool; // ✅

    await conn
      .request()
      .input("id_proveedor", sql.Int, id_proveedor)
      .input("titulo", sql.NVarChar, titulo)
      .input("descripcion", sql.NVarChar, descripcion)
      .input("id_categoria", sql.Int, id_categoria)
      .input("precio_hora", sql.Decimal(10, 2), precio_hora)
      .input("contacto", sql.NVarChar, contacto)
      .input("modalidad", sql.Int, modalidad)
      .input("icono", sql.NVarChar, icono)
      .input("disponibilidad", sql.Int, disponibilidad).query(`
        INSERT INTO servicios
          (id_proveedor, titulo, descripcion, id_categoria, precio_hora, contacto, modalidad, icono, disponibilidad)
        VALUES
          (@id_proveedor, @titulo, @descripcion, @id_categoria, @precio_hora, @contacto, @modalidad, @icono, @disponibilidad)
      `);

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// EDITAR SERVICIO
export const editarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      id_categoria,
      precio_hora,
      contacto,
      modalidad,
      icono,
      disponibilidad,
      id_proveedor,
    } = req.body;

    const conn = await pool;

    const check = await conn
      .request()
      .input("id", sql.Int, parseInt(id))
      .input("id_proveedor", sql.Int, id_proveedor)
      .query(
        "SELECT id_servicio FROM servicios WHERE id_servicio = @id AND id_proveedor = @id_proveedor",
      );

    if (check.recordset.length === 0)
      return res
        .status(403)
        .json({ error: "No tienes permiso para editar este servicio." });

    await conn
      .request()
      .input("id", sql.Int, parseInt(id))
      .input("titulo", sql.NVarChar, titulo)
      .input("descripcion", sql.NVarChar, descripcion)
      .input("id_categoria", sql.Int, id_categoria)
      .input("precio_hora", sql.Decimal(10, 2), precio_hora)
      .input("contacto", sql.NVarChar, contacto)
      .input("modalidad", sql.Int, modalidad)
      .input("icono", sql.NVarChar, icono)
      .input("disponibilidad", sql.Int, disponibilidad).query(`
        UPDATE servicios SET
          titulo         = @titulo,
          descripcion    = @descripcion,
          id_categoria   = @id_categoria,
          precio_hora    = @precio_hora,
          contacto       = @contacto,
          modalidad      = @modalidad,
          icono          = @icono,
          disponibilidad = @disponibilidad
        WHERE id_servicio = @id
      `);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ELIMINAR SERVICIO
export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_proveedor } = req.body;

    const conn = await pool;

    const check = await conn
      .request()
      .input("id", sql.Int, parseInt(id))
      .input("id_proveedor", sql.Int, id_proveedor)
      .query(
        "SELECT id_servicio FROM servicios WHERE id_servicio = @id AND id_proveedor = @id_proveedor",
      );

    if (check.recordset.length === 0)
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar este servicio." });

    // Primero elimina las solicitudes asociadas
    await conn
      .request()
      .input("id", sql.Int, parseInt(id))
      .query("DELETE FROM solicitudes WHERE id_servicio = @id");

    // Luego elimina el servicio
    await conn
      .request()
      .input("id", sql.Int, parseInt(id))
      .query("DELETE FROM servicios WHERE id_servicio = @id");

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 SUBIR IMÁGENES DE UN SERVICIO
export const subirImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool;

    const check = await conn.request()
      .input("id", sql.Int, parseInt(id))
      .query("SELECT id_servicio FROM servicios WHERE id_servicio = @id");

    if (check.recordset.length === 0)
      return res.status(404).json({ error: "Servicio no encontrado" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No se enviaron imagenes" });

    const countResult = await conn.request()
      .input("id", sql.Int, parseInt(id))
      .query("SELECT COUNT(*) as total FROM servicios_imagenes WHERE id_servicio = @id");

    if (countResult.recordset[0].total + req.files.length > 5)
      return res.status(400).json({ error: "Maximo 5 imagenes permitidas" });

    const imagenesInsertadas = [];
    for (const file of req.files) {
      const url = `/imagenes-servicios/${file.filename}`;
      const esPrincipal = countResult.recordset[0].total === 0 && imagenesInsertadas.length === 0;

      await conn.request()
        .input("id_servicio", sql.Int, parseInt(id))
        .input("url", sql.NVarChar, url)
        .input("es_principal", sql.Bit, esPrincipal ? 1 : 0)
        .query(`
          INSERT INTO servicios_imagenes (id_servicio, url_imagen, es_principal)
          VALUES (@id_servicio, @url, @es_principal)
        `);

      imagenesInsertadas.push({ url_imagen: url, es_principal: esPrincipal });
    }

    res.status(201).json({ ok: true, imagenes: imagenesInsertadas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ELIMINAR IMAGEN DE UN SERVICIO
export const eliminarImagen = async (req, res) => {
  try {
    const { idServicio, idImagen } = req.params;
    const conn = await pool;

    const imgResult = await conn.request()
      .input("idImagen", sql.Int, parseInt(idImagen))
      .input("idServicio", sql.Int, parseInt(idServicio))
      .query("SELECT url_imagen FROM servicios_imagenes WHERE id_imagen = @idImagen AND id_servicio = @idServicio");

    if (imgResult.recordset.length === 0)
      return res.status(404).json({ error: "Imagen no encontrada" });

    const url = imgResult.recordset[0].url_imagen;

    await conn.request()
      .input("idImagen", sql.Int, parseInt(idImagen))
      .query("DELETE FROM servicios_imagenes WHERE id_imagen = @idImagen");

    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ESTABLECER IMAGEN PRINCIPAL
export const establecerImagenPrincipal = async (req, res) => {
  try {
    const { idServicio, idImagen } = req.params;
    const conn = await pool;

    await conn.request()
      .input("idServicio", sql.Int, parseInt(idServicio))
      .query("UPDATE servicios_imagenes SET es_principal = 0 WHERE id_servicio = @idServicio");

    await conn.request()
      .input("idImagen", sql.Int, parseInt(idImagen))
      .input("idServicio", sql.Int, parseInt(idServicio))
      .query("UPDATE servicios_imagenes SET es_principal = 1 WHERE id_imagen = @idImagen AND id_servicio = @idServicio");

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ACTUALIZAR ORDEN DE IMAGEN
export const actualizarOrdenImagen = async (req, res) => {
  try {
    const { idImagen } = req.params;
    const { orden, es_principal } = req.body;
    const conn = await pool;

    await conn.request()
      .input("idImagen", sql.Int, parseInt(idImagen))
      .input("orden", sql.Int, orden)
      .input("es_principal", sql.Bit, es_principal)
      .query(`
        UPDATE servicios_imagenes
        SET fecha_subida = DATEADD(second, @orden, fecha_subida),
            es_principal = @es_principal
        WHERE id_imagen = @idImagen
      `);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
