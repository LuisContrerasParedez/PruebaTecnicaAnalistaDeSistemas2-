// src/modules/files/local.routes.js
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();
const LOCAL_ROOT = path.join(process.cwd(), 'local_storage');
fs.mkdirSync(LOCAL_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { entidad, entidadId } = req.params; // EXPEDIENTE, INDICIO, etc.
    const safeEntidad = String(entidad || 'misc').replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();
    const safeId = String(entidadId || '0').replace(/[^0-9]/g, '');
    const dest = path.join(LOCAL_ROOT, safeEntidad, safeId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage });

// POST /api/local-files/upload/EXPEDIENTE/5   (form-data: file)
router.post('/upload/:entidad/:entidadId', upload.single('file'), (req, res) => {
  const { entidad, entidadId } = req.params;
  const rel = path
    .join(entidad.toUpperCase(), String(entidadId), req.file.filename)
    .replace(/\\/g, '/'); // para Windows

  res.status(201).json({
    ok: true,
    // ruta "web" para abrirlo si exponemos la carpeta:
    publicPath: `/local/${rel}`,
    // datos útiles para tu /adjuntos
    ruta: rel,                     // guarda esto en DB si quieres
    filename: req.file.filename,
    size: req.file.size,
    mime: req.file.mimetype,
  });
});

export default router;
