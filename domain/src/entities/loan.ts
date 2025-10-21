export const LoanStatus = {
	ACTIVE: 'ACTIVE',
	RETURNED: 'RETURNED',
	OVERDUE: 'OVERDUE',
} as const;

export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];

export interface Loan {
	id: string;
	bookId: string;
	userId: string;
	loanDate: Date;
	dueDate: Date;
	returnDate: Date | null;
	status: LoanStatus;
}