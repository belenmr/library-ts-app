import type { Loan, LoanStatus } from '@domain/entities';
import type { LoanRepository } from '@domain/repositories/loan.repository';
import { httpClient } from './httpClient';

export class LoanApiRepository implements LoanRepository {

    async save(loan: Loan): Promise<void> {
        try {
            await httpClient.post('/loans', {
                userId: loan.userId,
                bookId: loan.bookId,
            });
        } catch (error) {
            const backendError = (error as any).response?.data?.message;
            throw new Error(backendError || 'Error desconocido al crear el préstamo.');
        }
    }

    async findLoansByUserId(userId: string): Promise<Loan[]> {
        const response = await httpClient.get(`/loans?userId=${userId}`);
        return response.data;
    }

    async findActiveLoansByUserId(userId: string): Promise<Loan[]> {
        const response = await httpClient.get(`/loans/active?userId=${userId}`);
        return response.data;
    }

    async findById(id: string): Promise<Loan | null> {
        const response = await httpClient.get(`/loans/${id}`);
        return response.data ?? null;
    }

    async findAll(): Promise<Loan[]> {
        const response = await httpClient.get('/loans');
        return response.data;
    }

    async updateStatus(id: string, status: LoanStatus): Promise<void> {
        await httpClient.patch(`/loans/${id}/status`, { status });
    }

    async findActiveAll(): Promise<Loan[]> {
        const response = await httpClient.get('/loans/active');
        return response.data;
    }

    async findOverdueAll(): Promise<Loan[]> {
        const response = await httpClient.get('/loans/overdue');
        return response.data;
    }

    async findOverdueLoansByUserId(userId: string): Promise<Loan[]> {
        const response = await httpClient.get(`/loans/overdue?userId=${userId}`);
        return response.data;
    }
}