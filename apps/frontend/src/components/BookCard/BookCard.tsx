import React from 'react';
import type { Book } from '@domain/entities';

interface BookCardProps {
	book: Book;
	onLoanClick?: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
	const isAvailable = book.availableCopies > 0;
	const availabilityText = isAvailable
		? `Disponibles: ${book.availableCopies} de ${book.totalCopies}`
		: 'No disponible';

	const borderColor = isAvailable ? 'border-green-500' : 'border-red-500';
	const textColor = isAvailable ? 'text-green-700' : 'text-red-700';

	return (
		<div className={`
        p-4 border-2 rounded-lg shadow-lg transition-shadow hover:shadow-xl 
        ${borderColor} bg-white flex flex-col justify-between h-full
    `}>
			<div>
				<h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
				<p className="text-sm text-gray-600 mb-2">
					Autor: {book.author}
				</p>
				<p className="text-xs text-gray-500 mb-4">
					ISBN: {book.isbn}
				</p>
			</div>

			<div>
				<p className={`font-semibold text-sm ${textColor} mb-3`}>
					{availabilityText}
				</p>
			</div>
		</div>
	);
};