import { User, Loan, RoleName } from '../entities/index';

export interface LoanPolicyService {
    canUserBorrow(user: User, activeLoans: Loan[]): boolean;
    isLoanOverdue(loan: Loan): boolean;
}