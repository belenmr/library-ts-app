import { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware';
import type { RoleName } from '@domain/entities/role';
import type { RoleService } from '@domain/services/role.service';

interface RoleMiddlewareDeps {
    roleService: RoleService;
}

/**
 * Middleware que verifica si el usuario autenticado tiene uno de los roles permitidos.
 * @param allowedRoles Array de RoleName permitidos (['ADMIN', 'LIBRARIAN'])
 */
export const roleMiddleware = (deps: RoleMiddlewareDeps, allowedPermissions: string[]) => {
    
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        
        const userRoleName = req.user.roleName as RoleName;

        const hasPermission = allowedPermissions.some(permission => 
            deps.roleService.hasPermission(userRoleName, permission)
        );

        if (hasPermission) {
            next();
        } else {
            return res.status(403).json({ error: 'Access denied: Insufficient permissions.' });
        }
    };
};