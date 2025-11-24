import React, { useEffect, useState } from 'react';
import type { User } from '@domain/entities';
import { userModule } from '../utils/userModule';

export const ViewUsersPage: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const fetchedUsers = await userModule.findUsers();
				setUsers(fetchedUsers);
			} catch (err) {
				console.error("Error fetching users:", err);
				setError("Fallo al cargar la lista de usuarios desde la API.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (isLoading) {
		return <div className="text-center p-10 text-xl">Cargando lista de usuarios...</div>;
	}

	if (error) {
		return <div className="text-center p-10 text-red-500 text-xl">{error}</div>;
	}

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">👥 Lista de Usuarios ({users.length})</h1>

			{users.length === 0 ? (
				<div className="bg-yellow-100 p-4 rounded-md text-yellow-800 border border-yellow-300">
					No se encontraron usuarios registrados en el sistema.
				</div>
			) : (
				<div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{users.map(user => (
								<tr key={user.id}>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name} {user.surname}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role.name === 'ADMIN' ? 'bg-red-100 text-red-800' :
											user.role.name === 'LIBRARIAN' ? 'bg-indigo-100 text-indigo-800' :
												'bg-green-100 text-green-800'
											}`}>
											{user.role.name}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{user.id}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};