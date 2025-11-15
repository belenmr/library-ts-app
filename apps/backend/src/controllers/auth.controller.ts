import { Request, Response } from 'express';
import type { LoginResponse } from '@domain/use-cases/login'; 

type LoginUseCase = (payload: { email: string; password: string; }) => Promise<LoginResponse | Error>;

export interface AuthControllerDeps {
	loginUserUseCase: LoginUseCase;
}

export class AuthController {
	constructor(private readonly deps: AuthControllerDeps) {}

	public login = async (req: Request, res: Response) => {
		const { email, password } = req.body;

		try {
			const result = await this.deps.loginUserUseCase({ email, password });

			if (result instanceof Error) {
				return res.status(401).json({ error: result.message });
			}

			const { user, token } = result;
			
			return res.status(200).json({
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role.name,
				},
				token: token,
			});

		} catch (error) {
			console.error('Error during login:', error);
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}
}