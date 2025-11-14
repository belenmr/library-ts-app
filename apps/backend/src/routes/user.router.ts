import { Router } from 'express';
import { UserController } from '../controllers/user.controller'; 
import type { UserControllerDeps } from '../controllers/user.controller'; 

/**
 * Crea el router para las rutas de usuarios (/users).
 */
export const createUserRouter = (deps: UserControllerDeps): Router => {
    const router = Router();
    const userController = new UserController(deps);

    // 1. Rutas Públicas (Registro)
    router.post('/register', userController.register); 
    
    // NOTA: A partir de aquí, middleware de autenticación
    // 2. Rutas Protegidas (CRUD, Lectura)
    router.get('/', userController.getUsers);
    router.get('/:id', userController.getUser);
    router.put('/:id', userController.updateUser);

    return router;
};