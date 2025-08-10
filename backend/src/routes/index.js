import { Router } from 'express';
import health from './health.routes.js';
import { auth } from './auth/auth.routes.js';
import { usuariosRoutes } from './usuarios/usuarios.routes.js';
import { rolesRoutes } from '../modules/roles/roles.routes.js';
import { catalogosRoutes } from '../modules/catalogos/catalogo.routes.js';
import { expedientesRoutes} from '../modules/expedientes/expedientes.routes.js';


const r = Router();
r.use('/health', health);
r.use('/auth', auth);
r.use('/expedientes', expedientesRoutes);
r.use('/catalogos', catalogosRoutes);
r.use('/roles', rolesRoutes);
r.use('/usuarios', usuariosRoutes); 
export default r;
