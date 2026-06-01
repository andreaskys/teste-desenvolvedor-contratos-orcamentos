import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { ContractController } from '../controllers/contractController';
import { ObraController } from '../controllers/obraController';
import { TemplateController } from '../controllers/templateController';
import { SignatureController } from '../controllers/signatureController';
import { SignatureWebhookController } from '../controllers/signatureWebhookController';
import { NotificationController } from '../controllers/notificationController';
import { UserController } from '../controllers/userController';
import { PurchaseOrderController } from '../controllers/purchaseOrderController';
import { UploadController } from '../controllers/uploadController';
import { AnalyticsController } from '../controllers/analyticsController';
import { ReportController } from '../controllers/reportController';
import { authMiddleware } from '../middlewares/auth';
import { uploadConfig } from '../middlewares/upload';
import express from 'express';

const routes = Router();

// Public routes
routes.get('/ping', (req, res) => res.json({ message: 'pong' }));
routes.post('/auth/login', AuthController.login);
routes.get('/signatures/:id', SignatureController.show);
routes.post('/signatures/:id/sign', SignatureController.sign);
routes.post('/webhooks/signatures', SignatureWebhookController.handle);

// Static files
routes.use('/files', express.static('uploads'));

// Protected routes
routes.use(authMiddleware);

// Uploads
routes.post('/uploads', uploadConfig.single('file'), UploadController.store);
routes.get('/uploads', UploadController.index);

// Analytics
routes.get('/analytics/summary', AnalyticsController.getSummary);

// Reports
routes.get('/reports/contracts/export', ReportController.exportContracts);
routes.get('/reports/obras/export', ReportController.exportObras);

// Contracts
routes.get('/contracts', ContractController.index);
routes.post('/contracts', ContractController.store);
routes.get('/contracts/:id', ContractController.show);
routes.put('/contracts/:id', ContractController.update);
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
routes.get('/signatures', SignatureController.index);

// Obras
routes.get('/obras', ObraController.index);
routes.post('/obras', ObraController.store);
routes.get('/obras/:id', ObraController.show);
routes.post('/obras/:id/costs', ObraController.addCost);
routes.post('/obras/:id/steps', ObraController.addStep);
routes.patch('/obras/:id/steps/:stepId', ObraController.updateStep);
routes.post('/obras/:id/vistorias', ObraController.addVistoria);
routes.post('/obras/:id/purchase-orders', ObraController.addPurchaseOrder);
routes.post('/obras/:id/manutencoes', ObraController.addManutencao);

// Notifications
routes.get('/notifications', NotificationController.index);
routes.post('/notifications/:id/read', NotificationController.read);
routes.post('/notifications/read-all', NotificationController.readAll);

// Users (Multi-tenant)
routes.get('/users', UserController.index);
routes.post('/users', UserController.store);

// Global Purchase Orders
routes.get('/purchase-orders', PurchaseOrderController.index);

export default routes;
