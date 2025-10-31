import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createLoan } from '../../src/use-cases/create-loan';
import type { BookRepository, LoanRepository, UserRepository } from '../../src/repositories';
import type { LoanPolicyService } from '../../src/services/loan-policy.service';
import type { Book, Loan, User } from '../../src/entities';
import { RoleName } from '../../src/entities/role';

// --- Mocks de Datos y Dependencias ---
const MOCK_LOAN_ID = 'l-new-001';
const MEMBER_ID = 'u-member-1';
const BOOK_ID = 'b-valid-1';
const UNAVAILABLE_BOOK_ID = 'b-zero-copies';
const INITIAL_COPIES = 5;

// --- Entidades Mock ---
const MOCK_USER: User = { 
	id: MEMBER_ID, 
	name: 'Jane',
	surname: 'Porter',
	email: 'jp@test.com', 
	role: {id: 'r-m', name: RoleName.MEMBER, permissions: []}, 
	passwordHash: 'h', 
	hasPendingFine: false 
};
const MOCK_BOOK_AVAILABLE: Book = { 
	id: BOOK_ID, 
	title: 'Valid', 
	author: 'A', 
	isbn: '1', 
	totalCopies: 5, 
	availableCopies: INITIAL_COPIES 
};
const MOCK_BOOK_UNAVAILABLE: Book = { 
	id: UNAVAILABLE_BOOK_ID, 
	title: 'Unavailable', 
	author: 'B', 
	isbn: '2', 
	totalCopies: 5, 
	availableCopies: 0 
};
const MOCK_ACTIVE_LOANS: Loan[] = []; 

// --- Mocks Repositorios y Servicios ---
const mockUserRepository: UserRepository = { 
	findById: vi.fn(), 
	findByEmail: vi.fn(), 
	findAll: vi.fn(), 
	findByRole: vi.fn(), 
	save: vi.fn() 
};
const mockBookRepository: BookRepository = { 
	findById: vi.fn(), 
	updateAvailableCopies: vi.fn(async () => {}), 
	save: vi.fn(), findAll: vi.fn(), 
	findByISBN: vi.fn(), 
	search: vi.fn() 
};
const mockLoanRepository: LoanRepository = {
	findActiveLoansByUserId: vi.fn(),
	save: vi.fn(async () => { }),
	findById: vi.fn(),
	findAll: vi.fn(),
	findLoansByUserId: vi.fn(),
	findActiveAll: vi.fn(),
	updateStatus: vi.fn(),
	findOverdueLoansByUserId: vi.fn(),
	findOverdueAll: vi.fn()
};
const mockLoanPolicyService: LoanPolicyService = { canUserBorrow: vi.fn(), isLoanOverdue: vi.fn() };

const deps = { 
	userRepository: mockUserRepository, 
	bookRepository: mockBookRepository, 
	loanRepository: mockLoanRepository, 
	loanPolicyService: mockLoanPolicyService 
};

// --- Mock del generador de ID y fecha fija para consistencia ---
vi.mock('crypto', () => ({ randomUUID: vi.fn(() => MOCK_LOAN_ID) }));
const now = new Date('2025-10-10T12:00:00.000Z');
vi.spyOn(global, 'Date').mockImplementation(() => now as any);

const LOAN_DURATION_DAYS = 20; // Duración del Caso de Uso (20 días)



describe('Create Loan Use Case (createLoan)', () => {

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// TEST 1: Creación de préstamo exitosamente
	test('should successfully create a loan, decrement book copies, and set correct dueDate', async () => {
		mockUserRepository.findById = vi.fn().mockResolvedValue(MOCK_USER);
		mockBookRepository.findById = vi.fn().mockResolvedValue(MOCK_BOOK_AVAILABLE);
		mockLoanRepository.findActiveLoansByUserId = vi.fn().mockResolvedValue(MOCK_ACTIVE_LOANS);
		mockLoanPolicyService.canUserBorrow = vi.fn().mockReturnValue(true);

		const payload = { userId: MEMBER_ID, bookId: BOOK_ID };
		
		// Calcular la fecha esperada (20 días después de 2025-10-10)
		const expectedDueDate = new Date(now);
		expectedDueDate.setDate(now.getDate() + LOAN_DURATION_DAYS);

		const result = await createLoan(deps, payload);

		expect(result).not.toBeInstanceOf(Error);
		const newLoan = result as Loan;
		
		// Verificación de llamadas de persistencia
		expect(mockLoanRepository.save).toHaveBeenCalledTimes(1);
		expect(mockBookRepository.updateAvailableCopies).toHaveBeenCalledTimes(1);
		
		// Verificación de la actualización de copias
		const expectedUpdatedCopies = INITIAL_COPIES - 1;
		expect(mockBookRepository.updateAvailableCopies).toHaveBeenCalledWith(BOOK_ID, expectedUpdatedCopies);
		
		// Verificación de fechas
		expect(newLoan.loanDate).toEqual(now);
		expect(newLoan.dueDate).toEqual(expectedDueDate);
		
		// Verificación de llamada a la política de préstamo
		expect(mockLoanPolicyService.canUserBorrow).toHaveBeenCalledWith(MOCK_USER, MOCK_ACTIVE_LOANS);
	});

	// TEST 2: Fallo (Validación de Datos) - ID de usuario o libro faltante
	test('should return an Error if User ID or Book ID are missing', async () => {
		const payload = { userId: '', bookId: BOOK_ID }; // User ID missing

		const result = await createLoan(deps, payload);

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe("User ID and Book ID are required.");
		expect(mockUserRepository.findById).not.toHaveBeenCalled();
	});

	// TEST 3: Fallo (Validación de Datos) - Usuario no encontrado
	test('should return an Error if the user is not found', async () => {
		mockUserRepository.findById = vi.fn().mockResolvedValue(null);
		mockBookRepository.findById = vi.fn().mockResolvedValue(MOCK_BOOK_AVAILABLE);

		const result = await createLoan(deps, { userId: 'u-invalid', bookId: BOOK_ID });

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toContain("User with ID u-invalid not found.");
		expect(mockLoanPolicyService.canUserBorrow).not.toHaveBeenCalled(); 
	});

	// TEST 4: Fallo (Validación de Datos) - Libro no encontrado
	test('should return an Error if the book is not found', async () => {
		mockUserRepository.findById = vi.fn().mockResolvedValue(MOCK_USER);
		mockBookRepository.findById = vi.fn().mockResolvedValue(null); // Book not found

		const result = await createLoan(deps, { userId: MEMBER_ID, bookId: 'b-invalid' });

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toContain("Book with ID b-invalid not found.");
		expect(mockLoanPolicyService.canUserBorrow).not.toHaveBeenCalled(); 
	});
	
	// TEST 5: Fallo (Reglas de Negocio) - Libro sin copias disponibles
	test('should return an Error if the book has no available copies', async () => {
		mockUserRepository.findById = vi.fn().mockResolvedValue(MOCK_USER);
		mockBookRepository.findById = vi.fn().mockResolvedValue(MOCK_BOOK_UNAVAILABLE); // 0 copies

		const result = await createLoan(deps, { userId: MEMBER_ID, bookId: UNAVAILABLE_BOOK_ID });

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toContain("has no available copies for loan.");
		expect(mockLoanRepository.save).not.toHaveBeenCalled();
	});

	// TEST 6: Fallo (Reglas de Negocio) - Usuario no puede pedir préstamo
	test('should return an Error if the LoanPolicyService denies the loan (e.g., limit reached)', async () => {
		mockUserRepository.findById = vi.fn().mockResolvedValue(MOCK_USER);
		mockBookRepository.findById = vi.fn().mockResolvedValue(MOCK_BOOK_AVAILABLE);
		mockLoanPolicyService.canUserBorrow = vi.fn().mockReturnValue(false);

		const result = await createLoan(deps, { userId: MEMBER_ID, bookId: BOOK_ID });

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe("Loan policy violation: User cannot borrow this book (limit, fine, or role restriction).");
		expect(mockLoanRepository.save).not.toHaveBeenCalled();
		expect(mockBookRepository.updateAvailableCopies).not.toHaveBeenCalled();
	});
});