import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getActiveLoans } from '../../src/use-cases/get-active-loans';
import type { LoanRepository } from '../../src/repositories/loan.repository';
import type { Loan } from '../../src/entities/loan';

// --- Mocks de Datos ---
const USER_ID = 'u-001';
const MOCK_LOANS_ACTIVE_ALL: Loan[] = [{ id: 'l1', userId: USER_ID } as Loan, { id: 'l2', userId: 'u2' } as Loan];
const MOCK_LOANS_ACTIVE_USER: Loan[] = [{ id: 'l1', userId: USER_ID,  } as Loan];

// --- Mocks de Dependencias ---
const mockLoanRepository: LoanRepository = {
    findActiveLoansByUserId: vi.fn(),
    findActiveAll: vi.fn(),

    findById: vi.fn(),
    findAll: vi.fn(),
    findLoansByUserId: vi.fn(),
    save: vi.fn(),
    updateStatus: vi.fn(),
};

const deps = { loanRepository: mockLoanRepository };



describe('Get Active Loans Use Case (getActiveLoans)', () => {

    beforeEach(() => { vi.clearAllMocks(); });

    // TEST 1: Con userId -> Devuelve solo los préstamos ACTIVOS de ese usuario
    test('should call findActiveLoansByUserId and return only active loans for a specific user', async () => {
        mockLoanRepository.findActiveLoansByUserId = vi.fn().mockResolvedValue(MOCK_LOANS_ACTIVE_USER);
        const payload = { userId: USER_ID };

        const result = await getActiveLoans(deps, payload);

        expect(result).not.toBeInstanceOf(Error);
        expect(result).toEqual(MOCK_LOANS_ACTIVE_USER);
        expect(mockLoanRepository.findActiveLoansByUserId).toHaveBeenCalledWith(USER_ID);
        expect(mockLoanRepository.findActiveAll).not.toHaveBeenCalled();
    });

    // TEST 2: Sin userId -> Devuelve todos los préstamos ACTIVOS del sistema
    test('should call findActiveAll and return all active loans in the system when no userId is provided', async () => {
        mockLoanRepository.findActiveAll = vi.fn().mockResolvedValue(MOCK_LOANS_ACTIVE_ALL);
        const payload = {}; 

        const result = await getActiveLoans(deps, payload);

        expect(result).not.toBeInstanceOf(Error);
        expect(result).toEqual(MOCK_LOANS_ACTIVE_ALL);
        expect(mockLoanRepository.findActiveAll).toHaveBeenCalledTimes(1);
        expect(mockLoanRepository.findActiveLoansByUserId).not.toHaveBeenCalled();
    });
});