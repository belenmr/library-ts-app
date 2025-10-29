import { Loan } from '../entities/index';

export interface LoanRepository {
    //Lectura
    findById(id: string): Promise<Loan | null>;
    findActiveLoansByUserId(userId: string): Promise<Loan[]>;
    findAll(): Promise<Loan[]>;

    //Escritura
    save(loan: Loan): Promise<void>;
    updateStatus(id: string, status: 'RETURNED' | 'OVERDUE'): Promise<void>;
}