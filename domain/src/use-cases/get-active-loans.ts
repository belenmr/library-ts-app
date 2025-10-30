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


export async function getActiveLoans(
    { loanRepository }: GetLoansDeps,
    { userId }: GetLoansPayload
): Promise<Loan[] | Error> {
    const loans = userId
        ? await loanRepository.findActiveLoansByUserId(userId)
        : await loanRepository.findActiveAll();
        
    return loans;
}