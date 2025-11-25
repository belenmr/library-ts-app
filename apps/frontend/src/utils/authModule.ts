import { AuthApiRepository } from '../api/AuthApiRepository';
import type { User } from '@domain/entities';
import type { RegisterUserPayload } from '@domain/use-cases/register-user';

const authRepositoryInstance = new AuthApiRepository();

export const authModule = {

	register: (payload: RegisterUserPayload): Promise<User> => {
		return authRepositoryInstance.register(payload);
	},
};