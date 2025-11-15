import { Request, Response } from 'express';
import type { Loan } from '@domain/entities/loan';

// --- Definición de Tipos de Casos de Uso ---
type CreateLoanUseCase = (payload: any) => Promise<Loan | Error>;
type EndLoanUseCase = (payload: { loanId: string }) => Promise<Loan | Error>;
type GetLoanUseCase = (payload: { loanId: string }) => Promise<Loan | Error>;
type GetLoansUseCase = (payload: { userId?: string }) => Promise<Loan[] | Error>;
type GetActiveLoansUseCase = (payload: { userId?: string }) => Promise<Loan[] | Error>;
type GetOverdueLoansUseCase = (payload: { userId?: string }) => Promise<Loan[] | Error>;
type HasPendingFineUseCase = (payload: { userId: string }) => Promise<boolean | Error>;

export interface LoanControllerDeps {
	createLoanUseCase: CreateLoanUseCase;
	endLoanUseCase: EndLoanUseCase;
	getLoanUseCase: GetLoanUseCase;
	getLoansUseCase: GetLoansUseCase;
	getActiveLoansUseCase: GetActiveLoansUseCase;
	getOverdueLoansUseCase: GetOverdueLoansUseCase;
	hasPendingFineUseCase: HasPendingFineUseCase;
}

export class LoanController {
	constructor(private readonly deps: LoanControllerDeps) {}

	public createLoan = async (req: Request, res: Response) => {
		// La autenticación (executorRole) debe ser un middleware.
		const { userId, bookId } = req.body;
		
		try {
			const result = await this.deps.createLoanUseCase({ userId, bookId });

			if (result instanceof Error) {
				return res.status(400).json({ error: result.message });
			}

			return res.status(201).json({ id: result.id, message: 'Loan created successfully.', dueDate: result.dueDate });
		} catch (error) {
			console.error('Error creating loan:', error);
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}
	

	public endLoan = async (req: Request, res: Response) => {
		const { id } = req.params;

		if (!id) {
            return res.status(400).json({ error: "Loan ID parameter is missing." });
        }
		
		try {
			const result = await this.deps.endLoanUseCase({ loanId: id });

			if (result instanceof Error) {
				return res.status(400).json({ error: result.message });
			}

			return res.status(200).json({ id: result.id, status: result.status, message: 'Loan returned successfully.' });
		} catch (error) {
			console.error('Error ending loan:', error);
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}


	public getLoan = async (req: Request, res: Response) => {
		const { id } = req.params;

		if (!id) {
            return res.status(400).json({ error: "Loan ID parameter is missing." });
        }
		
		try {
			const result = await this.deps.getLoanUseCase({ loanId: id });
			
			if (result instanceof Error) {
				return res.status(404).json({ error: result.message });
			}
			
			return res.status(200).json(result);
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}
	

	public getLoans = async (req: Request, res: Response) => {
		const { userId } = req.query; // Filtro opcional por query string
		
		try {
			// El CU getLoans maneja la lógica de filtrar por userId o traer findAll
			const result = await this.deps.getLoansUseCase({ userId: userId as string }); 
			
			if (result instanceof Error) { // Solo si el CU devuelve un error inesperado
				return res.status(500).json({ error: result.message });
			}
			
			return res.status(200).json(result);
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}
	

	public getActiveLoans = async (req: Request, res: Response) => {
		const { userId } = req.query; 
		
		try {
			const result = await this.deps.getActiveLoansUseCase({ userId: userId as string }); 
			
			if (result instanceof Error) {
				return res.status(500).json({ error: result.message });
			}
			
			return res.status(200).json(result);
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}


	public getOverdueLoans = async (req: Request, res: Response) => {
		const { userId } = req.query;
		
		try {
			const result = await this.deps.getOverdueLoansUseCase({ userId: userId as string });
			
			if (result instanceof Error) {
				return res.status(500).json({ error: result.message });
			}
			
			return res.status(200).json(result);
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}


	public hasPendingFine = async (req: Request, res: Response) => {
		const { userId } = req.query;
		
		if (!userId) {
			 return res.status(400).json({ error: "User ID is required for checking fine status." });
		}

		try {
			// El CU devuelve un boolean (true/false) o un Error
			const result = await this.deps.hasPendingFineUseCase({ userId: userId as string });
			
			if (result instanceof Error) {
				return res.status(500).json({ error: result.message });
			}
			
			return res.status(200).json({ 
				userId: userId, 
				hasPendingFine: result 
			});
			
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error.' });
		}
	}
}