import { randomUUID } from 'crypto';
import type { User, RoleName } from '../entities';
import type { UserRepository } from '../repositories';
import type { PasswordService, RoleService } from '../services';

interface RegisterUserDeps {
	userRepository: UserRepository;
	passwordService: PasswordService;
	roleService: RoleService;
}

export interface RegisterUserPayload {
	name: string;
	surname: string,
	email: string;
	password: string;
	executorRole: RoleName;
	roleToCreate: RoleName;
}

export async function registerUser(
	{ userRepository, passwordService, roleService }: RegisterUserDeps,
	{ name, surname, email, password, executorRole, roleToCreate }: RegisterUserPayload
): Promise<User | Error> {
	if (executorRole !== 'ADMIN') {
		return new Error('Access denied. Only ADMIN can register new users.');
	}

	if (!name || !surname || !email || !password || !roleToCreate) {
		return new Error('Name, surname, email, password, and role are required.');
	}

	const foundUser = await userRepository.findByEmail(email);
	if (foundUser) {
		return new Error(`User with email ${email} already exists.`);
	}

	const role = roleService.getRoleByName(roleToCreate);
	if (!role) {
		return new Error(`Invalid role: ${roleToCreate}`);
	}

	const passwordHash = await passwordService.hash(password);

	const newUser: User = {
		id: randomUUID(),
		name,
		surname,
		email,
		passwordHash,
		role,
		hasPendingFine: false,
	};

	await userRepository.save(newUser);
	return newUser;
}
