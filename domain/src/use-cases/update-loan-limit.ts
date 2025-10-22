import type { LoanLimitConfig } from '../entities/index'; 
import type { LoanLimitConfigRepository } from '../repositories/index';
import { RoleName } from '../entities/index';

interface UpdateLoanLimitDeps {
	loanLimitConfigRepository: LoanLimitConfigRepository;
}

interface UpdateLoanLimitPayload {
	executorRole: RoleName;
	targetRole: typeof RoleName.LIBRARIAN | typeof RoleName.MEMBER; // El rol cuyo límite se quiere cambiar
	newLimit: number; // El nuevo límite máximo de préstamos
}

/**
 * Permite a un usuario ADMIN actualizar el límite de préstamos para un rol específico.
 * Esta acción es transaccional y modifica la regla de negocio almacenada en la DB.
 * @returns La configuración guardada (LoanLimitConfig) o un Error.
 */
export async function updateLoanLimit(
	{ loanLimitConfigRepository }: UpdateLoanLimitDeps,
	{ executorRole, targetRole, newLimit }: UpdateLoanLimitPayload
): Promise<LoanLimitConfig | Error> {

	if (executorRole !== RoleName.ADMIN) {
		return new Error('Access denied. Only ADMIN can modify loan limits.');
	}

	if (newLimit < 0) {
		return new Error('Loan limit cannot be negative.');
	}	

	const newConfig: LoanLimitConfig = {
		roleName: targetRole,
		maxLoans: newLimit,
	};

	await loanLimitConfigRepository.saveLoanLimit(newConfig);

	return newConfig;
}