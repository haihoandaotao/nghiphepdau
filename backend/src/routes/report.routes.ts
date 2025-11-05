import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('MANAGER', 'HR', 'ADMIN'));

router.get('/leave-statistics', reportController.getLeaveStatistics);
router.get('/department-report', reportController.getDepartmentReport);
router.get('/user-leave-history/:userId', reportController.getUserLeaveHistory);
router.get('/export', reportController.exportReport);

export default router;
