import React from 'react';
import { useNavigate } from 'react-router-dom';

const Button = ({ children, to }: { children: React.ReactNode, to: string }) => {
	const navigate = useNavigate();

	return (
		<button
			onClick={() => navigate(to)}
			className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-[1.02]"
		>
			{children}
		</button>
	);
};

export const AdminPage: React.FC = () => {

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b pb-2">
				⚙️ Gestión de Biblioteca (Menú Principal)
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

				{/* --- Módulo de Creación y Edición --- */}
				<div className="md:col-span-3 lg:col-span-1 p-6 bg-white shadow-xl rounded-lg border-t-4 border-t-indigo-500 space-y-4">
					<h2 className="text-xl font-bold text-indigo-700 mb-3">Crear Nuevo</h2>
					<Button to="/admin/new-user">👤 Nuevo Usuario</Button>
					<Button to="/admin/new-book">📘 Nuevo Libro</Button>
				</div>

				{/* --- Módulo de Préstamos --- */}
				<div className="md:col-span-3 lg:col-span-1 p-6 bg-white shadow-xl rounded-lg border-t-4 border-t-green-500 space-y-4">
					<h2 className="text-xl font-bold text-green-700 mb-3">Gestión de Préstamos</h2>
					<Button to="/admin/new-loan">➕ Nuevo Préstamo</Button>
					<Button to="/admin/end-loan">✅ Finalizar Préstamo</Button>
				</div>

				{/* --- Módulo de Visualización --- */}
				<div className="md:col-span-3 lg:col-span-1 p-6 bg-white shadow-xl rounded-lg border-t-4 border-t-gray-500 space-y-4">
					<h2 className="text-xl font-bold text-gray-700 mb-3">Reportes y Consultas</h2>
					<Button to="/admin/view-users">👥 Ver Usuarios</Button>
					<Button to="/admin/view-loans">📜 Ver Préstamos</Button>
				</div>

			</div>
		</div>
	);
};