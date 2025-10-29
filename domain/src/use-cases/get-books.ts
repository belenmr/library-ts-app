import type { Book } from '../entities/book.js';
import type { BookRepository } from '../repositories/book.repository';

// --- Dependencias ---
interface GetBooksDeps {
	bookRepository: BookRepository;
}

export async function getBooks(
	{ bookRepository }: GetBooksDeps,
): Promise<Book[] | Error> {    
	const books = await bookRepository.findAll(); 

	return books;
}