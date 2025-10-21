import type { Book } from '../entities/index';
import type { BookRepository } from '../repositories/index';

interface getBookDeps {
    bookRepository: BookRepository;
}

interface getBookPayload {
    bookId: string;
}

export async function getBook(
    {bookRepository}: getBookDeps,
    {bookId}: getBookPayload
): Promise<Book | Error> {
    
    if (!bookId) {
        return new Error("Book ID is required.");
    }

    const book = await bookRepository.findById(bookId);

    if (!book) {
        return new Error (`Book with ID ${bookId} not found`);
    }

    return book;
}