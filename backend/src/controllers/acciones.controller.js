import { getPool, sql } from '../db/db.js';

export const listar = async (_req, res) => {
  const pool = await getPool();
  const result = await pool.request().execute('dbo.sp_Accion_List');
  res.json(result.recordset);
};

export const obtener = async (req, res) => {
  const id = Number(req.params.id);
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .execute('dbo.sp_Accion_GetById');
  if (!result.recordset.length) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.recordset[0]);
};

export const crear = async (req, res) => {
  const { nombre, descripcion } = req.body;
  const pool = await getPool();
  const result = await pool.request()
    .input('Nombre', sql.NVarChar(100), nombre)
    .input('Descripcion', sql.NVarChar(255), descripcion ?? null)
    .execute('dbo.sp_Accion_Insert');
  const newId = result.recordset[0].NewId;
  res.status(201).json({ id: newId, nombre, descripcion });
};

export const actualizar = async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, descripcion } = req.body;
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .input('Nombre', sql.NVarChar(100), nombre)
    .input('Descripcion', sql.NVarChar(255), descripcion ?? null)
    .execute('dbo.sp_Accion_Update');
  if (!result.recordset[0].Affected) return res.status(404).json({ message: 'No encontrado' });
  res.json({ id, nombre, descripcion });
};

export const eliminar = async (req, res) => {
  const id = Number(req.params.id);
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .execute('dbo.sp_Accion_Delete');
  if (!result.recordset[0].Affected) return res.status(404).json({ message: 'No encontrado' });
  res.status(204).end();
};
