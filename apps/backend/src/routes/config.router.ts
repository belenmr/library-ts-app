import { Router } from 'express';
import { ConfigController, ConfigControllerDeps } from '../controllers/config.controller';

export const createConfigRouter = (deps: ConfigControllerDeps): Router => {
    const router = Router();
    const controller = new ConfigController(deps);
    
    // POST /config/loan-limits
    router.post('/loan-limits', controller.updateLoanLimit); 
    
    return router;
};