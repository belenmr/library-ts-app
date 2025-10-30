import { describe, test, expect, vi, beforeEach } from 'vitest';
import { hasPendingFine } from '../../src/use-cases/has-pending-fine';
import type { LoanRepository } from '../../src/repositories/loan.repository';
import type { Loan } from '../../src/entities/loan';

// --- Mocks de Datos ---
const USER_ID_WITH_FINE = 'u-fine-01';
const USER_ID_CLEAN = 'u-clean-02';

const mockOverdueLoans: Loan[] = [
    { id: 'l-001', userId: USER_ID_WITH_FINE, status: 'OVERDUE' } as Loan
];
const mockEmptyLoans: Loan[] = [];

// --- Mocks de Dependencias ---
const mockLoanRepository: LoanRepository = {
	findOverdueLoansByUserId: vi.fn(),
	findActiveLoansByUserId: vi.fn(),
	findAll: vi.fn(),
	findActiveAll: vi.fn(),
	findById: vi.fn(),
	findLoansByUserId: vi.fn(),
	save: vi.fn(),
	updateStatus: vi.fn(),
	findOverdueAll: vi.fn()
};

const deps = { loanRepository: mockLoanRepository };



describe('Has Pending Fine Use Case (hasPendingFine)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: El usuario TIENE préstamos vencidos
    test('should return TRUE if the user has one or more OVERDUE loans', async () => {
        mockLoanRepository.findOverdueLoansByUserId = vi.fn().mockResolvedValue(mockOverdueLoans);
        
        const payload = { userId: USER_ID_WITH_FINE };


        const result = await hasPendingFine(deps, payload);

        expect(result).not.toBeInstanceOf(Error);
        expect(result).toBe(true);
        expect(mockLoanRepository.findOverdueLoansByUserId).toHaveBeenCalledWith(USER_ID_WITH_FINE);
    });

    // TEST 2: El usuario NO tiene préstamos vencidos
    test('should return FALSE if the user has zero OVERDUE loans', async () => {
        mockLoanRepository.findOverdueLoansByUserId = vi.fn().mockResolvedValue(mockEmptyLoans);
        
        const payload = { userId: USER_ID_CLEAN };

        const result = await hasPendingFine(deps, payload);
        expect(result).not.toBeInstanceOf(Error);
        expect(result).toBe(false);
    });
    
    // TEST 3: ID de usuario faltante
    test('should return an Error if the user ID is missing from the payload', async () => {
        const payload = { userId: '' };

        const result = await hasPendingFine(deps, payload);

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('User ID is required.');
        expect(mockLoanRepository.findOverdueLoansByUserId).not.toHaveBeenCalled();
    });
});