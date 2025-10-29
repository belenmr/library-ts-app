import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerUser } from '../../src/use-cases/register-user';
import type { UserRepository } from '../../src/repositories';
import type { PasswordService, RoleService } from '../../src/services';
import { RoleName } from '../../src/entities/role';
import { User } from '../../src';
import { randomUUID } from 'crypto';

const MOCK_NEW_ID = 'u-new-uuid';
const MOCK_PASSWORD_HASH = 'hashed-pass';
vi.mock('crypto', () => {
    return {
        randomUUID: vi.fn(() => MOCK_NEW_ID),
    };
});

// --- Mock de dependencias ---
const mockUserRepository: UserRepository = {
	findByEmail: vi.fn(),
	save: vi.fn(),
	findById: vi.fn(), 
    findByRole: vi.fn(), 
    findAll: vi.fn(),
};

const mockPasswordService: PasswordService = {
	hash: vi.fn().mockResolvedValue(MOCK_PASSWORD_HASH),
	compare: vi.fn(),
};

const mockRoleService: RoleService = {
	getRoleByName: vi.fn(),
	listRoles: vi.fn(),
	hasPermission: vi.fn(),
};

const deps = {
	userRepository: mockUserRepository,
	passwordService: mockPasswordService,
	roleService: mockRoleService,
};

// --- Datos de ejemplo ---
const mockRole = {
	id: 'r-librarian',
	name: RoleName.LIBRARIAN,
	permissions: ['manage_books', 'manage_loans'],
};

describe('Use Case: registerUser', () => {
	beforeEach(() => {
	vi.clearAllMocks();
});

	// TEST 1: Creación exitosa
	test('should register a new user when executed by ADMIN and data is valid', async () => {
		mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
		mockRoleService.getRoleByName = vi.fn().mockReturnValue(mockRole);

		const payload = {
			name: 'Belén Medina',
			email: 'belen@example.com',
			password: '12345',
			executorRole: RoleName.ADMIN,
			roleToCreate: RoleName.LIBRARIAN,
		};

		const result = await registerUser(deps, payload);

		expect(result instanceof Error).toBe(false);
		const user = result as any;

		expect(randomUUID).toHaveBeenCalledTimes(1);
		expect(mockPasswordService.hash).toHaveBeenCalledWith('12345');
		expect(mockUserRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				id: MOCK_NEW_ID,
				name: 'Belén Medina',
				email: 'belen@example.com',
				role: mockRole,
			})
		);

		expect(user.passwordHash).toBe(MOCK_PASSWORD_HASH);
		expect(user.role.name).toBe(RoleName.LIBRARIAN);
	});

	// TEST 2: Solo ADMIN puede crear usuarios
	test('should return Error if executorRole is not ADMIN', async () => {
		const payload = {
			name: 'Juan',
			email: 'juan@example.com',
			password: '123',
			executorRole: RoleName.MEMBER,
			roleToCreate: RoleName.MEMBER,
		};

		const result = await registerUser(deps, payload);

		expect(result instanceof Error).toBe(true);
		expect((result as Error).message).toBe('Access denied. Only ADMIN can register new users.');
	});

	// TEST 3: Email duplicado
	test('should return Error if user already exists with that email', async () => {
		mockUserRepository.findByEmail = vi.fn().mockResolvedValue({ id: 'u-old', email: 'dup@example.com' });

		const payload = {
			name: 'Dup',
			email: 'dup@example.com',
			password: 'abc',
			executorRole: RoleName.ADMIN,
			roleToCreate: RoleName.MEMBER,
		};

		const result = await registerUser(deps, payload);

		expect(result instanceof Error).toBe(true);
		expect((result as Error).message).toBe('User with email dup@example.com already exists.');
	});

	// TEST 4: Rol inválido
	test('should return Error if roleToCreate is invalid', async () => {
		mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
		mockRoleService.getRoleByName = vi.fn().mockReturnValue(undefined);

		const payload = {
			name: 'Laura',
			email: 'laura@example.com',
			password: '123',
			executorRole: RoleName.ADMIN,
			roleToCreate: 'INVALID_ROLE' as any,
		};

		const result = await registerUser(deps, payload);

		expect(result instanceof Error).toBe(true);
		expect((result as Error).message).toBe('Invalid role: INVALID_ROLE');
	});

	// TEST 5: Campos faltantes
	test('should return Error if any required field is missing', async () => {
		const payload = {
			name: '',
			email: '',
			password: '',
			executorRole: RoleName.ADMIN,
			roleToCreate: RoleName.MEMBER,
		};

		const result = await registerUser(deps, payload);

		expect(result instanceof Error).toBe(true);
		expect((result as Error).message).toBe('Name, email, password, and role are required.');
	});
});
