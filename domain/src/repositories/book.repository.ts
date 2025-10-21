import { Book } from '../entities/index';

export interface BookRepository {
    // Lectura
	findById(id: string): Promise<Book | null>;
	findByISBN(isbn: string): Promise<Book | null>;
	search(query: string): Promise<Book[]>;
    
	// Escritura
	save(book: Book): Promise<void>; // Para crear o actualizar
	updateAvailableCopies(id: string, availableCopies: number): Promise<void>;
}