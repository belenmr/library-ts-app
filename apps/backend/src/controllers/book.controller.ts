import { Request, Response } from 'express';
import type { Book } from '@domain/entities/book';

// --- Definición de Tipos de Casos de Uso ---
type AddBookUseCase = (payload: any) => Promise<Book | Error>;
type GetBookUseCase = (payload: { bookId: string }) => Promise<Book | Error>;
type GetBooksUseCase = () => Promise<Book[] | Error>;

export interface BookControllerDeps {
    addBookUseCase: AddBookUseCase;
    getBookUseCase: GetBookUseCase;
    getBooksUseCase: GetBooksUseCase;
}

export class BookController {
    constructor(private readonly deps: BookControllerDeps) {}

    public addBook = async (req: Request, res: Response) => {
        // NOTA: Requiere middleware de autorización (ADMIN o LIBRARIAN)
        const { title, author, isbn, copies } = req.body;
        
        // El CU de Dominio maneja la lógica de si es una nueva entrada o una adición de copias
        const payload = { title, author, isbn, copies: parseInt(copies) };

        try {
            const result = await this.deps.addBookUseCase(payload);

            if (result instanceof Error) {                
                return res.status(400).json({ error: result.message });
            }

            return res.status(201).json({ 
                id: result.id, 
                title: result.title,
                message: `Book added/updated successfully. Total copies: ${result.totalCopies}` 
            });
        } catch (error) {
            console.error('Error adding book:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    

    public getBook = async (req: Request, res: Response) => {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: "Book ID parameter is missing." });
        }

        try {
            const result = await this.deps.getBookUseCase({ bookId: id });
            
            
            if (result instanceof Error) {
                return res.status(404).json({ error: result.message });
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    

    public getBooks = async (req: Request, res: Response) => {
        try {
            const result = await this.deps.getBooksUseCase();
            
            if (result instanceof Error) {
                 return res.status(500).json({ error: result.message });
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
}