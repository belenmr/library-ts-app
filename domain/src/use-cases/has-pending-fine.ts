import type { LoanRepository } from '../repositories/loan.repository';

// --- Dependencias ---
interface HasPendingFineDeps {
	loanRepository: LoanRepository;
}

// --- Datos de Entrada ---
interface HasPendingFinePayload {
	userId: string;
}


export async function hasPendingFine(
	{ loanRepository }: HasPendingFineDeps,
	{ userId }: HasPendingFinePayload
): Promise<boolean | Error> {
	
	if (!userId) {
		return new Error("User ID is required.");
	}

	const overdueLoans = await loanRepository.findOverdueLoansByUserId(userId);

	const hasFine = overdueLoans.length > 0;

	return hasFine;
}