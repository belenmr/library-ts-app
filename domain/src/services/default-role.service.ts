import { Role, RoleName } from '../entities/role';
import { RoleService } from './role.service.js';
import { RoleName as RoleNameValues } from '../entities/role';

const ROLES_DATA: Role[] = [
	{
		id: 'r-admin',
		name: RoleNameValues.ADMIN,
		permissions: ['manage_users', 'manage_loans', 'manage_books', 'modify_limits'],
	} as Role,
	{
		id: 'r-librarian',
		name: RoleNameValues.LIBRARIAN,
		permissions: ['manage_loans', 'manage_books', 'view_all_fines'],
	} as Role,
	{
		id: 'r-member',
		name: RoleNameValues.MEMBER,
		permissions: ['view_loans', 'view_books'],
	} as Role,
];

export class DefaultRoleService implements RoleService {
	
	private roleMap: Map<RoleName, Role>;

	constructor() {
		this.roleMap = new Map(ROLES_DATA.map(role => [role.name, role]));
	}

	getRoleByName(name: RoleName): Role | undefined {
		return this.roleMap.get(name);
	}

	listRoles(): Role[] {
		return Array.from(this.roleMap.values());
	}
	
	hasPermission(roleName: RoleName, permission: string): boolean {
		const role = this.getRoleByName(roleName);
		return role ? role.permissions.includes(permission) : false;
	}
}