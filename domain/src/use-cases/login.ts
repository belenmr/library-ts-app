import type { User } from '../entities/user';
import type { UserRepository } from '../repositories/user.repository';
import type { PasswordService, TokenService, TokenPayload } from '../services';

// --- Dependencias ---
interface LoginDeps {
	userRepository: UserRepository;
	passwordService: PasswordService;
	tokenService: TokenService;
}

// --- Datos de Entrada ---
export interface LoginPayload {
	email: string;
	password: string;
}

// --- Retorno Exitoso ---
export interface LoginResponse {
	user: User;
	token: string;
}


export async function login(
	{ userRepository, passwordService, tokenService }: LoginDeps,
	{ email, password }: LoginPayload
): Promise<LoginResponse | Error> {

	if (!email || !password) {
		return new Error("Email and password are required.");
	}

	const user = await userRepository.findByEmail(email);
	if (!user) {
		return new Error("Invalid credentials.");
	}

	const passwordMatch = await passwordService.compare(password, user.passwordHash);

	if (!passwordMatch) {
		return new Error("Invalid credentials.");
	}

	const tokenPayload: TokenPayload = {
		userId: user.id,
		roleName: user.role.name,
	};

	const token = await tokenService.generateToken(tokenPayload);

	return { user, token };
}