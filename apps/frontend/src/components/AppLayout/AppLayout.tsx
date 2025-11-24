import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen">
			{/* --- Navbar --- */}
			<header className="bg-gray-800 text-white p-4 shadow-md">
				<nav className="max-w-7xl mx-auto flex justify-between items-center">
					<Link to="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
						📚 Biblioteca 📚
					</Link>
					<div className="space-x-4 text-sm font-medium">
						<Link to="/books" className="hover:text-gray-400">Catálogo</Link>
						{/* Enlaces de Autenticación */}
						<Link to="/login" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors">Iniciar Sesión</Link>
						{/* El enlace de Logout/Profile iría aquí si el usuario está logueado */}
					</div>
				</nav>
			</header>

			{/* --- Contenido de la Ruta --- */}
			<main className="flex-grow max-w-7xl mx-auto w-full p-4">
				<Outlet />
			</main>

			{/* --- Footer --- */}
			<footer className="bg-gray-200 text-gray-600 p-3 text-center text-sm mt-auto">
				© 2025 Proyecto de Belen Medina
			</footer>
		</div>
	);
};