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
    // POST /users/register
    router.post('/register', userController.register); 
    
    // NOTA: A partir de aquí, deberías montar un middleware de autenticación/autorización
    // (Ej: router.use(authMiddleware);)

    // 2. Rutas Protegidas (CRUD, Lectura)
    router.get('/', userController.getUsers);           // GET /users 
    router.get('/:id', userController.getUser);         // GET /users/:id
    router.put('/:id', userController.updateUser);      // PUT /users/:id

    return router;
};