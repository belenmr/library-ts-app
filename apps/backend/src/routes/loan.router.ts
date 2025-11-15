import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import type { LoanControllerDeps } from '../controllers/loan.controller';

export const createLoanRouter = (deps: LoanControllerDeps): Router => {
    const router = Router();
    const loanController = new LoanController(deps);

    // 1. CREACIÓN Y FINALIZACIÓN
    router.post('/', loanController.createLoan);
    router.put('/:id/return', loanController.endLoan);

    // 2. CONSULTAS ESPECÍFICAS POR ESTADO
    router.get('/active', loanController.getActiveLoans);
    router.get('/overdue', loanController.getOverdueLoans);
    router.get('/fine-status', loanController.hasPendingFine);
    router.get('/', loanController.getLoans);
    router.get('/:id', loanController.getLoan);

    return router;
};