import type { RoleName } from './role';

export interface LoanLimitConfig {
	roleName: RoleName;
	maxLoans: number;
}