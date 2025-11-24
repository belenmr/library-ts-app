import { UserApiRepository } from '../api/UserApiRepository';
import { LoanApiRepository } from '../api/LoanApiRepository';
import { RoleName } from '@domain/entities';

const userRepositoryInstance = new UserApiRepository();
const loanRepositoryInstance = new LoanApiRepository();

export const userModule = {
    findUserById: (userId: string) => userRepositoryInstance.findById(userId),
    findLoanHistory: (userId: string) => loanRepositoryInstance.findLoansByUserId(userId),
    findMembers: () => userRepositoryInstance.findByRole(RoleName.MEMBER),
};