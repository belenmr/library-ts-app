import type { User } from '../entities/user.js';
import type { UserRepository } from '../repositories/user.repository';

interface GetUsersDeps {
    userRepository: UserRepository;
}

export async function getUsers(
    { userRepository }: GetUsersDeps,
): Promise<User[]> {        
    const users = await userRepository.findAll(); 

    return users;
}