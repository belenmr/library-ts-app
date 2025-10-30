import { describe, test, expect, vi, beforeEach } from 'vitest';
import { login } from '../../src/use-cases/login';
import { RoleName } from '../../src/entities/role';
import type { UserRepository } from '../../src/repositories/user.repository';
import type { PasswordService, TokenService } from '../../src/services';
import type { User } from '../../src/entities/user';
import type { LoginResponse } from '../../src/use-cases/login';

// --- Mocks de Datos y Dependencias ---
const MOCK_TOKEN = 'mocked.jwt.token';
const MOCK_USER_HASH = 'hashed-abc-123';

const mockUser: User = {
	id: 'u-456',
	name: 'Login',
	surname: 'User',
	email: 'test@login.com',
	passwordHash: MOCK_USER_HASH,
	role: { id: 'r-member', name: RoleName.MEMBER, permissions: [] },
	hasPendingFine: false,
};

// Mock del Repositorio 
const mockUserRepository: UserRepository = {
	findByEmail: vi.fn(),
	save: vi.fn(),
	findById: vi.fn(),
	findAll: vi.fn(),
	findByRole: vi.fn(),
};

// Mock del Servicio de Contraseñas
const mockPasswordService: PasswordService = {
	hash: vi.fn(),
	compare: vi.fn(),
};

// Mock del Servicio de Tokens 
const mockTokenService: TokenService = {
	generateToken: vi.fn(async () => MOCK_TOKEN),
	verifyToken: vi.fn(),
};

const deps = {
	userRepository: mockUserRepository,
	passwordService: mockPasswordService,
	tokenService: mockTokenService,
};



describe('Login Use Case', () => {

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// TEST 1: Login Exitoso
	test('should return user and token when credentials are valid', async () => {
		mockUserRepository.findByEmail = vi.fn().mockResolvedValue(mockUser);
		mockPasswordService.compare = vi.fn().mockResolvedValue(true); // Contraseña correcta
		
		const payload = { email: mockUser.email, password: 'correctpassword' };

		const result = await login(deps, payload);


		expect(result).not.toBeInstanceOf(Error);
		const { user, token } = result as LoginResponse;
		
		// Verificación de llamadas
		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
		expect(mockPasswordService.compare).toHaveBeenCalledWith(payload.password, MOCK_USER_HASH);		
		expect(mockTokenService.generateToken).toHaveBeenCalledTimes(1); //Verificación de generación de token

		expect(user).toEqual(mockUser);
		expect(token).toBe(MOCK_TOKEN);
	});

	// TEST 2: Fallo - Usuario no encontrado (email incorrecto)
	test('should return an Invalid credentials Error when user is not found', async () => {
		mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
		
		const payload = { email: 'nonexistent@test.com', password: 'any' };

		const result = await login(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Invalid credentials.');
		
		// Debe fallar antes de comparar la contraseña o generar el token
		expect(mockPasswordService.compare).not.toHaveBeenCalled();
		expect(mockTokenService.generateToken).not.toHaveBeenCalled();
	});

	// TEST 3: Fallo - Contraseña incorrecta
	test('should return an Invalid credentials Error when password does not match the hash', async () => {
		mockUserRepository.findByEmail = vi.fn().mockResolvedValue(mockUser);
		mockPasswordService.compare = vi.fn().mockResolvedValue(false);
		
		const payload = { email: mockUser.email, password: 'wrongpassword' };

		const result = await login(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Invalid credentials.');
		
		// Debe llamar a compare, pero NO debe generar el token
		expect(mockPasswordService.compare).toHaveBeenCalled();
		expect(mockTokenService.generateToken).not.toHaveBeenCalled();
	});
	
	// TEST 4: Fallo - Datos faltantes
	test('should return an Error if email or password are empty', async () => {
		const payload = { email: '', password: '123' };

		const result = await login(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Email and password are required.');
		expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
	});
});