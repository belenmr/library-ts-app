import type { User, Role } from '../entities/';
import type { UserRepository } from '../repositories/user.repository';

// --- Dependencias ---
interface UpdateUserDeps {
    userRepository: UserRepository;
}

// --- Datos de Entrada ---
interface UpdateUserPayload {
    userIdToUpdate: string;
    name?: string;
	surname?: string;
    email?: string;
    role?: Role;
    hasPendingFine?: boolean;
}


export async function updateUser(
    { userRepository }: UpdateUserDeps,
    payload: UpdateUserPayload
): Promise<User | Error> {
    
    const { userIdToUpdate, name, surname, email, role, hasPendingFine } = payload;
    
    const existingUser = await userRepository.findById(userIdToUpdate);
    if (!existingUser) {
        return new Error(`User with ID ${userIdToUpdate} not found.`);
    }

    let updateFields: Partial<User> = {};
    
    if (name !== undefined) updateFields.name = name;
	if (surname !== undefined) updateFields.surname = surname;
    if (email !== undefined) updateFields.email = email;
	if (role !== undefined) updateFields.role = role;
	if (hasPendingFine !== undefined) updateFields.hasPendingFine = hasPendingFine;

    

    const updatedUser: User = {
        ...existingUser,
        ...updateFields, 
    };    
    await userRepository.save(updatedUser);

    return updatedUser;
}