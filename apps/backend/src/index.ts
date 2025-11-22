import * as dotenv from 'dotenv';
import express from 'express';
import * as cron from 'node-cron';
import { prisma } from './adapters/prisma-client';
import cors from 'cors';

import { UserPrismaRepository } from './adapters/user-prisma.repository';
import { LoanPrismaRepository } from './adapters/loan-prisma.repository';
import { ConfigPrismaRepository } from './adapters/config-prisma.repository';
import { BookPrismaRepository } from './adapters/book-prisma.repository';

import { DefaultRoleService } from '@domain/services/default-role.service';
import { DefaultLoanPolicyService } from '@domain/services/default-loan-policy.service';
import { OverdueCheckerService } from './jobs/overdue-checker.service';
import { BcryptPasswordService } from './adapters/bcrypt-password.service';
import { JwtTokenService } from './adapters/jwt-token.service';

import { createAuthRouter } from './routes/auth.router';
import { createUserRouter } from './routes/user.router';
import { createBookRouter } from './routes/book.router';
import { createConfigRouter } from './routes/config.router';
import { createLoanRouter } from './routes/loan.router';

// --- USE CASES ---
import { login } from '@domain/use-cases/login';
import { registerUser } from '@domain/use-cases/register-user';
import { getUser } from '@domain/use-cases/get-user';
import { getUsers } from '@domain/use-cases/get-users';
import { updateUser } from '@domain/use-cases/update-user';
import { addBook } from '@domain/use-cases/add-book';
import { getBook } from '@domain/use-cases/get-book';
import { getBooks } from '@domain/use-cases/get-books';
import { createLoan } from '@domain/use-cases/create-loan';
import { endLoan } from '@domain/use-cases/end-loan';
import { getLoan } from '@domain/use-cases/get-loan';
import { getLoans } from '@domain/use-cases/get-loans';
import { getActiveLoans } from '@domain/use-cases/get-active-loans';
import { getOverdueLoans } from '@domain/use-cases/get-overdue-loans';
import { hasPendingFine } from '@domain/use-cases/has-pending-fine';
import { updateLoanLimit } from '@domain/use-cases/update-loan-limit';

import { ConfigControllerDeps } from './controllers/config.controller';
import { BookControllerDeps } from './controllers/book.controller';
import { UserControllerDeps } from './controllers/user.controller';
import { AuthControllerDeps } from './controllers/auth.controller';
import { LoanControllerDeps } from './controllers/loan.controller';


const roleService = new DefaultRoleService();

const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();
const configRepository = new ConfigPrismaRepository(prisma);
const userRepository = new UserPrismaRepository(prisma, roleService);
const loanRepository = new LoanPrismaRepository(prisma);
const bookRepository = new BookPrismaRepository(prisma);

const loanPolicyService = new DefaultLoanPolicyService(configRepository);

const overdueCheckerService = new OverdueCheckerService(
    loanRepository,
    loanPolicyService,
    userRepository
);

// Use case: login
const loginUserUseCase = (payload: any) => login({
    userRepository,
    passwordService,
    tokenService
}, payload);

const authControllerDeps: AuthControllerDeps = {
    loginUserUseCase: loginUserUseCase,
};

// Use cases: users
const registerUserUseCase = (payload: any) => registerUser({
    userRepository,
    passwordService,
    roleService
}, payload);

const getUserUseCase = (payload: any) => getUser({
    userRepository
}, payload);

const getUsersUseCase = () => getUsers({
    userRepository
});

const updateUserUseCase = (payload: any) => updateUser({
    userRepository
}, payload);

const userControllerDeps: UserControllerDeps = {
    registerUserUseCase: registerUserUseCase,
    getUserUseCase: getUserUseCase,
    getUsersUseCase: getUsersUseCase,
    updateUserUseCase: updateUserUseCase,
};

// use cases: book
const addBookUseCase = (payload: any) => addBook({ bookRepository }, payload);
const getBookUseCase = (payload: any) => getBook({ bookRepository }, payload);
const getBooksUseCase = () => getBooks({ bookRepository });

const bookControllerDeps: BookControllerDeps = {
    addBookUseCase: addBookUseCase,
    getBookUseCase: getBookUseCase,
    getBooksUseCase: getBooksUseCase,
};

// use cases: loan
const createLoanUseCase = (payload: any) => createLoan({ userRepository, bookRepository, loanRepository, loanPolicyService }, payload);
const endLoanUseCase = (payload: any) => endLoan({ loanRepository, bookRepository }, payload);
const getLoanUseCase = (payload: any) => getLoan({ loanRepository }, payload);
const getLoansUseCase = (payload: any) => getLoans({ loanRepository }, payload);
const getActiveLoansUseCase = (payload: any) => getActiveLoans({ loanRepository }, payload);
const getOverdueLoansUseCase = (payload: any) => getOverdueLoans({ loanRepository }, payload);
const hasPendingFineUseCase = (payload: any) => hasPendingFine({ loanRepository }, payload);

const loanControllerDeps: LoanControllerDeps = {
    createLoanUseCase,
    endLoanUseCase,
    getLoanUseCase,
    getLoansUseCase,
    getActiveLoansUseCase,
    getOverdueLoansUseCase,
    hasPendingFineUseCase,
};

// use cases: update loan limit
const updateLoanLimitUseCase = (payload: any) => updateLoanLimit({ loanLimitConfigRepository: configRepository }, payload);
const configControllerDeps: ConfigControllerDeps = {
    updateLoanLimitUseCase: updateLoanLimitUseCase,
};

// ----------------------------------------------------
// ROUTERS
// ----------------------------------------------------
const authRouter = createAuthRouter(authControllerDeps);
const userRouter = createUserRouter(userControllerDeps);
const bookRouter = createBookRouter(bookControllerDeps);
const loanRouter = createLoanRouter(loanControllerDeps);
const configRouter = createConfigRouter(configControllerDeps);

// ----------------------------------------------------
// CONFIGURACIÓN DEL SERVIDOR EXPRESS
// ----------------------------------------------------

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// CONFIGURACIÓN DE CORS
app.use(cors({
    origin: 'http://localhost:5173', // La URL de tu frontend (Vite)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos HTTP que el frontend puede usar
    credentials: true
}));

app.use(express.json());

/*
app.get('/', (req, res) => {
    res.send('Library Backend Running!');
});
*/

// Routes
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/books', bookRouter);
app.use('/loans', loanRouter);
app.use('/config', configRouter);

// ----------------------------------------------------
// INICIO DEL SERVIDOR Y CRON JOB
// ----------------------------------------------------

app.listen(PORT, async () => {

    try {
        await prisma.$connect();
        console.log('Database connection successful.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }

    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('CRON: Ejecutando chequeo diario de vencimiento y multas...');

            await overdueCheckerService.checkAndMarkOverdue();

        } catch (error) {
            console.error('CRON ERROR: Fallo al actualizar préstamos vencidos.', error);
        }
    }, {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires" // O la zona horaria de tu servidor
    } as any
    );

    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Tarea de chequeo de vencimiento programada para las 2:00 AM.');
});