import { Router } from "express";
import { getServices, createService, editarServicio, eliminarServicio, subirImagenes, eliminarImagen, establecerImagenPrincipal } from "../controllers/service.controller.js";
import { uploadImagenes } from "../controllers/service.controller.js";

const router = Router();

router.get("/",       getServices);
router.get("/:id",    getServices);
router.post("/",      createService);
router.put("/:id",    editarServicio);
router.delete("/:id", eliminarServicio);

// Rutas de imágenes
router.post("/:id/imagenes", uploadImagenes.array("imagenes", 5), subirImagenes);
router.delete("/:idServicio/imagenes/:idImagen", eliminarImagen);
router.put("/:idServicio/imagenes/:idImagen/principal", establecerImagenPrincipal);

export default router;