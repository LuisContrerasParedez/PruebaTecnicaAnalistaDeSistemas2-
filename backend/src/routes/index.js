import { Router } from 'express';
import acciones from '../modules/acciones/acciones.routes.js';
import health from './health.routes.js';

const r = Router();
r.use('/acciones', acciones);
r.use('/health', health);
export default r;
