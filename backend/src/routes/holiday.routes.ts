import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as holidayController from '../controllers/holiday.controller';

const router = Router();

router.use(authenticate);

router.get('/', holidayController.getAllHolidays);
router.get('/:id', holidayController.getHolidayById);

// Admin/HR only
router.post('/', authorize('ADMIN', 'HR'), holidayController.createHoliday);
router.put('/:id', authorize('ADMIN', 'HR'), holidayController.updateHoliday);
router.delete('/:id', authorize('ADMIN', 'HR'), holidayController.deleteHoliday);

export default router;
