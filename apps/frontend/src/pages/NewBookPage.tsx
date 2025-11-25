import React, { useState } from 'react';
import { bookModule } from '../utils/bookModule';
import { useNavigate } from 'react-router-dom';

interface BookFormData {
	title: string;
	author: string;
	isbn: string;
	totalCopies: number;
}

export const NewBookPage: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<BookFormData>({
		title: '',
		author: '',
		isbn: '',
		totalCopies: 1
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: name === 'copies' ? parseInt(value, 10) : value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);
		setIsLoading(true);

		try {
			await bookModule.addBook(formData);

			setMessage({ text: '✅ Libro creado con éxito.', type: 'success' });
			setFormData({ title: '', author: '', isbn: '', totalCopies: 1 });


			setTimeout(() => navigate('/books'), 2000);

		} catch (error) {
			const errorMessage = (error as Error).message;
			setMessage({ text: `❌ Fallo al agregar libro: ${errorMessage}`, type: 'error' });
		} finally {
			setIsLoading(false);
		}
	};

	const messageClasses = message
		? message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
		: '';

	return (
		<div className="p-8 max-w-lg mx-auto bg-white shadow-xl rounded-lg">
			<h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">📘 Crear Libro</h2>

			{message && (
				<div className={`border px-4 py-3 rounded mb-4 ${messageClasses}`}>
					<p>{message.text}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">

				{/* Título */}
				<div>
					<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
					<input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
				</div>

				{/* Autor */}
				<div>
					<label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
					<input type="text" name="author" id="author" value={formData.author} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
				</div>

				{/* ISBN */}
				<div>
					<label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
					<input type="text" name="isbn" id="isbn" value={formData.isbn} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={isLoading} placeholder="Identificador único del libro" />
				</div>

				{/* Copias */}
				<div>
					<label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Copias a Añadir</label>
					<input type="number" name="copies" id="copies" value={formData.totalCopies} onChange={handleChange} required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full px-4 py-3 text-white bg-indigo-600 font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
				>
					{isLoading ? 'Guardando...' : 'Guardar Libro / Añadir Copias'}
				</button>
			</form>
		</div>
	);
};