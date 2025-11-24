import React, { useEffect, useState } from 'react';
import { loanModule } from '../utils/loanModule';

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

export const ViewLoansPage: React.FC = () => {
	const [loans, setLoans] = useState<EnrichedLoan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLoans = async () => {
			try {
				const fetchedLoans = await loanModule.findLoans();
				if (fetchedLoans instanceof Error) {
					setError(fetchedLoans.message);
				} else {
					setLoans(fetchedLoans);
				}
			} catch (err) {
				console.error("Error fetching loans:", err);
				setError("Fallo al cargar la lista de préstamos desde la API.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLoans();
	}, []);

	if (isLoading) {
		return <div className="text-center p-10 text-xl">Cargando historial de préstamos...</div>;
	}

	if (error) {
		return <div className="text-center p-10 text-red-500 text-xl">{error}</div>;
	}

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">📜 Historial de Préstamos ({loans.length})</h1>

			{loans.length === 0 ? (
				<div className="bg-yellow-100 p-4 rounded-md text-yellow-800 border border-yellow-300">
					No hay préstamos registrados en el sistema.
				</div>
			) : (
				<div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Usuario</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Préstamo</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución Estimada</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{loans.map(loan => (
								<tr key={loan.id} className={loan.status === 'OVERDUE' ? 'bg-red-50' : ''}>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.bookTitle}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.bookIsbn}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.userEmail}</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(loan.loanDate).toLocaleDateString()}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(loan.dueDate).toLocaleDateString()}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
												loan.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' :
													'bg-red-100 text-red-800'}`}>
											{loan.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : ''}
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