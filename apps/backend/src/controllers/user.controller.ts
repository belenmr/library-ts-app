import { Request, Response } from 'express';
import type { User, Role } from '@domain/entities/user'; 

// --- Definiciones de Tipos de Casos de Uso (Firmas) ---
type RegisterUseCase = (payload: any) => Promise<User | Error>;
type GetUserUseCase = (payload: { userId: string }) => Promise<User | Error>;
type GetUsersUseCase = () => Promise<User[]>; // Retorna Promise<User[]> debido a la firma simple
type UpdateUserUseCase = (payload: any) => Promise<User | Error>;

interface UserControllerDeps {
    registerUserUseCase: RegisterUseCase;
    getUserUseCase: GetUserUseCase;
    getUsersUseCase: GetUsersUseCase;
    updateUserUseCase: UpdateUserUseCase;
}

export class UserController {
    constructor(private readonly deps: UserControllerDeps) {}

    // ------------------------------------
    // POST /register
    // ------------------------------------
    public register = async (req: Request, res: Response) => {
        const { name, surname, email, password, roleToCreate } = req.body;
        
        // NOTA: El executorRole debe venir de un middleware de autenticación/autorización
        // Aquí simulamos que es un ADMIN para poder ejecutar la función de Dominio.
        const executorRole = 'ADMIN' as any; // Simulación para que el CU funcione

        try {
            const result = await this.deps.registerUserUseCase({ name, surname, email, password, roleToCreate, executorRole });

            if (result instanceof Error) {
                // Errores 400: Validación de datos (ej. usuario ya existe, rol inválido)
                return res.status(400).json({ error: result.message });
            }

            // Éxito: 201 Created
            return res.status(201).json({ id: result.id, message: `User ${result.email} registered successfully.` });
        } catch (error) {
            console.error('Error during registration:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    
    // ------------------------------------
    // GET /users/:id
    // ------------------------------------
    public getUser = async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "User ID parameter is missing." });
        }

        try {
            const result = await this.deps.getUserUseCase({ userId: id });
            
            if (result instanceof Error) {
                // Error 404 Not Found (ej. User not found)
                return res.status(404).json({ error: result.message });
            }
            
            // Éxito: 200 OK
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    
    // ------------------------------------
    // GET /users
    // ------------------------------------
    public getUsers = async (req: Request, res: Response) => {
        try {
            // NOTA: El middleware de autorización (ADMIN/LIBRARIAN) DEBE verificar
            // el permiso antes de que se ejecute este handler.
            const result = await this.deps.getUsersUseCase();
            
            // El CU getUsers devuelve Promise<User[]>, por lo que no debería ser Error
            if (Array.isArray(result)) {
                return res.status(200).json(result);
            }
            
            return res.status(500).json({ error: 'Unexpected error getting users.' });

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    
    // ------------------------------------
    // PUT /users/:id
    // ------------------------------------
    public updateUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        
        // El payload debe ser una mezcla del ID del URL y el cuerpo de la petición
        const payload: UpdateUserPayload = { userIdToUpdate: id, ...req.body };
        
        try {
            const result = await this.deps.updateUserUseCase(payload);
            
            if (result instanceof Error) {
                 // 404 si el usuario a actualizar no existe
                return res.status(404).json({ error: result.message });
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
}