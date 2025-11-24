import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout/AppLayout';
import { BookListPage } from './pages/BookListPage';
import { AdminPage } from './pages/AdminPage';
import { NewLoanPage } from './pages/NewLoanPage';
import { ViewUsersPage } from './pages/ViewUsersPage';
import { ViewLoansPage } from './pages/ViewLoansPage';
import { NewBookPage } from './pages/NewBookPage';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<AppLayout />}>
					<Route index element={<AdminPage />} />
					<Route path="/books" element={<BookListPage />} />

					{/* <Route path="/login" element={<LoginPage />} /> */}

					{/* <Route path="/admin" element={<AdminPage />} /> */}

					<Route path="admin/new-user" element={<div>[Formulario Nuevo Usuario]</div>} />
					<Route path="admin/new-book" element={<NewBookPage />} />
					<Route path="admin/new-loan" element={<NewLoanPage />} />
					<Route path="admin/end-loan" element={<div>[Formulario Finalizar Préstamo]</div>} />
					<Route path="admin/view-users" element={<ViewUsersPage />} />
					<Route path="admin/view-loans" element={<ViewLoansPage />} />


					{/* Ruta de fallback 404 */}
					<Route path="*" element={<div className="text-center mt-20 text-xl">404 | Página no encontrada</div>} />

				</Route>


			</Routes>
		</BrowserRouter>
	);
}

export default App
