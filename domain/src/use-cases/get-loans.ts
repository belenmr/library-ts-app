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


export async function getLoans(
    { loanRepository }: GetLoansDeps,
    { userId }: GetLoansPayload
): Promise<Loan[] | Error> {
	const loans = userId
        ? await loanRepository.findLoansByUserId(userId)
        : await loanRepository.findAll();

	return loans;
}