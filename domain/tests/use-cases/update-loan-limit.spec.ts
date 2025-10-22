import { describe, test, expect, vi, beforeEach } from 'vitest';
import { updateLoanLimit } from '../../src/use-cases/index'; 
import { RoleName } from '../../src/entities/index';
import type { LoanLimitConfig } from '../../src/entities/index'; 
import type { LoanLimitConfigRepository } from '../../src/repositories/index'; 

// Mocks de Datos
const ADMIN_ROLE = RoleName.ADMIN;
const MEMBER_ROLE = RoleName.MEMBER;
const LIBRARIAN_ROLE = RoleName.LIBRARIAN;

// Mocks de Dependencias
const mockLoanLimitConfigRepository: LoanLimitConfigRepository = {
	saveLoanLimit: vi.fn(async () => {}),
	findLoanLimitByRole: vi.fn(), 
};

const deps = {
	loanLimitConfigRepository: mockLoanLimitConfigRepository,
};


describe('Update Loan Limit Use Case', () => {

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// TEST 1: Éxito al actualizar el límite para un Miembro (MEMBER)
	test('should successfully save the new limit for MEMBER when executed by ADMIN', async () => {
		const newLimit = 5;
		const payload = { 
			executorRole: ADMIN_ROLE, 
			targetRole: MEMBER_ROLE, 
			newLimit: newLimit 
		};

		const result = await updateLoanLimit(deps, payload);

		expect(result).not.toBeInstanceOf(Error);
		expect(mockLoanLimitConfigRepository.saveLoanLimit).toHaveBeenCalledTimes(1);

		const expectedConfig: LoanLimitConfig = { 
			roleName: MEMBER_ROLE, 
			maxLoans: newLimit 
		};
		expect(mockLoanLimitConfigRepository.saveLoanLimit).toHaveBeenCalledWith(expectedConfig);
		
		expect(result).toEqual(expectedConfig);
	});

	// TEST 2: Fallo por Permiso (Ejecutado por MEMBER)
	test('should return an Error and NOT save if the executor is not ADMIN', async () => {
		const payload = { 
			executorRole: MEMBER_ROLE,
			targetRole: LIBRARIAN_ROLE, 
			newLimit: 10 
		};

		const result = await updateLoanLimit(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Access denied. Only ADMIN can modify loan limits.');
		expect(mockLoanLimitConfigRepository.saveLoanLimit).not.toHaveBeenCalled();
	});

	// TEST 3: Fallo de Validación (Límite negativo)
	test('should return an Error if the new limit is negative', async () => {
		const payload = { 
			executorRole: ADMIN_ROLE, 
			targetRole: MEMBER_ROLE, 
			newLimit: -1 
		};

		const result = await updateLoanLimit(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Loan limit cannot be negative.');
		expect(mockLoanLimitConfigRepository.saveLoanLimit).not.toHaveBeenCalled();
	});
});