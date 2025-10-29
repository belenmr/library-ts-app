import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getBooks } from '../../src/use-cases/get-books';
import type { BookRepository } from '../../src/repositories/book.repository';
import type { Book } from '../../src/entities/book';

// --- Mocks de Datos ---
const mockBookList: Book[] = [
    { id: 'b-1', title: '1984', author: 'Orwell', isbn: '123', totalCopies: 2, availableCopies: 1 },
    { id: 'b-2', title: 'Brave New World', author: 'Huxley', isbn: '456', totalCopies: 5, availableCopies: 5 },
];

const mockEmptyList: Book[] = [];

// --- Mocks de Dependencias ---
const mockBookRepository: BookRepository = {
    findById: vi.fn(),
    findByISBN: vi.fn(),
    search: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    updateAvailableCopies: vi.fn(),
};

const deps = {
    bookRepository: mockBookRepository,
};



describe('Get Books Use Case (getBooks)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: Retorna la lista completa de libros
    test('should return the full list of books provided by the repository', async () => {
        mockBookRepository.findAll = vi.fn().mockResolvedValue(mockBookList);

        const result = await getBooks(deps);

        expect(result).not.toBeInstanceOf(Error);        
        expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);  
        expect(result).toEqual(mockBookList);
        expect((result as Book[]).length).toBe(2);
    });

    // TEST 2: Retorna una lista vacía si no hay libros
    test('should return an empty array if no books are found in the system', async () => {
        mockBookRepository.findAll = vi.fn().mockResolvedValue(mockEmptyList);

        const result = await getBooks(deps);

        expect(result).not.toBeInstanceOf(Error);
        expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });
    
    // TEST 3: Manejo de errores de la infraestructura (DB)
    test('should propagate an error if the repository fails', async () => {
        mockBookRepository.findAll = vi.fn().mockRejectedValue(new Error("DB Connection Failed")); // Simula un fallo de conexión a la DB

        await expect(getBooks(deps)).rejects.toThrow("DB Connection Failed");
        expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);
    });
});