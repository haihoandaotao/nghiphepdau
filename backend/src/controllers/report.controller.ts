import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';

export const getLeaveStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    const where: any = {
      status: 'APPROVED',
    };

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (departmentId) {
      where.user = {
        departmentId: departmentId as string,
      };
    }

    // If manager, only show their team's data
    if (req.user!.role === 'MANAGER') {
      where.user = {
        ...where.user,
        managerId: req.user!.id,
      };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        leaveType: true,
        user: {
          select: {
            id: true,
            fullName: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      total: leaveRequests.length,
      totalDays: leaveRequests.reduce((sum, req) => sum + req.totalDays, 0),
      byLeaveType: {} as any,
      byDepartment: {} as any,
    };

    leaveRequests.forEach((req) => {
      // By leave type
      const typeName = req.leaveType.name;
      if (!stats.byLeaveType[typeName]) {
        stats.byLeaveType[typeName] = { count: 0, totalDays: 0 };
      }
      stats.byLeaveType[typeName].count++;
      stats.byLeaveType[typeName].totalDays += req.totalDays;

      // By department
      if (req.user.department) {
        const deptName = req.user.department.name;
        if (!stats.byDepartment[deptName]) {
          stats.byDepartment[deptName] = { count: 0, totalDays: 0 };
        }
        stats.byDepartment[deptName].count++;
        stats.byDepartment[deptName].totalDays += req.totalDays;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Get leave statistics error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

export const getDepartmentReport = async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId, year } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const where: any = {
      status: 'APPROVED',
      startDate: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    };

    if (departmentId) {
      where.user = {
        departmentId: departmentId as string,
      };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        leaveType: true,
      },
    });

    // Group by user
    const userStats: any = {};

    leaveRequests.forEach((req) => {
      const userId = req.user.id;
      if (!userStats[userId]) {
        userStats[userId] = {
          user: req.user,
          totalLeaves: 0,
          leavesByType: {},
        };
      }

      userStats[userId].totalLeaves += req.totalDays;

      const typeName = req.leaveType.name;
      if (!userStats[userId].leavesByType[typeName]) {
        userStats[userId].leavesByType[typeName] = 0;
      }
      userStats[userId].leavesByType[typeName] += req.totalDays;
    });

    res.json(Object.values(userStats));
  } catch (error) {
    console.error('Get department report error:', error);
    res.status(500).json({ message: 'Error fetching department report' });
  }
};

export const getUserLeaveHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId,
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      include: {
        leaveType: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Get user leave history error:', error);
    res.status(500).json({ message: 'Error fetching leave history' });
  }
};

export const exportReport = async (req: AuthRequest, res: Response) => {
  try {
    // This is a placeholder for CSV/Excel export functionality
    // You would typically use a library like 'csv-writer' or 'exceljs'
    
    res.json({ message: 'Export functionality to be implemented' });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
};
