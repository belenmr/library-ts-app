import type { Role, RoleName } from '../entities/index';

export interface RoleService {
	getRoleByName(name: RoleName): Role | undefined; 
	listRoles(): Role[];
	hasPermission(roleName: RoleName, permission: string): boolean;
}