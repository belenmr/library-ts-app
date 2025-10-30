import type { Loan } from '../entities/loan';
import type { LoanRepository } from '../repositories/loan.repository';

// --- Dependencias ---
interface GetLoansDeps {
	loanRepository: LoanRepository;
}

// --- Datos de Entrada ---
interface GetLoansPayload {
	userId?: string;
}


export async function getOverdueLoans(
	{ loanRepository }: GetLoansDeps,
	{ userId }: GetLoansPayload
): Promise<Loan[] | Error> {
	const loans = userId
		? await loanRepository.findOverdueLoansByUserId(userId)
		: await loanRepository.findOverdueAll();
		
	return loans;
}