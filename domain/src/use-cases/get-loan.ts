import type { Loan } from '../entities/loan';
import type { LoanRepository } from '../repositories/loan.repository';

// --- Dependencias ---
interface GetLoanDeps {
	loanRepository: LoanRepository;
}

// --- Datos de Entrada ---
interface GetLoanPayload {
	loanId: string;
}


export async function getLoan(
	{ loanRepository }: GetLoanDeps,
	{ loanId }: GetLoanPayload
): Promise<Loan | Error> {
	if (!loanId) {
		return new Error("Loan ID is required.");
	}

	const loan = await loanRepository.findById(loanId);

	if (!loan) {
		return new Error(`Loan with ID ${loanId} not found.`);
	}

	return loan;
}