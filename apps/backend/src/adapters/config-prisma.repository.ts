import { LoanLimitConfigRepository } from "@domain/repositories/loan-limit-config.repository";
import type { LoanLimitConfig } from "@domain/entities/loanLimitConfig";
import { RoleName } from "@domain/entities/role";
import { PrismaClient } from "@prisma/client";


const ROLE_KEY_MAP: Record<RoleName, string> = {
	[RoleName.MEMBER]: "LOAN_LIMIT_MEMBER",
	[RoleName.LIBRARIAN]: "LOAN_LIMIT_LIBRARIAN",
	[RoleName.ADMIN]: "LOAN_LIMIT_ADMIN",
};

export class ConfigPrismaRepository implements LoanLimitConfigRepository {
	constructor(private readonly prisma: PrismaClient) {}

	private getDbKey(roleName: RoleName): string {
		const key = ROLE_KEY_MAP[roleName];
		if (!key) throw new Error(`Role ${roleName} is not a configurable role.`);
		return key;
	}

	async findLoanLimitByRole(roleName: RoleName): Promise<LoanLimitConfig | null> {
		const dbKey = this.getDbKey(roleName);

		const configRecord = await this.prisma.configuration.findUnique({
			where: { key: dbKey },
		});

		if (!configRecord) return null;

		return {
			roleName: roleName,
			maxLoans: parseInt(configRecord.value), 
		};
	}

	async saveLoanLimit(config: LoanLimitConfig): Promise<void> {
		const dbKey = this.getDbKey(config.roleName);

		await this.prisma.configuration.upsert({
			where: { key: dbKey },
			update: { value: config.maxLoans.toString() },
			create: { key: dbKey, value: config.maxLoans.toString() },
		});
	}
}