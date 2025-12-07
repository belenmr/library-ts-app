import React, { useEffect, useState, useCallback } from 'react';
import { bookModule } from '../utils/bookModule.ts';
import type { Book } from '@domain/entities';
import { useNavigate } from 'react-router-dom';

export const ViewBooksPage: React.FC = () => {
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const fetchBooks = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await bookModule.getBooks();

			if (result instanceof Error) {
				setError(result.message);
				setBooks([]);
			} else {
				setBooks(result);
			}
		} catch (err) {
			setError('Error de red o desconocido al cargar los libros.');
			setBooks([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	const handleUpdate = (bookId: string) => {
		navigate(`/admin/update-book/${bookId}`);
	};

	if (isLoading) {
		return <div className="text-center p-10 text-xl">Cargando libros...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded">Error: {error}</div>;
	}

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">📖 Catálogo de Libros</h2>

			{books.length === 0 ? (
				<div className="bg-blue-100 p-4 rounded-md text-blue-800 border border-blue-300">
					No hay libros registrados en el catálogo.
				</div>
			) : (
				<div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copias Totales</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibles</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{books.map(book => (
								<tr key={book.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 text-sm font-medium text-gray-900">{book.title}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
									<td className="px-6 py-4 text-sm text-gray-500">{book.isbn}</td>
									<td className="px-6 py-4 text-sm text-gray-500">{book.totalCopies}</td>
									<td className="px-6 py-4 text-sm font-semibold text-green-700">{book.availableCopies}</td>
									<td className="px-6 py-4">

										<button
											onClick={() => handleUpdate(book.id)}
											className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1 px-3 rounded text-xs transition-colors"
										>
											Actualizar
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};