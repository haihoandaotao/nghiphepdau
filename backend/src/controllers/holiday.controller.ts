import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';

export const getAllHolidays = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;

    const where: any = {};

    if (year) {
      const selectedYear = parseInt(year as string);
      where.date = {
        gte: new Date(`${selectedYear}-01-01`),
        lte: new Date(`${selectedYear}-12-31`),
      };
    }

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });

    res.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ message: 'Error fetching holidays' });
  }
};

export const getHolidayById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const holiday = await prisma.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    res.json(holiday);
  } catch (error) {
    console.error('Get holiday error:', error);
    res.status(500).json({ message: 'Error fetching holiday' });
  }
};

export const createHoliday = async (req: AuthRequest, res: Response) => {
  try {
    const { name, date, description } = req.body;

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        description: description || null,
      },
    });

    res.status(201).json({
      message: 'Holiday created successfully',
      holiday,
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    res.status(500).json({ message: 'Error creating holiday' });
  }
};

export const updateHoliday = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, date, description } = req.body;

    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        description,
      },
    });

    res.json({
      message: 'Holiday updated successfully',
      holiday,
    });
  } catch (error) {
    console.error('Update holiday error:', error);
    res.status(500).json({ message: 'Error updating holiday' });
  }
};

export const deleteHoliday = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.holiday.delete({
      where: { id },
    });

    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ message: 'Error deleting holiday' });
  }
};
