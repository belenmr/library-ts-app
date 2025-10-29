import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getUsers } from '../../src/use-cases/get-users';
import type { UserRepository } from '../../src/repositories/user.repository';
import type { User,  } from '../../src/entities/user';
import { RoleName } from '../../src/entities/role';


// --- Mocks de Datos ---
const mockUserList: User[] = [
    { id: 'u-1', name: 'Admin', email: 'admin@test.com', passwordHash: 'hpass', role: { id: 'r-a', name: RoleName.ADMIN, permissions: [] }, hasPendingFine: false },
    { id: 'u-2', name: 'Member', email: 'member@test.com', passwordHash: 'hpass', role: { id: 'r-m', name: RoleName.MEMBER, permissions: [] }, hasPendingFine: false },
];

const mockEmptyList: User[] = [];

// --- Mocks de Dependencias ---
const mockUserRepository: UserRepository = {
    findAll: vi.fn(), 
    findByRole: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
};

const deps = {
    userRepository: mockUserRepository,
};



describe('Get Users Use Case (getUsers)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: Retorna la lista completa de usuarios
    test('should return the full list of users provided by the repository', async () => {
        mockUserRepository.findAll = vi.fn().mockResolvedValue(mockUserList);

        const result = await getUsers(deps);

        expect(result).not.toBeInstanceOf(Error);
        expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockUserList);
        expect((result as User[]).length).toBe(2);
    });

    // TEST 2: Retorna una lista vacía si no hay usuarios
    test('should return an empty array if no users are found in the system', async () => {
        mockUserRepository.findAll = vi.fn().mockResolvedValue(mockEmptyList); // El repositorio simula devolver un array vacío

        const result = await getUsers(deps);

        expect(result).not.toBeInstanceOf(Error);
        expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);        
        expect(result).toEqual([]);
    });
    
    // TEST 3: Manejo de errores de la infraestructura (DB)
    test('should propagate an error if the repository fails', async () => {
        
        mockUserRepository.findAll = vi.fn().mockRejectedValue(new Error("DB Connection Failed")); // Simula un fallo de conexión a la DB
        
        await expect(getUsers(deps)).rejects.toThrow("DB Connection Failed"); // try/catch para manejar la promesa rechazada
        expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
});