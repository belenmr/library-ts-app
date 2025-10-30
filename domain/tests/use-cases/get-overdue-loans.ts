import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getOverdueLoans } from '../../src/use-cases/get-overdue-loans';
import type { LoanRepository } from '../../src/repositories/loan.repository';
import type { Loan } from '../../src/entities/loan';

// --- Mocks de Datos ---
const USER_ID = 'u-001';
const MOCK_LOANS_OVERDUE_ALL: Loan[] = [{ id: 'l1', userId: USER_ID } as Loan, { id: 'l2', userId: 'u2' } as Loan];
const MOCK_LOANS_OVERDUE_USER: Loan[] = [{ id: 'l1', userId: USER_ID,  } as Loan];

// --- Mocks de Dependencias ---
const mockLoanRepository: LoanRepository = {
	findOverdueLoansByUserId: vi.fn(),
	findOverdueAll: vi.fn(),
	findById: vi.fn(),
	findActiveLoansByUserId: vi.fn(),
	findActiveAll: vi.fn(),
	findAll: vi.fn(),
	findLoansByUserId: vi.fn(),
	save: vi.fn(),
	updateStatus: vi.fn(),
};

const deps = { loanRepository: mockLoanRepository };



describe('Get Active Loans Use Case (getOverdueLoans)', () => {

	beforeEach(() => { vi.clearAllMocks(); });

	// TEST 1: Con userId -> Devuelve solo los préstamos VENCIDOS de ese usuario
	test('should call findOverdueLoansByUserId and return only overdue loans for a specific user', async () => {
		mockLoanRepository.findOverdueLoansByUserId = vi.fn().mockResolvedValue(MOCK_LOANS_OVERDUE_USER);
		const payload = { userId: USER_ID };

		const result = await getOverdueLoans(deps, payload);

		expect(result).not.toBeInstanceOf(Error);
		expect(result).toEqual(MOCK_LOANS_OVERDUE_USER);
		expect(mockLoanRepository.findOverdueLoansByUserId).toHaveBeenCalledWith(USER_ID);
		expect(mockLoanRepository.findOverdueAll).not.toHaveBeenCalled();
	});

	// TEST 2: Sin userId -> Devuelve todos los préstamos VENCIDOS del sistema
	test('should call findOverdueAll and return all overdue loans in the system when no userId is provided', async () => {
		mockLoanRepository.findOverdueAll = vi.fn().mockResolvedValue(MOCK_LOANS_OVERDUE_ALL);
		const payload = {}; 

		const result = await getOverdueLoans(deps, payload);

		expect(result).not.toBeInstanceOf(Error);
		expect(result).toEqual(MOCK_LOANS_OVERDUE_ALL);
		expect(mockLoanRepository.findOverdueAll).toHaveBeenCalledTimes(1);
		expect(mockLoanRepository.findOverdueLoansByUserId).not.toHaveBeenCalled();
	});
});