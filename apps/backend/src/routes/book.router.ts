import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import type { BookControllerDeps } from '../controllers/book.controller';

export const createBookRouter = (deps: BookControllerDeps): Router => {
    const router = Router();
    const bookController = new BookController(deps);

    // Rutas protegidas (lectura para miembros, escritura para bibliotecarios/admin)
    // POST /books (Add/Update copies - REQUIERE AUTORIZACIÓN)
    router.post('/', bookController.addBook); 

    router.get('/', bookController.getBooks);    
    router.get('/:id', bookController.getBook);         

    return router;
};