import React, { useEffect, useState, useCallback } from 'react';
import type { Book } from '@domain/entities';
import { bookModule } from '../utils/bookModule';
import { BookCard } from '../components/BookCard/BookCard';

export const BookListPage: React.FC = () => {
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// --- Función para cargar los datos del catálogo ---
	const fetchBooks = useCallback(async () => {
		setIsLoading(true);
		setError(null); // Limpia errores anteriores
		try {
			const result = await bookModule.getBooks();

			if (result instanceof Error) {
				// Manejo de error de Backend
				setError(result.message);
			} else {
				setBooks(result);
			}
		} catch (err) {
			// Manejo de errores de red (Axios)
			setError('Ocurrió un error de red o el servidor no responde.');
			console.error('Error de red/API:', err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// --- Hook para ejecutar la carga de datos al montar el componente ---
	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	// --- Lógica de Renderizado de Presentación --- 
	if (isLoading) {
		return (
			<div className="p-8 text-center text-xl text-gray-600">
				Cargando catálogo de libros...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg mx-auto max-w-lg">
				<h3 className="font-bold mb-2">Error al cargar el catálogo</h3>
				<p>{error}</p>
			</div>
		);
	}

	if (books.length === 0) {
		return (
			<div className="p-8 text-center text-gray-500">
				<h3 className="font-bold">El catálogo está vacío.</h3>
				<p>No hay libros registrados en el sistema.</p>
			</div>
		);
	}

	// --- Renderizado principal: Muestra la lista de BookCard ---
	return (
		<div className="p-6 md:p-8 bg-gray-50 min-h-screen">
			<h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
				📚 Catálogo de Libros ({books.length})
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{books.map(book => (
					<BookCard
						key={book.id}
						book={book}
					/>
				))}
			</div>
		</div>
	);
};