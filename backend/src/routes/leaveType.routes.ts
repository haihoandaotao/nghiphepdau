import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as leaveTypeController from '../controllers/leaveType.controller';

const router = Router();

router.use(authenticate);

router.get('/', leaveTypeController.getAllLeaveTypes);
router.get('/:id', leaveTypeController.getLeaveTypeById);

// Admin/HR only
router.post('/', authorize('ADMIN', 'HR'), leaveTypeController.createLeaveType);
router.put('/:id', authorize('ADMIN', 'HR'), leaveTypeController.updateLeaveType);
router.delete('/:id', authorize('ADMIN', 'HR'), leaveTypeController.deleteLeaveType);

export default router;
