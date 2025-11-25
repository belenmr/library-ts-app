import React, { useCallback, useEffect, useState } from 'react';
import { loanModule } from '../utils/loanModule';
import { useNavigate } from 'react-router-dom';

interface EnrichedLoan {
	id: string;
	bookId: string;
	userId: string;
	loanDate: Date;
	dueDate: Date;
	returnDate: Date | null;
	status: string;
	bookTitle: string;
	bookIsbn: string;
	userEmail: string;
}

export const EndLoanPage: React.FC = () => {
	const navigate = useNavigate();
	const [ongoingLoans, setOngoingLoans] = useState<EnrichedLoan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Función para cargar los préstamos activos/vencidos
	const fetchOngoingLoans = useCallback(async () => {
		setIsLoading(true);
		setMessage(null);
		try {
			const result = await loanModule.findOngoingLoans();

			if (result instanceof Error) {
				setMessage({ text: `❌ Error de carga: ${result.message}`, type: 'error' });
				setOngoingLoans([]);
			} else {
				setOngoingLoans(result);
			}
		} catch (error) {
			setMessage({ text: '❌ Error de red al cargar préstamos pendientes.', type: 'error' });
		} finally {
			setIsLoading(false);
		}
	}, []);


	// Función para manejar la acción de devolución
	const handleEndLoan = useCallback(async (loanId: string) => {
		setIsProcessing(true);
		setMessage(null);
		try {
			await loanModule.endLoan(loanId);

			setMessage({ text: `✅ Libro devuelto con éxito. Préstamo ID: ${loanId.substring(0, 8)}...`, type: 'success' });

			// Recarga la tabla para que el préstamo devuelto desaparezca
			setTimeout(() => {
				fetchOngoingLoans();
			}, 1000);

		} catch (error) {
			const errorMessage = (error as Error).message;
			setMessage({ text: `❌ Fallo al devolver: ${errorMessage}`, type: 'error' });
		} finally {
			setIsProcessing(false);
		}
	}, [fetchOngoingLoans]);

	// Carga inicial de datos
	useEffect(() => {
		fetchOngoingLoans();
	}, [fetchOngoingLoans]);

	if (isLoading) {
		return <div className="text-center p-10 text-xl">Cargando préstamos pendientes...</div>;
	}

	const messageClasses = message
		? message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
		: '';

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">✅ Devolución de Libros Pendientes</h2>

			{message && (
				<div className={`border px-4 py-3 rounded mb-4 ${messageClasses}`}>
					<p>{message.text}</p>
				</div>
			)}

			{ongoingLoans.length === 0 ? (
				<div className="bg-blue-100 p-4 rounded-md text-blue-800 border border-blue-300">
					No hay libros pendientes de devolución
				</div>
			) : (
				<div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título (ISBN)</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Usuario</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Préstamo</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución Estimada</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{ongoingLoans.map(loan => (
								<tr key={loan.id} className={loan.status === 'OVERDUE' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}>
									<td className="px-6 py-4 text-sm font-medium text-gray-900">{loan.bookTitle} ({loan.bookIsbn})</td>
									<td className="px-6 py-4 text-sm text-gray-600">{loan.userEmail}</td>
									<td className="px-6 py-4 text-sm text-gray-500">{new Date(loan.loanDate).toLocaleDateString()}</td>
									<td className="px-6 py-4 text-sm font-semibold" style={{ color: loan.status === 'OVERDUE' ? 'darkred' : 'inherit' }}>{new Date(loan.dueDate).toLocaleDateString()}</td>
									<td className="px-6 py-4">
										<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
												loan.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
													'bg-yellow-100 text-yellow-800'}`}>
											{loan.status}
										</span>
									</td>
									<td className="px-6 py-4">
										<button
											onClick={() => handleEndLoan(loan.id)}
											disabled={isProcessing}
											className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-xs disabled:bg-gray-400 transition-colors"
										>
											{isProcessing ? 'Procesando...' : 'Finalizar Préstamo'}
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