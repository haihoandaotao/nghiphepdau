import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';

export const getAllLeaveTypes = async (req: AuthRequest, res: Response) => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json(leaveTypes);
  } catch (error) {
    console.error('Get all leave types error:', error);
    res.status(500).json({ message: 'Error fetching leave types' });
  }
};

export const getLeaveTypeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leaveType = await prisma.leaveType.findUnique({
      where: { id },
    });

    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    res.json(leaveType);
  } catch (error) {
    console.error('Get leave type error:', error);
    res.status(500).json({ message: 'Error fetching leave type' });
  }
};

export const createLeaveType = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, description, maxDays } = req.body;

    const leaveType = await prisma.leaveType.create({
      data: {
        code,
        name,
        description: description || null,
        maxDays: maxDays || null,
      },
    });

    res.status(201).json({
      message: 'Leave type created successfully',
      leaveType,
    });
  } catch (error) {
    console.error('Create leave type error:', error);
    res.status(500).json({ message: 'Error creating leave type' });
  }
};

export const updateLeaveType = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, maxDays, isActive } = req.body;

    const leaveType = await prisma.leaveType.update({
      where: { id },
      data: {
        name: name,
        description: description,
        maxDays: maxDays,
        isActive: isActive,
      },
    });

    res.json({
      message: 'Leave type updated successfully',
      leaveType,
    });
  } catch (error) {
    console.error('Update leave type error:', error);
    res.status(500).json({ message: 'Error updating leave type' });
  }
};

export const deleteLeaveType = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.leaveType.delete({
      where: { id },
    });

    res.json({ message: 'Leave type deleted successfully' });
  } catch (error) {
    console.error('Delete leave type error:', error);
    res.status(500).json({ message: 'Error deleting leave type' });
  }
};
