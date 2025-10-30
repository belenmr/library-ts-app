import type { Loan } from '../entities/loan';
import type { BookRepository, LoanRepository } from '../repositories';

// --- Dependencias ---
interface EndLoanDeps {
	loanRepository: LoanRepository;
	bookRepository: BookRepository;
}

// --- Datos de Entrada ---
interface EndLoanPayload {
	loanId: string;
}

/**
 * Finaliza un préstamo.
 * Cambia el estado del préstamo a 'RETURNED' e incrementa las copias disponibles del libro.
 */
export async function endLoan(
	{ loanRepository, bookRepository }: EndLoanDeps,
	{ loanId }: EndLoanPayload
): Promise<Loan | Error> {
	
	const loan = await loanRepository.findById(loanId);
	if (!loan) {
		return new Error(`Loan with ID ${loanId} not found.`);
	}

	if (loan.status === 'RETURNED') {
		return new Error(`Loan with ID ${loanId} has already been returned.`);
	}

	const NEW_STATUS = 'RETURNED';
	await loanRepository.updateStatus(loanId, NEW_STATUS);

	const book = await bookRepository.findById(loan.bookId);
	const updatedAvailableCopies = book!.availableCopies + 1;

	await bookRepository.updateAvailableCopies(loan.bookId, updatedAvailableCopies);
	
	const updatedLoan: Loan = { ...loan, status: NEW_STATUS };
	return updatedLoan;
}