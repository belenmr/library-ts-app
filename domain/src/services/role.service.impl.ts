import { Role, RoleName } from '../entities/role';
import { RoleService } from './role.service.js';
import { RoleName as RoleNameValues } from '../entities/role';

const ROLES: Role[] = [
	{
		id: 'r-admin',
		name: RoleNameValues.ADMIN,
		permissions: ['manage_users', 'manage_loans', 'manage_books', 'modify_limits'],
	},
	{
		id: 'r-librarian',
		name: RoleNameValues.LIBRARIAN,
		permissions: ['manage_loans', 'manage_books', 'view_all_fines'],
	},
	{
		id: 'r-member',
		name: RoleNameValues.MEMBER,
		permissions: ['view_loans', 'view_books'],
	},
];

export class RoleServiceImpl implements RoleService {	

	getRoleByName(name: RoleName): Role | undefined {
		return ROLES.find((r) => r.name === name);
	}

	listRoles(): Role[] {
		return [...ROLES];
	}
	
	hasPermission(roleName: RoleName, permission: string): boolean {
		const role = this.getRoleByName(roleName);
		return role ? role.permissions.includes(permission) : false;
	}
}