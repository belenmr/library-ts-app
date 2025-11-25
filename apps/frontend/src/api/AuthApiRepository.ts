import type { User } from '@domain/entities';
import type { RegisterUserPayload } from '@domain/use-cases/register-user';
import { RoleName } from '@domain/entities/role';
import { httpClient } from './httpClient';

export class AuthApiRepository {

	async register(payload: RegisterUserPayload): Promise<User> {

		const defaultRole = RoleName.ADMIN;
		const registerData = {
			...payload,
			executorRole: defaultRole,
		};

		try {
			const response = await httpClient.post('/users/register', registerData);
			return response.data;
		} catch (error) {
			const backendError = (error as any).response?.data?.message;
			throw new Error(backendError || 'Error desconocido durante el registro.');
		}
	}
}