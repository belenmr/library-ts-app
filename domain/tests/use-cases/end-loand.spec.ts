import { describe, test, expect, vi, beforeEach } from 'vitest';
import { endLoan } from '../../src/use-cases/end-loan.js';
import type { BookRepository, LoanRepository } from '../../src/repositories';
import type { Loan, Book } from '../../src/entities';
import { LoanStatus } from '../../src/entities/loan.js';


// --- Mocks de Datos ---
const LOAN_ID = 'l-001';
const BOOK_ID = 'b-005';
const UPDATED_AVAILABLE_COPIES = 3;

const mockActiveLoan: Loan = {
	id: LOAN_ID,
	bookId: BOOK_ID,
	userId: 'u-100',
	loanDate: new Date(),
	dueDate: new Date(),
	returnDate: null,
	status: LoanStatus.ACTIVE,
} as Loan;

const mockOverdueLoan: Loan = {
	...mockActiveLoan,
	status: LoanStatus.OVERDUE,
} as Loan;

const mockReturnedLoan: Loan = {
	...mockActiveLoan,
	status: LoanStatus.RETURNED,
	returnDate: new Date(),
} as Loan;

const mockBook: Book = {
	id: BOOK_ID,
	title: 'Valid Book',
	author: 'Author',
	isbn: '123',
	totalCopies: 5,
	availableCopies: 2,
} as Book;

// --- Mocks de Dependencias ---
const mockLoanRepository: LoanRepository = {
	findById: vi.fn(),
	updateStatus: vi.fn(async () => {}),
	findLoansByUserId: vi.fn(),
    findAll: vi.fn(),
	findActiveLoansByUserId: vi.fn(),
    findActiveAll: vi.fn(),
    save: vi.fn(),
	findOverdueLoansByUserId: vi.fn(),
    findOverdueAll: vi.fn(),
}; 

const mockBookRepository: BookRepository = {
	findById: vi.fn(),
	updateAvailableCopies: vi.fn(async () => {}),
	findByISBN: vi.fn(),
	search: vi.fn(),
	save: vi.fn(),
	findAll: vi.fn()
};

const deps = {
	loanRepository: mockLoanRepository,
	bookRepository: mockBookRepository,
};



describe('End Loan Use Case (endLoan)', () => {

	beforeEach(() => {
		vi.clearAllMocks();		
		mockBookRepository.findById = vi.fn().mockResolvedValue(mockBook);
	});

	// TEST 1: Préstamo ACTIVO se devuelve correctamente
	test('should change status to RETURNED and increment available copies when loan is ACTIVE', async () => {
		mockLoanRepository.findById = vi.fn().mockResolvedValue(mockActiveLoan);

		const result = await endLoan(deps, { loanId: LOAN_ID });

		expect(result).not.toBeInstanceOf(Error);
		expect((result as Loan).status).toBe(LoanStatus.RETURNED);
		expect(mockLoanRepository.updateStatus).toHaveBeenCalledWith(LOAN_ID, LoanStatus.RETURNED);
		expect(mockBookRepository.updateAvailableCopies).toHaveBeenCalledWith(BOOK_ID, UPDATED_AVAILABLE_COPIES);
	});
	
	// TEST 2: Préstamo VENCIDO (OVERDUE) se devuelve correctamente
	test('should change status to RETURNED and increment available copies when loan is OVERDUE', async () => {
		mockLoanRepository.findById = vi.fn().mockResolvedValue(mockOverdueLoan);

		const result = await endLoan(deps, { loanId: LOAN_ID });

		expect(result).not.toBeInstanceOf(Error);
		expect((result as Loan).status).toBe(LoanStatus.RETURNED);
		expect(mockLoanRepository.updateStatus).toHaveBeenCalledWith(LOAN_ID, LoanStatus.RETURNED);
		expect(mockBookRepository.updateAvailableCopies).toHaveBeenCalledWith(BOOK_ID, UPDATED_AVAILABLE_COPIES);
	});

	// TEST 3: Fallo - Préstamo no encontrado
	test('should return an Error if the loan ID is not found', async () => {
		mockLoanRepository.findById = vi.fn().mockResolvedValue(null);
		
		const result = await endLoan(deps, { loanId: 'l-999' });

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toContain('Loan with ID l-999 not found.');		
		expect(mockLoanRepository.updateStatus).not.toHaveBeenCalled(); // Debe fallar antes de actualizar
		expect(mockBookRepository.updateAvailableCopies).not.toHaveBeenCalled();
	});

	// TEST 4: Fallo - Préstamo ya devuelto
	test('should return an Error if the loan is already RETURNED', async () => {
		mockLoanRepository.findById = vi.fn().mockResolvedValue(mockReturnedLoan);
		
		const result = await endLoan(deps, { loanId: LOAN_ID });

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toContain('Loan with ID l-001 has already been returned.');		
		expect(mockLoanRepository.updateStatus).not.toHaveBeenCalled(); // Debe fallar antes de actualizar
		expect(mockBookRepository.updateAvailableCopies).not.toHaveBeenCalled();
	});	
});