import { type User, RoleName } from '@domain/entities/index';
import type { UserRepository } from '@domain/repositories/user.repository';
import { httpClient } from './httpClient.js';

export class UserApiRepository implements UserRepository {

    async findByEmail(email: string): Promise<User | null> {
        const allUsers = await this.findAll();
        const filteredUsers = allUsers.filter(user => user.email === email);
        return filteredUsers[0];
    }

    async findById(id: string): Promise<User | null> {
        const response = await httpClient.get(`/users/${id}`);
        return response.data;
    }

    async findByRole(roleName: RoleName): Promise<User[]> {
        const allUsers = await this.findAll();
        const filteredUsers = allUsers.filter(user => user.role.name === roleName);
        return filteredUsers;
    }

    async findAll(): Promise<User[]> {
        const response = await httpClient.get('/users');
        return response.data;
    }

    async save(user: User): Promise<void> {
        await httpClient.post('/users/register', user);
    }
}