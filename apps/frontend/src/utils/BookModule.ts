import { BookApiRepository } from '../api/BookApiRepository';
import { getBooks } from '@domain/use-cases/get-books';
//import { addBook } from '@domain/use-cases/add-book';
//import { getBook } from '@domain/use-cases/get-book';

const bookRepositoryInstance = new BookApiRepository();

export const bookModule = {
	getBooks: () => getBooks({ bookRepository: bookRepositoryInstance }),
};