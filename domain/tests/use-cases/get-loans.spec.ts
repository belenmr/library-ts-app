import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getLoans } from '../../src/use-cases/get-loans';
import type { LoanRepository } from '../../src/repositories/loan.repository';
import type { Loan } from '../../src/entities/loan';

// --- Mocks de Datos ---
const USER_ID = 'u-001';
const MOCK_LOANS_ALL: Loan[] = [{ id: 'l1', userId: USER_ID } as Loan, { id: 'l2', userId: 'u2' } as Loan];
const MOCK_LOANS_USER: Loan[] = [{ id: 'l1', userId: USER_ID } as Loan];

const mockLoanRepository: LoanRepository = {
    findLoansByUserId: vi.fn(),
    findAll: vi.fn(),    
    findById: vi.fn(),
    findActiveLoansByUserId: vi.fn(),
    findActiveAll: vi.fn(),
    save: vi.fn(),
    updateStatus: vi.fn(),
    findOverdueLoansByUserId: vi.fn(),
    findOverdueAll: vi.fn(),
};

const deps = { loanRepository: mockLoanRepository };


describe('Get Loans Use Case (getLoans)', () => {

    beforeEach(() => { vi.clearAllMocks(); });

    // TEST 1: Con userId -> Devuelve todos los préstamos de ese usuario (Activos + Inactivos)
    test('should call findLoansByUserId and return loans for a specific user', async () => {
        // ARRANGE
        mockLoanRepository.findLoansByUserId = vi.fn().mockResolvedValue(MOCK_LOANS_USER);
        const payload = { userId: USER_ID };

        const result = await getLoans(deps, payload);

        expect(result).not.toBeInstanceOf(Error);
        expect(result).toEqual(MOCK_LOANS_USER);
        expect(mockLoanRepository.findLoansByUserId).toHaveBeenCalledWith(USER_ID);
        expect(mockLoanRepository.findAll).not.toHaveBeenCalled();
    });

    // TEST 2: Sin userId -> Devuelve todos los préstamos del sistema
    test('should call findAll and return all loans in the system when no userId is provided', async () => {
        mockLoanRepository.findAll = vi.fn().mockResolvedValue(MOCK_LOANS_ALL);
        const payload = {}; 

        const result = await getLoans(deps, payload);

        expect(result).not.toBeInstanceOf(Error);
        expect(result).toEqual(MOCK_LOANS_ALL);
        expect(mockLoanRepository.findAll).toHaveBeenCalledTimes(1);
        expect(mockLoanRepository.findLoansByUserId).not.toHaveBeenCalled();
    });
});