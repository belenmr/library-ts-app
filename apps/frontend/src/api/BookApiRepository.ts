import type { Book } from '@domain/entities/index';
import type { BookRepository } from '@domain/repositories/book.repository';
import { httpClient } from './httpClient';

export class BookApiRepository implements BookRepository {

	async findAll(): Promise<Book[]> {
		const response = await httpClient.get('/books');
		return response.data;
	}

	async findById(id: string): Promise<Book | null> {
		const response = await httpClient.get(`/books/${id}`);
		return response.data;
	}

	async search(query: string): Promise<Book[]> {
		const response = await httpClient.get(`/books/search?q=${query}`);
		return response.data;
	}

	async findByISBN(isbn: string): Promise<Book | null> {
		const response = await httpClient.get(`/books/isbn/${isbn}`);
		return response.data;
	}

	async save(book: Book): Promise<void> {
		throw new Error("save(book: Book) no implementado en el frontend. Usa addBook(payload) para crear/actualizar copias.");
	}

	async addBook(payload: { title: string; author: string; isbn: string; copies: number }): Promise<void> {
		try {
			await httpClient.post('/books', payload);
		} catch (error) {
			throw new Error((error as any).response?.data?.message || 'Error de addBook en backend.');
		}
	}

	async updateAvailableCopies(id: string, availableCopies: number): Promise<void> {
		await httpClient.put(`/books/${id}`, { availableCopies });
	}
}