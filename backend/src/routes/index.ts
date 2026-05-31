import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { ContractController } from '../controllers/contractController';
import { ObraController } from '../controllers/obraController';
import { TemplateController } from '../controllers/templateController';
import { SignatureController } from '../controllers/signatureController';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/auth';

const routes = Router();

// Public routes
routes.get('/ping', (req, res) => res.json({ message: 'pong' }));
routes.post('/auth/login', AuthController.login);
routes.get('/signatures/:id', SignatureController.show);
routes.post('/signatures/:id/sign', SignatureController.sign);

// Protected routes
routes.use(authMiddleware);

// Contracts
routes.get('/contracts', ContractController.index);
routes.post('/contracts', ContractController.store);
routes.get('/contracts/:id', ContractController.show);
routes.delete('/contracts/:id', ContractController.destroy);
routes.get('/contracts/:id/download', ContractController.download);

// Templates
routes.get('/templates', TemplateController.index);
routes.get('/templates/:id', TemplateController.show);
routes.post('/templates', TemplateController.store);
routes.put('/templates/:id', TemplateController.update);
routes.delete('/templates/:id', TemplateController.destroy);

// Signatures
routes.post('/signatures', SignatureController.store);

// Obras
routes.get('/obras', ObraController.index);
routes.post('/obras', ObraController.store);
routes.get('/obras/:id', ObraController.show);
routes.post('/obras/:id/costs', ObraController.addCost);
routes.post('/obras/:id/steps', ObraController.addStep);
routes.post('/obras/:id/vistorias', ObraController.addVistoria);
routes.post('/obras/:id/purchase-orders', ObraController.addPurchaseOrder);

// Notifications
routes.get('/notifications', NotificationController.index);
routes.post('/notifications/:id/read', NotificationController.read);
routes.post('/notifications/read-all', NotificationController.readAll);

export default routes;
