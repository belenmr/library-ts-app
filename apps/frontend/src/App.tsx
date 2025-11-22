import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout/AppLayout';
import { BookListPage } from './pages/BookListPage';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<AppLayout />}>
					<Route path="/books" element={<BookListPage />} />

					{/* <Route path="/login" element={<LoginPage />} /> */}

					{/* Ruta de fallback 404 */}
					<Route path="*" element={<div className="text-center mt-20 text-xl">404 | Página no encontrada</div>} />

				</Route>


			</Routes>
		</BrowserRouter>
	);
}

export default App
