import { BookApiRepository } from '../api/BookApiRepository';

const bookRepositoryInstance = new BookApiRepository();

export const bookModule = {
	getBooks: () => bookRepositoryInstance.findAll(),

	addBook: (payload: { title: string; author: string; isbn: string; totalCopies: number }) =>
		bookRepositoryInstance.addBook(payload),

	getBook: (bookId: string) => bookRepositoryInstance.findById(bookId),
};

