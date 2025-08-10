import { Router } from 'express';
import health from './health.routes.js';
import { auth } from './auth/auth.routes.js';
import { usuariosRoutes } from './usuarios/usuarios.routes.js';


const r = Router();
r.use('/health', health);
r.use('/auth', auth);
r.use('/usuarios', usuariosRoutes); 
export default r;
