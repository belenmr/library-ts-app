import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getLoan } from '../../src/use-cases/get-loan';
import type { LoanRepository } from '../../src/repositories/loan.repository';
import type { Loan } from '../../src/entities/loan';

// --- Mocks de Datos ---
const mockLoan: Loan = {
	id: 'l-001',
	bookId: 'b-456',
	userId: 'u-123',
	loanDate: new Date('2025-10-01'),
	dueDate: new Date('2025-10-15'),
	returnDate: null,
	status: 'ACTIVE'
};

// --- Mocks de Dependencias ---
const mockLoanRepository: LoanRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    findActiveLoansByUserId: vi.fn(),
    updateStatus: vi.fn(),
    findOverdueLoansByUserId: vi.fn(),
    findOverdueAll: vi.fn(),
    findLoansByUserId: vi.fn(),
    findActiveAll: vi.fn(),
};

const deps = {
    loanRepository: mockLoanRepository,
};



describe('Get Loan Use Case (getLoan)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: Obtener préstamo exitosamente
    test('should return the Loan entity when a valid ID is provided', async () => {
        mockLoanRepository.findById = vi.fn().mockResolvedValue(mockLoan);
        
        const payload = { loanId: 'l-001' };

        const result = await getLoan(deps, payload);

        expect(result).not.toBeInstanceOf(Error);        
        expect(mockLoanRepository.findById).toHaveBeenCalledWith('l-001');
        expect(result).toEqual(mockLoan);
    });

    // TEST 2: Préstamo no encontrado
    test('should return an Error if the loan is not found by ID', async () => {
        mockLoanRepository.findById = vi.fn().mockResolvedValue(null);
        
        const payload = { loanId: 'l-999' };

        const result = await getLoan(deps, payload);

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Loan with ID l-999 not found.');
    });

    // TEST 3: ID de préstamo faltante
    test('should return an Error if the loan ID is missing from the payload', async () => {
        const payload = { loanId: '' };

        const result = await getLoan(deps, payload);

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Loan ID is required.');
        expect(mockLoanRepository.findById).not.toHaveBeenCalled();
    });
});