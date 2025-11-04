import { BookRepository } from '@domain/repositories/book.repository';
import { Book } from '@domain/entities/book';
import { PrismaClient } from '@prisma/client';

// --- Mapeador (Prisma a Dominio) ---
/**
 * Convierte el objeto Book devuelto por Prisma a la entidad de Dominio Book.
 */
const toDomainBook = (prismaBook: any): Book => ({
    id: prismaBook.id,
    title: prismaBook.title,
    author: prismaBook.author,
    isbn: prismaBook.isbn,
    totalCopies: prismaBook.totalCopies,
    availableCopies: prismaBook.availableCopies,
});



export class BookPrismaRepository implements BookRepository {    
    
    constructor(private readonly prisma: PrismaClient) {} // Inyección de dependencia del cliente de Prisma

    
    async findById(id: string): Promise<Book | null> {
        const book = await this.prisma.book.findUnique({ where: { id } });
        return book ? toDomainBook(book) : null;
    }
    

    async findByISBN(isbn: string): Promise<Book | null> {
        const book = await this.prisma.book.findUnique({ where: { isbn } });
        return book ? toDomainBook(book) : null;
    }
    

    async findAll(): Promise<Book[]> {
        const books = await this.prisma.book.findMany();
        return books.map(toDomainBook);
    }


	/**
     * Busca libros por título o autor.
     */
	async search(query: string): Promise<Book[]> {
        const books = await this.prisma.book.findMany({
            where: {
                OR: [ // Buscar en Título O en Autor
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        author: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        });
        
        return books.map(toDomainBook);
    }


    async save(book: Book): Promise<void> {
        // Upsert: si el ID existe, actualiza; si no, crea.
        await this.prisma.book.upsert({
            where: { id: book.id },
            update: { 
                title: book.title, 
                author: book.author,
                isbn: book.isbn,
                totalCopies: book.totalCopies, 
                availableCopies: book.availableCopies, 
            },
            create: book,
        });
    }


    async updateAvailableCopies(bookId: string, updatedAvailableCopies: number): Promise<void> {

        await this.prisma.book.update({
            where: { id: bookId },
            data: {
                availableCopies: updatedAvailableCopies, 
            },
        });
    }
}