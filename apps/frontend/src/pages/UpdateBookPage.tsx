import React, { useState, useEffect, useCallback } from 'react';
import { bookModule } from '../utils/bookModule';
import type { Book } from '@domain/entities';
import { useParams, useNavigate } from 'react-router-dom';

interface BookFormData {
	title: string;
	author: string;
	isbn: string;
	totalCopies: number;
}

export const UpdateBookPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	const [bookData, setBookData] = useState<Book | null>(null);
	const [formData, setFormData] = useState<BookFormData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
	const navigate = useNavigate();

	const fetchBookData = useCallback(async (id: string) => {
		setIsLoading(true);
		setMessage(null);
		setBookData(null);
		setFormData(null);

		try {

			const book = await bookModule.getBook(id);

			if (book) {
				setBookData(book);
				// Cargar los datos al formulario para la edición
				setFormData({
					title: book.title,
					author: book.author,
					isbn: book.isbn,
					totalCopies: book.totalCopies,
				});
			} else {
				setMessage({ text: '❌ Libro no encontrado.', type: 'error' });
			}
		} catch (error) {
			setMessage({ text: '❌ Error al cargar los datos del libro.', type: 'error' });
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (id) {
			fetchBookData(id);
		} else {
			setMessage({ text: '❌ ID de libro no proporcionado en la URL.', type: 'error' });
		}
	}, [id, fetchBookData]);


	const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (formData) {
			setFormData({
				...formData,
				[name]: name === 'totalCopies' ? parseInt(value, 10) : value,
			});
		}
	};

	const handleUpdateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!bookData || !formData) return;

		setIsLoading(true);
		setMessage(null);

		try {
			await bookModule.addBook(formData);

			setMessage({ text: `✅ Libro actualizado con éxito.`, type: 'success' });
			fetchBookData(bookData.id);

		} catch (error) {
			const errorMessage = (error as Error).message;
			setMessage({ text: `❌ Fallo al actualizar: ${errorMessage}`, type: 'error' });
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		navigate('/admin/view-books');
	};

	const messageClasses = message
		? message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
		: '';

	return (
		<div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-lg space-y-6">
			<h2 className="text-3xl font-bold text-gray-800 border-b pb-2">✏️ Actualizar Libro</h2>

			{message && <div className={`border px-4 py-3 rounded ${messageClasses}`}><p>{message.text}</p></div>}


			{bookData && formData && (
				<div className="border border-gray-200 p-6 rounded-lg space-y-4">
					<h3 className="text-xl font-semibold text-indigo-700">Editando: {bookData.title}</h3>
					<h4 className="text-lg text-gray-500">ISBN: {bookData.isbn}</h4>

					<form onSubmit={handleUpdateSubmit} className="space-y-4">

						{/* Título */}
						<label className="block text-sm font-medium text-gray-700">Título</label>
						<input type="text" name="title" value={formData.title} onChange={handleUpdateChange} required className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />

						{/* Autor */}
						<label className="block text-sm font-medium text-gray-700">Autor</label>
						<input type="text" name="author" value={formData.author} onChange={handleUpdateChange} required className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />

						{/* Copias */}
						<label className="block text-sm font-medium text-gray-700">Copias Totales</label>
						<input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleUpdateChange} required min="0" className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />
						<p className="text-xs text-red-500">Copias Disponibles: {bookData.availableCopies}</p>


						<div className="flex justify-between space-x-4 pt-4">

							<button
								type="button"
								onClick={handleCancel}
								className="w-full px-4 py-3 text-white bg-blue-600 font-semibold rounded-lg hover:bg-blue-700 transition-colors"
							>
								Cancelar
							</button>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full px-4 py-3 text-white bg-green-600 font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
							>
								{isLoading ? 'Guardando...' : 'Guardar Cambios'}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};