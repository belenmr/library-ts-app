import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getUser } from '../../src/use-cases/get-user';
import type { UserRepository } from '../../src/repositories/user.repository';
import type { User } from '../../src/entities/user';
import { RoleName } from '../../src/entities/role';

// --- Mocks de Datos ---
const mockUser: User = {
    id: 'u-123',
    name: 'Retrieved ',
    surname: 'User',
    email: 'retrieve@test.com',
    passwordHash: 'hashed-data',
    role: { id: 'r-member', name: RoleName.MEMBER, permissions: [] },
    hasPendingFine: false,
};

// --- Mocks de Dependencias ---
const mockUserRepository: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn(),
    findByRole: vi.fn(),
    findAll: vi.fn()
};

const deps = {
    userRepository: mockUserRepository,
};



describe('Get User Use Case (getUser)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: Obtener usuario exitosamente
    test('should return the User entity when a valid ID is provided', async () => {        
        mockUserRepository.findById = vi.fn().mockResolvedValue(mockUser);
        
        const payload = { userId: 'u-123' };

        const result = await getUser(deps, payload);

        expect(result).not.toBeInstanceOf(Error);
        expect(mockUserRepository.findById).toHaveBeenCalledWith('u-123');
        expect(result).toEqual(mockUser);
    });

    // TEST 2: Usuario no encontrado
    test('should return an Error if the user is not found by ID', async () => {        
        mockUserRepository.findById = vi.fn().mockResolvedValue(null);
        
        const payload = { userId: 'u-999' };

        const result = await getUser(deps, payload);

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('User with ID u-999 not found.');
    });

    // TEST 3: ID de usuario faltante
    test('should return an Error if the user ID is missing from the payload', async () => {
        const payload = { userId: '' };

        const result = await getUser(deps, payload);

        expect(result).toBeInstanceOf(Error); // Error de validación
        expect((result as Error).message).toBe('User ID is required.');
        expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
});