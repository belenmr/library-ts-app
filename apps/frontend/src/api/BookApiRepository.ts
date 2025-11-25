import type { Book } from '@domain/entities/index';
import type { BookRepository } from '@domain/repositories/book.repository';
import { httpClient } from './httpClient';

export class BookApiRepository implements BookRepository {

	async findAll(): Promise<Book[]> {
		const response = await httpClient.get('/books');
		return response.data;
	}

	async findById(id: string): Promise<Book | null> {
		try {
			const response = await httpClient.get(`/books/${id}`);
			return response.data as Book;
		} catch (error) {
			if ((error as any).response?.status === 404) {
				return null;
			}
			throw new Error('Error al buscar el libro por ID.');
		}
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
		throw new Error("El método save(book: Book) no debe usarse para crear/actualizar copias. Use el formulario 'NewBookPage'.");
	}

	async updateAvailableCopies(id: string, availableCopies: number): Promise<void> {
		await httpClient.put(`/books/${id}`, { availableCopies });
	}

	async addBook(payload: { title: string; author: string; isbn: string; totalCopies: number }): Promise<void> {
		try {
			await httpClient.post('/books', payload);
		} catch (error) {
			const backendError = (error as any).response?.data?.error;
			throw new Error(backendError || 'Error al intentar crear/actualizar el libro.');
		}
	}
}