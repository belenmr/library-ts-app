import React, { useEffect, useState } from 'react';
import { loanModule } from '../utils/loanModule'
import { useNavigate } from 'react-router-dom';
import type { User, Book } from '@domain/entities';
import { userModule } from '../utils/userModule';
import { bookModule } from '../utils/bookModule';

interface LoanFormData {
	userId: string;
	bookId: string;
}

export const NewLoanPage: React.FC = () => {
	const [formData, setFormData] = useState<LoanFormData>({ userId: '', bookId: '' });

	const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
	const [availableMembers, setAvailableMembers] = useState<User[]>([]);

	const [isLoadingData, setIsLoadingData] = useState(true);
	const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
	const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
	const navigate = useNavigate();

	// useEffect: Cargar Libros y Miembros al inicio
	useEffect(() => {
		const loadFormData = async () => {
			try {
				// Cargar miembros
				const members = await userModule.findMembers();
				setAvailableMembers(members);

				// Cargar libros disponibles
				const books = await bookModule.getBooks();
				// Filtrar solo los que tienen copias disponibles
				const available = books.filter(b => b.availableCopies > 0);
				setAvailableBooks(available);

				// Establecer el primer valor como seleccionado por defecto
				if (members.length > 0) setFormData(prev => ({ ...prev, userId: members[0].id }));
				if (available.length > 0) setFormData(prev => ({ ...prev, bookId: available[0].id }));

			} catch (error) {
				setMessage({ text: '❌ Error al cargar datos de miembros/libros.', type: 'error' });
				console.error(error);
			} finally {
				setIsLoadingData(false);
			}
		};
		loadFormData();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);
		setIsLoadingSubmit(true);

		const { userId, bookId } = formData;

		if (!userId || !bookId) {
			setMessage({ text: 'Los IDs de Usuario y Libro son obligatorios.', type: 'error' });
			setIsLoadingSubmit(false);
			return;
		}

		try {
			await loanModule.createLoan(userId, bookId);

			setMessage({ text: '✅ Préstamo creado con éxito.', type: 'success' });

			setTimeout(() => navigate('/catalogue'), 2000);

		} catch (error) {
			const errorMessage = (error as Error).message;
			setMessage({ text: `❌ Fallo en el Préstamo: ${errorMessage}`, type: 'error' });
		} finally {
			setIsLoadingSubmit(false);
		}
	};

	if (isLoadingData) {
		return <div className="p-8 max-w-lg mx-auto text-center">Cargando listas de miembros y libros...</div>;
	}

	const messageClasses = message
		? message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
		: '';

	return (
		<div className="p-8 max-w-lg mx-auto bg-white shadow-xl rounded-lg">
			<h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Crear Nuevo Préstamo</h2>

			{message && (
				<div className={`border px-4 py-3 rounded mb-4 ${messageClasses}`}>
					<p>{message.text}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">

				{/* 🔑 SELECT: ID de Usuario (Solo Miembros) */}
				<div>
					<label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">Usuario Miembro</label>
					<select
						name="userId"
						id="userId"
						value={formData.userId}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
						disabled={isLoadingSubmit || availableMembers.length === 0}
					>
						{availableMembers.length === 0 && <option value="">No hay miembros disponibles</option>}
						{availableMembers.map(user => (
							<option key={user.id} value={user.id}>
								{user.name} {user.surname} ({user.email})
							</option>
						))}
					</select>
				</div>

				{/* 🔑 SELECT: ID de Libro (Solo Libros con copias) */}
				<div>
					<label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-1">Libro a Prestar</label>
					<select
						name="bookId"
						id="bookId"
						value={formData.bookId}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
						disabled={isLoadingSubmit || availableBooks.length === 0}
					>
						{availableBooks.length === 0 && <option value="">No hay libros disponibles</option>}
						{availableBooks.map(book => (
							<option key={book.id} value={book.id}>
								{book.title} ({book.availableCopies} copias)
							</option>
						))}
					</select>
				</div>

				<button
					type="submit"
					disabled={isLoadingSubmit || availableBooks.length === 0 || availableMembers.length === 0}
					className="w-full px-4 py-3 text-white bg-green-600 font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
				>
					{isLoadingSubmit ? 'Procesando...' : 'Registrar Préstamo'}
				</button>
			</form>
		</div>
	);
};