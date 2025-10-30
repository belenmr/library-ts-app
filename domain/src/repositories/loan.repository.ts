import { Loan, LoanStatus } from '../entities/index';

export interface LoanRepository {
    //Lectura
    findById(id: string): Promise<Loan | null>;
    findLoansByUserId(userId: string): Promise<Loan[]>;
    findActiveLoansByUserId(userId: string): Promise<Loan[]>;
    findOverdueLoansByUserId(userId: string): Promise<Loan[]>;
    findAll(): Promise<Loan[]>;
    findActiveAll(): Promise<Loan[]>;
    findOverdueAll(): Promise<Loan[]>;

    //Escritura
    save(loan: Loan): Promise<void>;
    updateStatus(id: string, status: LoanStatus): Promise<void>;
}