export interface Book {
	id: string;
	title: string;
	author: string;
	isbn: string;
	totalCopies: number;
	availableCopies: number; // Copias disponibles para préstamo
}