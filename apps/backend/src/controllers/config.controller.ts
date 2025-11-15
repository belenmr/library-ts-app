import { Request, Response } from 'express';
import type { LoanLimitConfig } from '@domain/entities/loanLimitConfig';
import { RoleName } from '@domain/entities/role';

type UpdateLoanLimitUseCase = (payload: any) => Promise<LoanLimitConfig | Error>;

export interface ConfigControllerDeps {
    updateLoanLimitUseCase: UpdateLoanLimitUseCase;
}

export class ConfigController {
    constructor(private readonly deps: ConfigControllerDeps) {}

    // POST /config/loan-limits
    public updateLoanLimit = async (req: Request, res: Response) => {
        // NOTA: REQUIERE MIDDLEWARE DE AUTORIZACIÓN (ADMIN)
        const { targetRole, newLimit } = req.body;
        
        // El rol del ejecutor vendría del token JWT (simulamos ADMIN)
        const executorRole = RoleName.ADMIN; 

        try {
            const payload = { executorRole, targetRole, newLimit: parseInt(newLimit) };
            const result = await this.deps.updateLoanLimitUseCase(payload);

            if (result instanceof Error) {
                return res.status(403).json({ error: result.message });
            }

            return res.status(200).json({ 
                message: `Loan limit updated successfully for ${result.roleName}.`,
                config: result
            });

        } catch (error) {
            console.error('Error updating loan limit:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
}