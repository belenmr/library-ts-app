import { User, Loan } from '../entities/index';

export interface LoanPolicyService {
    canUserBorrow(user: User, activeLoans: Loan[]): boolean;
    isLoanOverdue(loan: Loan): boolean;
}