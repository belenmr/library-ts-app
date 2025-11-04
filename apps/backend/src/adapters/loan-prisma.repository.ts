import { LoanRepository } from "@domain/repositories/loan.repository";
import { Loan } from "@domain/entities/loan";
import { LoanStatus } from "@domain/entities/loan";
import { PrismaClient } from "@prisma/client";

// --- Mapeador (Prisma a Dominio) ---
const toDomainLoan = (prismaLoan: any): Loan => ({
    id: prismaLoan.id,
    bookId: prismaLoan.bookId,
    userId: prismaLoan.userId,
    loanDate: prismaLoan.loanDate,
    dueDate: prismaLoan.dueDate,
    returnDate: prismaLoan.returnDate,
    status: prismaLoan.status as LoanStatus,
});

export class LoanPrismaRepository implements LoanRepository {
        
    constructor(private readonly prisma: PrismaClient) {}


    async findById(id: string): Promise<Loan | null> {
        const loan = await this.prisma.loan.findUnique({ where: { id } });
        return loan ? toDomainLoan(loan) : null;
    }

    async findAll(): Promise<Loan[]> {
        const loans = await this.prisma.loan.findMany();
        return loans.map(toDomainLoan);
    }
    
    async findActiveAll(): Promise<Loan[]> {
        const loans = await this.prisma.loan.findMany({
            where: {
                status: LoanStatus.ACTIVE
            }
        });
        return loans.map(toDomainLoan);
    }

	async findOverdueAll(): Promise<Loan[]> {
        const loans = await this.prisma.loan.findMany({
            where: {
                status: LoanStatus.OVERDUE
            }
        });
        return loans.map(toDomainLoan);
    }

    async findLoansByUserId(userId: string): Promise<Loan[]> {
        const loans = await this.prisma.loan.findMany({
            where: { userId: userId }
        });
        return loans.map(toDomainLoan);
    }

    async findActiveLoansByUserId(userId: string): Promise<Loan[]> {
            const loans = await this.prisma.loan.findMany({
            where: {
                userId: userId,
                status: LoanStatus.ACTIVE
            }
        });
        return loans.map(toDomainLoan);
    }
    
    async findOverdueLoansByUserId(userId: string): Promise<Loan[]> {
        const loans = await this.prisma.loan.findMany({
            where: { 
                userId: userId,
                status: LoanStatus.OVERDUE
            }
        });
        return loans.map(toDomainLoan);
    }


    async save(loan: Loan): Promise<void> {
        await this.prisma.loan.upsert({
            where: { id: loan.id },
            update: {
                // Actualiza campos relevantes si el préstamo ya existe
                returnDate: loan.returnDate,
                status: loan.status,
            },
            create: {
                id: loan.id,
                bookId: loan.bookId,
                userId: loan.userId,
                loanDate: loan.loanDate,
                dueDate: loan.dueDate,
                status: loan.status,
				returnDate: null
            },
        });
    }

    async updateStatus(id: string, status: LoanStatus): Promise<void> {
        await this.prisma.loan.update({
            where: { id },
            data: {
                status: status,
                returnDate: status === LoanStatus.RETURNED ? new Date() : null,
            },
        });
    }
}