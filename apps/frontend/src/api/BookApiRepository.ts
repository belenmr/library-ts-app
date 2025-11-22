import type { Book } from '@domain/entities/index';
import type { BookRepository } from '@domain/repositories/book.repository';
import { HttpClient } from './HttpClient';

export class BookApiRepository implements BookRepository {

	async findAll(): Promise<Book[]> {
		const response = await HttpClient.get('/books');
		return response.data;
	}

	async findById(id: string): Promise<Book | null> {
		const response = await HttpClient.get(`/books/${id}`);
		return response.data;
	}

	async search(query: string): Promise<Book[]> {
		const response = await HttpClient.get(`/books/search?q=${query}`);
		return response.data;
	}

	async findByISBN(isbn: string): Promise<Book | null> {
		const response = await HttpClient.get(`/books/isbn/${isbn}`);
		return response.data;
	}

	async save(book: Book): Promise<void> {
		await HttpClient.post('/books', book);
	}

	async updateAvailableCopies(id: string, availableCopies: number): Promise<void> {
		await HttpClient.put(`/books/${id}`, { availableCopies });
	}
}