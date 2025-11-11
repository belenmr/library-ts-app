import { User, Loan, RoleName } from '../entities/index';

export interface LoanPolicyService {
    canUserBorrow(user: User, activeLoans: Loan[]): Promise<boolean>;
    isLoanOverdue(loan: Loan): boolean;
}