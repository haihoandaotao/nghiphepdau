import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as leaveRequestController from '../controllers/leaveRequest.controller';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/', leaveRequestController.createLeaveRequest);
router.get('/my-requests', leaveRequestController.getMyLeaveRequests);
router.get('/:id', leaveRequestController.getLeaveRequestById);
router.put('/:id', leaveRequestController.updateLeaveRequest);
router.delete('/:id', leaveRequestController.cancelLeaveRequest);

// Manager/HR routes
router.get('/', authorize('MANAGER', 'HR', 'ADMIN'), leaveRequestController.getAllLeaveRequests);
router.post('/:id/approve', authorize('MANAGER', 'HR', 'ADMIN'), leaveRequestController.approveLeaveRequest);
router.post('/:id/reject', authorize('MANAGER', 'HR', 'ADMIN'), leaveRequestController.rejectLeaveRequest);

export default router;
