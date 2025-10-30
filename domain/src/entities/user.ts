import { Role } from './role';

export interface User {
	id: string;
	name: string;
	surname: string;
	email: string;
	passwordHash: string; // Hash de la contraseña almacenada
	role: Role;
	hasPendingFine: boolean;
}