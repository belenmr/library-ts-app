import { User } from '../entities/index';

export interface UserRepository {
	//Lectura
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;

	//Escritura
	save(user: User): Promise<void>;
}
