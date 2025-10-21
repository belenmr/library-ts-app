export const RoleName = {
	ADMIN: 'ADMIN',
	LIBRARIAN: 'LIBRARIAN',
	MEMBER: 'MEMBER',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export interface Role {
	id: string;
	name: RoleName;
	permissions: string[];
}