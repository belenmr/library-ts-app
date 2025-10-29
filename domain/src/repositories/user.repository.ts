import { RoleName, User } from '../entities/index';

export interface UserRepository {
	//Lectura
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByRole(roleName: RoleName): Promise<User[]>;
	findAll(): Promise<User[]>;

	//Escritura
	save(user: User): Promise<void>;
}