import { LoanPolicyService } from '../services/loan-policy.service';
import type { User } from '../entities/user';
import type { Loan } from '../entities/loan';
import { RoleName } from '../entities/role';
import type { LoanLimitConfigRepository } from '../repositories/loan-limit-config.repository';

// Límites por defecto 
const DEFAULT_LOAN_LIMITS: Record<RoleName, number> = {
	[RoleName.MEMBER]: 2,
	[RoleName.LIBRARIAN]: 0,
	[RoleName.ADMIN]: 0,
};


export class DefaultLoanPolicyService implements LoanPolicyService {
	
	constructor(private readonly configRepository: LoanLimitConfigRepository) {}

	// Función auxiliar para obtener el límite: lee primero de la DB, si falla, usa el valor por defecto
	private async getLimit(roleName: RoleName): Promise<number> {
		const config = await this.configRepository.findLoanLimitByRole(roleName);
		
		if (config) {
			return config.maxLoans;
		}        
		
		return DEFAULT_LOAN_LIMITS[roleName] || 0; // Usar el valor por defecto si no hay configuración en la DB
	}

	/**
	 * Verifica si el usuario puede pedir prestado.
	 * La lógica de multa se asume que está en la Entidad User.
	 */
	async canUserBorrow(user: User, activeLoans: Loan[]): Promise<boolean> {
		if (user.hasPendingFine) {
			return false;
		}

		const maxLoans = await this.getLimit(user.role.name);
		
		if (activeLoans.length >= maxLoans) {
			return false;
		}

		return true;
	}

	isLoanOverdue(loan: Loan): boolean {
		if (loan.returnDate) {
			return false;
		}

		const today = new Date();
		return today > loan.dueDate;
	}
}