import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getBook } from '../../src/use-cases/get-book'; 
import type { BookRepository } from '../../src/repositories/book.repository'; 
import type { Book } from '../../src/entities/book';

const mockBook: Book = {
	id: 'b-123',
	title: 'Cien Años de Soledad',
	author: 'Gabriel García Márquez',
	isbn: '978-0307474728',
	totalCopies: 5,
	availableCopies: 3,
}

const mockBookRepository: BookRepository = {    
	findById: vi.fn(), 
	findByISBN: vi.fn(),
	search: vi.fn(),
	save: vi.fn(),
	updateAvailableCopies: vi.fn(),
};

const deps = {
	bookRepository: mockBookRepository,
};


describe("getBook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('should return the Book entity when a valid ID is provided', async () => {
		mockBookRepository.findById = vi.fn().mockResolvedValue(mockBook);
		const payload = { bookId: 'b-123'};

		const result = await getBook(deps, payload);

		expect(mockBookRepository.findById).toHaveBeenCalledWith('b-123');
		expect(result instanceof Error).toBe(false);
		expect(result).toEqual(mockBook);
	});

	test('should return an Error if the book is not found by ID', async () => {
    	mockBookRepository.findById = vi.fn().mockResolvedValue(null);
        
        const payload = { bookId: 'b-999-missing' };

        const result = await getBook(deps, payload);

		expect(result instanceof Error).toBe(true);
		expect((result as Error).message).toBe('Book with ID b-999-missing not found');
    });

	test('should return an Error if the book ID is missing from the payload', async () => {
        const payload = { bookId: '' };

        const result = await getBook(deps, payload);

        expect(result instanceof Error).toBe(true);
        expect((result as Error).message).toBe('Book ID is required.');
        expect(mockBookRepository.findById).not.toHaveBeenCalled();
    });
});