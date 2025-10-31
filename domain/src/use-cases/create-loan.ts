import { randomUUID } from 'crypto';
import type { Loan } from '../entities/loan';
import type { BookRepository, LoanRepository, UserRepository } from '../repositories';
import type { LoanPolicyService } from '../services/loan-policy.service';
import type { LoanStatus as LoanStatusValues } from '../entities/loan';

// --- Dependencias ---
interface CreateLoanDeps {
	userRepository: UserRepository;
	bookRepository: BookRepository;
	loanRepository: LoanRepository;
	loanPolicyService: LoanPolicyService;
}

// --- Datos de Entrada ---
interface CreateLoanPayload {
	userId: string;
	bookId: string;
}


const LOAN_DURATION_DAYS = 20; // Regla de negocio: Duración del préstamo (20 días por defecto)

export async function createLoan(
	{ userRepository, bookRepository, loanRepository, loanPolicyService }: CreateLoanDeps,
	{ userId, bookId }: CreateLoanPayload
): Promise<Loan | Error> {
	
	if (!userId || !bookId) {
		return new Error("User ID and Book ID are required.");
	}


	const userPromise = userRepository.findById(userId);
	const bookPromise = bookRepository.findById(bookId);

	const [user, book] = await Promise.all([userPromise, bookPromise]);

	if (!user) {
		return new Error(`User with ID ${userId} not found.`);
	}
	if (!book) {
		return new Error(`Book with ID ${bookId} not found.`);
	}

	
	if (book.availableCopies <= 0) {
		return new Error(`Book "${book.title}" has no available copies for loan.`);
	}
	
	
	const activeLoans = await loanRepository.findActiveLoansByUserId(userId);

	const isAllowed = loanPolicyService.canUserBorrow(user, activeLoans);
	if (!isAllowed) {
		return new Error("Loan policy violation: User cannot borrow this book (limit, fine, or role restriction).");
	}


	const loanDate = new Date();
	const dueDate = new Date();
	dueDate.setDate(loanDate.getDate() + LOAN_DURATION_DAYS);

	const newLoanId = randomUUID();
	const newLoan: Loan = {
		id: newLoanId,
		bookId: book.id,
		userId: user.id,
		loanDate: loanDate,
		dueDate: dueDate,
		returnDate: null,
		status: 'ACTIVE' as LoanStatusValues,
	};

	await loanRepository.save(newLoan);
	
	const updatedAvailableCopies = book.availableCopies - 1;
	await bookRepository.updateAvailableCopies(book.id, updatedAvailableCopies);
	
	return newLoan;
}