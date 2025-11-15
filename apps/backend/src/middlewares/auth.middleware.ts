import { Request, Response, NextFunction } from 'express';
import type { TokenService, TokenPayload } from '@domain/services/token.service';


export interface AuthRequest extends Request {
    user?: TokenPayload; // { userId, roleName }
}

interface AuthMiddlewareDeps {
    tokenService: TokenService;
}

/**
 * Middleware que verifica el token JWT en el encabezado 'Authorization'.
 * Si es válido, decodifica el payload y lo adjunta a req.user.
 */
export const authMiddleware = (deps: AuthMiddlewareDeps) => {
    
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication token required.' });
        }

        // Extraer el token de "Bearer <token>" y asegurar que existe
        const parts = authHeader.split(' ');
        const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : undefined;
        if (!token) {
             return res.status(401).json({ error: 'Invalid token format.' });
        }

        try {
            const payload = await deps.tokenService.verifyToken(token);             
            
            req.user = payload; // Adjunta el payload del token (userId, roleName) a la Request
            
            next();
        } catch (error) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
    };
};