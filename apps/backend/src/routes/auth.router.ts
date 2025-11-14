import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller'; 
import type { AuthControllerDeps } from '../controllers/auth.controller'; 

/**
 * Crea el router para las rutas de autenticación (/auth).
 */
export const createAuthRouter = (deps: AuthControllerDeps): Router => {
	const router = Router();

	const authController = new AuthController(deps);

	router.post('/login', authController.login);

	return router;
};