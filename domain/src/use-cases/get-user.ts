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