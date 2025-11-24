import type { Loan } from '@domain/entities';
import { LoanApiRepository } from '../api/LoanApiRepository';
import { bookModule } from './bookModule';
import { userModule } from './userModule';

const loanRepositoryInstance = new LoanApiRepository();

interface EnrichedLoan extends Loan {
	bookTitle: string;
	bookIsbn: string;
	userEmail: string;
}

export const loanModule = {
	createLoan: async (userId: string, bookId: string): Promise<void> => {

		await loanRepositoryInstance.save({
			userId,
			bookId,
			id: '',
			loanDate: new Date(),
			dueDate: new Date(),
			returnDate: null,
			status: 'ACTIVE',
		});
	},

	findActiveLoansByUserId: (userId: string) => loanRepositoryInstance.findActiveLoansByUserId(userId),

	async findLoans(): Promise<EnrichedLoan[] | Error> {
		try {
			const loans = await loanRepositoryInstance.findAll();

			const allBooks = await bookModule.getBooks();
			const allUsers = await userModule.findUsers();

			const bookMap = new Map(allBooks.map(book => [book.id, book]));
			const userMap = new Map(allUsers.map(user => [user.id, user]));

			const enrichedLoans: EnrichedLoan[] = loans.map(loan => {
				const book = bookMap.get(loan.bookId);
				const user = userMap.get(loan.userId);

				return {
					...loan,
					bookTitle: book?.title || 'Libro Desconocido',
					bookIsbn: book?.isbn || 'N/A',
					userEmail: user?.email || 'Usuario Desconocido',
				};
			});

			return enrichedLoans;
		} catch (error) {
			return new Error(`Error al obtener datos de préstamos: ${(error as Error).message}`);
		}
	},
};