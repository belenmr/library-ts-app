import type { LoanRepository } from '@domain/repositories/loan.repository';
import type { LoanPolicyService } from '@domain/services/loan-policy.service';
import { LoanStatus } from '@domain/entities/loan';
import { UserRepository } from '@domain/repositories/user.repository';

/**
 * Servicio que se encarga de la lógica transaccional de chequear y actualizar
 * los préstamos vencidos en la base de datos.
 */
export class OverdueCheckerService {
	
	constructor(
		private readonly loanRepository: LoanRepository,
		private readonly loanPolicyService: LoanPolicyService,
		private readonly userRepository: UserRepository
	) {}

	/**
	 * Ejecuta el chequeo y actualiza los préstamos a OVERDUE si es necesario.
	 */
	public async checkAndMarkOverdue(): Promise<number> {
		console.log('--- Iniciando chequeo de préstamos vencidos...');		

		const activeLoans = await this.loanRepository.findActiveAll();

		let updatedCount = 0;

		for (const loan of activeLoans) {
			
			const shouldBeOverdue = this.loanPolicyService.isLoanOverdue(loan);

			
			if (shouldBeOverdue && loan.status !== LoanStatus.OVERDUE) { // Si debe estar vencido Y su estado ACTUAL no es OVERDUE, se actualiza la DB.
				
				await this.loanRepository.updateStatus(loan.id, LoanStatus.OVERDUE);
				console.log(`[OVERDUE] Préstamo ${loan.id} marcado como vencido.`);
				
				const user = await this.userRepository.findById(loan.userId);
				if (user && !user.hasPendingFine) {
					user.hasPendingFine = true;
					await this.userRepository.save(user); // Persistir el cambio en el usuario
				}

				updatedCount++;
			}
		}
		
		console.log(`--- Chequeo finalizado. Préstamos actualizados: ${updatedCount}`);
		return updatedCount;
	}
}