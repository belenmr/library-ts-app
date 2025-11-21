import { describe, test, expect, vi, beforeEach } from 'vitest';
import { addBook } from '../../src/use-cases/add-book';
import { BookRepository } from '../../src/repositories/index';
import { Book } from '../../src/entities/index';

const MOCK_NEW_ID = 'b-new-uuid';

const existingBook: Book = {
    id: 'b-exist-001',
    title: 'El Señor de los Anillos',
    author: 'J.R.R. Tolkien',
    isbn: '978-0618260214',
    totalCopies: 5,
    availableCopies: 5,
};

const mockBookRepository: BookRepository = {
    findByISBN: vi.fn(),
    save: vi.fn(),
    findById: vi.fn(),
    search: vi.fn(),
    updateAvailableCopies: vi.fn(),
    findAll: vi.fn()
};

const deps = {
    bookRepository: mockBookRepository,
};

vi.stubGlobal('crypto', {
    randomUUID: vi.fn().mockReturnValue(MOCK_NEW_ID),
});


describe('Add Book Use Case (addBook)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: Crear un libro nuevo
    test('should create and save a new book if the ISBN does not exist', async () => {
        mockBookRepository.findByISBN = vi.fn().mockResolvedValue(null);

        const payload = {
            title: 'Dune',
            author: 'Frank Herbert',
            isbn: '978-0441172719',
            copies: 3,
        };

        const result = await addBook(deps, payload);

        expect(result instanceof Error).toBe(false);
        const newBook = result as Book;

        expect(crypto.randomUUID).toHaveBeenCalledTimes(1);

        expect(mockBookRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: MOCK_NEW_ID,
                title: 'Dune',
                totalCopies: 3,
                availableCopies: 3,
            })
        );

        expect(newBook.id).toBe(MOCK_NEW_ID);
    });

    // TEST 2: Actualizar un libro existente (+1 copia)
    test('should update totalCopies and availableCopies by exactly 1 if the ISBN already exists', async () => {
        mockBookRepository.findByISBN = vi.fn().mockResolvedValue(existingBook); // 5 copias

        const payload = {
            title: 'El Señor de los Anillos',
            author: 'J.R.R. Tolkien',
            isbn: existingBook.isbn,
            copies: 10,
        };

        const result = await addBook(deps, payload);

        expect(result instanceof Error).toBe(false);
        const updatedBook = result as Book;

        expect(crypto.randomUUID).not.toHaveBeenCalled();

        expect(mockBookRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: existingBook.id,
                totalCopies: 6,
                availableCopies: 6,
            })
        );

        expect(updatedBook.totalCopies).toBe(6);
    });

    // TEST 3: Validación de copias negativas o cero
    test('should return an Error if copies is zero or negative', async () => {
        const payload = { title: 'Test', author: 'A', isbn: '123', copies: 0 };

        const result = await addBook(deps, payload);

        expect(result instanceof Error).toBe(true);
        expect((result as Error).message).toBe('Cannot add zero or negative copies.');

        expect(mockBookRepository.save).not.toHaveBeenCalled();
    });

    // TEST 4: Validación de campos faltantes
    test('should return an Error if title, author, or isbn are missing', async () => {
        const payload = { title: '', author: 'A', isbn: '123', copies: 1 };

        const result = await addBook(deps, payload);

        expect(result instanceof Error).toBe(true);
        expect((result as Error).message).toBe('Title, author, and ISBN are required fields.');
    });
});