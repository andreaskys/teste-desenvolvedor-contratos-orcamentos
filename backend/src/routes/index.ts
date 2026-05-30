import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { ContractController } from '../controllers/contractController';
import { ObraController } from '../controllers/obraController';
import { authMiddleware } from '../middlewares/auth';

const routes = Router();

// Public routes
routes.post('/auth/login', AuthController.login);

// Protected routes
routes.use(authMiddleware);

// Contracts
routes.get('/contracts', ContractController.index);
routes.post('/contracts', ContractController.store);
routes.get('/contracts/:id', ContractController.show);

// Obras
routes.get('/obras', ObraController.index);
routes.post('/obras', ObraController.store);
routes.get('/obras/:id', ObraController.show);

export default routes;
