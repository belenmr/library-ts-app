import { LoanApiRepository } from '../api/LoanApiRepository';

const loanRepositoryInstance = new LoanApiRepository();

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

	findActiveLoansByUserId: (userId: string) =>
		loanRepositoryInstance.findActiveLoansByUserId(userId),
};