import type { User } from '../entities/user';
import type { UserRepository } from '../repositories/user.repository';


// --- Dependencias ---
interface GetUserDeps {
	userRepository: UserRepository;
}

// --- Datos de Entrada ---
interface GetUserPayload {
	userId: string;
}

/**
 * Obtiene los detalles de un usuario por su identificador único (ID).
 * @returns El objeto User si es encontrado, o un Error si no existe.
 */
export async function getUser(
	{ userRepository }: GetUserDeps,
	{ userId }: GetUserPayload
): Promise<User | Error> {
	
	if (!userId) {
		return new Error("User ID is required.");
	}

	const user = await userRepository.findById(userId);

	if (!user) {
		return new Error(`User with ID ${userId} not found.`);
	}

	return user;
}