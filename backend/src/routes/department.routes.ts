import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as departmentController from '../controllers/department.controller';

const router = Router();

router.use(authenticate);

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin/HR only
router.post('/', authorize('ADMIN', 'HR'), departmentController.createDepartment);
router.put('/:id', authorize('ADMIN', 'HR'), departmentController.updateDepartment);
router.delete('/:id', authorize('ADMIN', 'HR'), departmentController.deleteDepartment);

export default router;
