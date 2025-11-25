// apps/frontend/src/pages/RegisterPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authModule } from '../utils/authModule';
import type { RegisterUserPayload } from '@domain/use-cases/register-user';
import { RoleName } from '@domain/entities/role';

type RegisterFormData = RegisterUserPayload;

// Roles disponibles para la lista desplegable
const ROLE_OPTIONS = [
	{ name: RoleName.MEMBER, label: 'Miembro' },
	{ name: RoleName.LIBRARIAN, label: 'Bibliotecario' },
	{ name: RoleName.ADMIN, label: 'Administrador' },
];

export const RegisterPage: React.FC = () => {
	const [formData, setFormData] = useState<RegisterFormData>({
		name: '',
		surname: '',
		email: '',
		password: '',
		executorRole: RoleName.ADMIN,
		roleToCreate: RoleName.MEMBER, // Valor inicial para el select
	});

	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
	const navigate = useNavigate();


	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);
		setIsLoading(true);

		try {
			await authModule.register(formData);

			setMessage({ text: `✅ Usuario ${formData.name} creado como ${formData.roleToCreate}.`, type: 'success' });

			// Limpia formulario
			setFormData(prev => ({
				...prev,
				name: '', surname: '', email: '', password: '',
				roleToCreate: RoleName.MEMBER
			}));

			setTimeout(() => {
				navigate('/admin');
			}, 2000);

		} catch (err) {
			const errorMessage = (err as Error).message;
			setMessage({ text: `❌ Fallo en el Registro: ${errorMessage}`, type: 'error' });
		} finally {
			setIsLoading(false);
		}
	};


	const messageClasses = message
		? message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
		: '';

	return (
		<div className="p-8 max-w-lg mx-auto bg-white shadow-xl rounded-lg">
			<h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">👤 Crear Nuevo Usuario</h2>

			{message && (
				<div className={`border px-4 py-3 rounded mb-4 ${messageClasses}`}>
					<p>{message.text}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Inputs: Name, Surname, Email, Password */}
				<input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />
				<input type="text" name="surname" placeholder="Apellido" value={formData.surname} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />
				<input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />
				<input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" disabled={isLoading} />

				{/* Select de roles*/}
				<div>
					<label htmlFor="roleToCreate" className="block text-sm font-medium text-gray-700 mb-1">Rol a Asignar</label>
					<select
						name="roleToCreate"
						id="roleToCreate"
						value={formData.roleToCreate}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
						disabled={isLoading}
					>
						{ROLE_OPTIONS.map(role => (
							<option key={role.name} value={role.name}>
								{role.label} ({role.name})
							</option>
						))}
					</select>
				</div>

				{/* Chequeo de ejecutor */}
				<p className="text-xs text-gray-500 pt-2">
					Ejecutor: **{formData.executorRole}**.
				</p>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full px-4 py-3 text-white bg-indigo-600 font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
				>
					{isLoading ? 'Registrando...' : 'Registrar Usuario'}
				</button>
			</form>
		</div>
	);
};