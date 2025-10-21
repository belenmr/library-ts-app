import type { LoanLimitConfig } from '../entities/index';
import type { RoleName } from '../entities/role';

export interface LoanLimitConfigRepository {
	findLoanLimitByRole(roleName: RoleName): Promise<LoanLimitConfig | null>;
	saveLoanLimit(config: LoanLimitConfig): Promise<void>;
}