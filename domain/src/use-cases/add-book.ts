import type { Book } from '../entities/book';
import type { BookRepository } from '../repositories/book.repository';

interface AddBookDeps {
	bookRepository: BookRepository;
}

interface AddBookPayload {
	title: string;
	author: string;
	isbn: string;
	copies: number;
}


export async function addBook(
	{ bookRepository }: AddBookDeps,
	{ title, author, isbn, copies }: AddBookPayload
): Promise<Book | Error> {

	if (!title || !author || !isbn) {
		return new Error('Title, author, and ISBN are required fields.');
	}

	if (!copies || copies <= 0) {
		return new Error('Cannot add zero or negative copies.');
	}

	
	const existingBook = await bookRepository.findByISBN(isbn);
	
	if (existingBook) {
		const updatedBook: Book = {
            ...existingBook,
            totalCopies: existingBook.totalCopies + 1,
            availableCopies: existingBook.availableCopies + 1,
        };

		await bookRepository.save(updatedBook);
		return updatedBook;
	} else {		
		const newBookId = crypto.randomUUID(); 
		
		const newBook: Book = {
			id: newBookId,
			title,
			author,
			isbn,
			totalCopies: copies,
			availableCopies: copies,
		};

		await bookRepository.save(newBook);
		return newBook;
	}
}