import * as dotenv from 'dotenv';
import express from 'express';
import * as cron from 'node-cron';
import { prisma } from './adapters/prisma-client';

import { UserPrismaRepository } from './adapters/user-prisma.repository';
import { LoanPrismaRepository } from './adapters/loan-prisma.repository';
import { ConfigPrismaRepository } from './adapters/config-prisma.repository';

import { DefaultRoleService } from '@domain/services/default-role.service';
import { DefaultLoanPolicyService } from '@domain/services/default-loan-policy.service';

import { OverdueCheckerService } from './jobs/overdue-checker.service';
import { createAuthRouter } from './routes/auth.router';
import { createUserRouter } from './routes/user.router';
import { BcryptPasswordService } from './adapters/bcrypt-password.service';
import { JwtTokenService } from './adapters/jwt-token.service';

// --- USE CASES ---
import { login } from '@domain/use-cases/login';
import { registerUser } from '@domain/use-cases/register-user';
import { getUser } from '@domain/use-cases/get-user';
import { getUsers } from '@domain/use-cases/get-users';
import { updateUser } from '@domain/use-cases/update-user';


const roleService = new DefaultRoleService();

const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();
const configRepository = new ConfigPrismaRepository(prisma);
const userRepository = new UserPrismaRepository(prisma, roleService);
const loanRepository = new LoanPrismaRepository(prisma);

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

const authControllerDeps = {
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

const userControllerDeps = {
    registerUserUseCase: registerUserUseCase,
    getUserUseCase: getUserUseCase,
    getUsersUseCase: getUsersUseCase,
    updateUserUseCase: updateUserUseCase,
};

// ----------------------------------------------------
// ROUTERS
// ----------------------------------------------------
const authRouter = createAuthRouter(authControllerDeps);
const userRouter = createUserRouter(userControllerDeps);

// ----------------------------------------------------
// CONFIGURACIÓN DEL SERVIDOR EXPRESS
// ----------------------------------------------------

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/*
app.get('/', (req, res) => {
    res.send('Library Backend Running!');
});
*/

// Routes
app.use('/auth', authRouter);
app.use('/users', userRouter);

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