import { describe, test, expect, vi, beforeEach } from 'vitest';
import { updateUser } from '../../src/use-cases/update-user';
import type { UserRepository } from '../../src/repositories/user.repository';
import type { User } from '../../src/entities/user';
import { RoleName } from '../../src/entities/role';
import type { Role } from '../../src/entities/role';

// --- Mocks de Datos ---
const MEMBER_ID = 'u-member-02';
const initialMemberRole: Role = { id: 'r-member', name: RoleName.MEMBER, permissions: [] };
const newAdminRole: Role = { id: 'r-admin', name: RoleName.ADMIN, permissions: ['manage_users'] };

const initialUser: User = {
	id: MEMBER_ID,
	name: 'Julia',
	surname: 'Member',
	email: 'julia@member.com',
	passwordHash: 'hash1',
	role: initialMemberRole,
	hasPendingFine: false,
};

// --- Mocks de Dependencias ---
const mockUserRepository: UserRepository = {
	findById: vi.fn(), 
	save: vi.fn(async (user: User) => {}),
	findByEmail: vi.fn(),
	findAll: vi.fn(),
	findByRole: vi.fn(),
};

const deps = { userRepository: mockUserRepository };



describe('Update User Use Case (updateUser)', () => {

	beforeEach(() => {
		vi.clearAllMocks();
		mockUserRepository.findById = vi.fn().mockResolvedValue({ ...initialUser });
	});

	// TEST 1: Actualiza campos múltiples exitosamente
	test('should merge all provided fields and persist the changes', async () => {
		const payload = { 
			userIdToUpdate: MEMBER_ID, 
			name: 'Julia New',
			surname: 'Doe',
			role: newAdminRole,
			hasPendingFine: true
		};

		const result = await updateUser(deps, payload);

		expect(result).not.toBeInstanceOf(Error);
		expect(mockUserRepository.save).toHaveBeenCalledTimes(1);		
		expect(mockUserRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				id: initialUser.id,
				name: 'Julia New',
				surname: 'Doe',
				hasPendingFine: true,
				role: newAdminRole,
				email: initialUser.email, 
			})
		);
	});

	// TEST 2: Actualiza solo un campo exitosamente
	test('should only update the surname and leave all other fields untouched', async () => {
		const payload = { 
			userIdToUpdate: MEMBER_ID, 
			surname: 'Smith',
		};

		await updateUser(deps, payload);

		expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
		
		expect(mockUserRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				id: initialUser.id,
				name: initialUser.name,
				surname: 'Smith',
				role: initialMemberRole,
			})
		);
	});

	// TEST 3: Usuario a actualizar no encontrado
	test('should return error if user ID to update does not exist', async () => {
		mockUserRepository.findById = vi.fn().mockResolvedValue(null);
		
		const payload = { userIdToUpdate: 'u-non-existent', name: 'New Name' };

		const result = await updateUser(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('User with ID u-non-existent not found.');
		expect(mockUserRepository.save).not.toHaveBeenCalled();
	});
});