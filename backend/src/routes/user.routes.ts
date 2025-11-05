import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

// Protected routes
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/leave-balance', userController.getLeaveBalance);

// Admin/HR only routes
router.get('/', authorize('ADMIN', 'HR'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN', 'HR', 'MANAGER'), userController.getUserById);
router.put('/:id', authorize('ADMIN', 'HR'), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

export default router;
