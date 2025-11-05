import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';

export const createLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { leaveTypeId, startDate, endDate, reason, totalDays, attachment } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Check leave balance
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });

    if (!leaveType || !leaveType.isActive) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: req.user!.id,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        attachment: attachment || null,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Create notification for manager
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (user?.managerId) {
      await prisma.notification.create({
        data: {
          userId: user.managerId,
          title: 'New Leave Request',
          message: `${user.fullName} has submitted a leave request`,
          link: `/leave-requests/${leaveRequest.id}`,
        },
      });
    }

    res.status(201).json({
      message: 'Leave request created successfully',
      leaveRequest,
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ message: 'Error creating leave request' });
  }
};

export const getMyLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (status) {
      where.status = status as string;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        leaveType: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.leaveRequest.count({ where });

    res.json({
      leaveRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get my leave requests error:', error);
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
};

export const getAllLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, userId, departmentId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    if (userId) {
      where.userId = userId as string;
    }

    if (departmentId) {
      where.user = {
        departmentId: departmentId as string,
      };
    }

    // If manager, only show their team's requests
    if (req.user!.role === 'MANAGER') {
      where.user = {
        ...where.user,
        managerId: req.user!.id,
      };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        leaveType: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.leaveRequest.count({ where });

    res.json({
      leaveRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all leave requests error:', error);
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
};

export const getLeaveRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        leaveType: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            approvedAt: 'desc',
          },
        },
      },
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (
      leaveRequest.userId !== req.user!.id &&
      !['ADMIN', 'HR', 'MANAGER'].includes(req.user!.role)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(leaveRequest);
  } catch (error) {
    console.error('Get leave request by id error:', error);
    res.status(500).json({ message: 'Error fetching leave request' });
  }
};

export const updateLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { leaveTypeId, startDate, endDate, reason, totalDays, attachment } = req.body;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cannot update non-pending requests' });
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        leaveTypeId: leaveTypeId || leaveRequest.leaveTypeId,
        startDate: startDate ? new Date(startDate) : leaveRequest.startDate,
        endDate: endDate ? new Date(endDate) : leaveRequest.endDate,
        totalDays: totalDays || leaveRequest.totalDays,
        reason: reason || leaveRequest.reason,
        attachment: attachment !== undefined ? attachment : leaveRequest.attachment,
      },
      include: {
        leaveType: true,
      },
    });

    res.json({
      message: 'Leave request updated successfully',
      leaveRequest: updatedRequest,
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({ message: 'Error updating leave request' });
  }
};

export const cancelLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json({
      message: 'Leave request cancelled successfully',
      leaveRequest: updatedRequest,
    });
  } catch (error) {
    console.error('Cancel leave request error:', error);
    res.status(500).json({ message: 'Error cancelling leave request' });
  }
};

export const approveLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update leave request status
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });

    // Create approval record
    await prisma.approval.create({
      data: {
        leaveRequestId: id,
        approverId: req.user!.id,
        status: 'APPROVED',
        comments: comments || null,
      },
    });

    // Create notification for employee
    await prisma.notification.create({
      data: {
        userId: leaveRequest.userId,
        title: 'Leave Request Approved',
        message: `Your leave request has been approved`,
        link: `/leave-requests/${id}`,
      },
    });

    res.json({
      message: 'Leave request approved successfully',
      leaveRequest: updatedRequest,
    });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ message: 'Error approving leave request' });
  }
};

export const rejectLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({ message: 'Comments are required for rejection' });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update leave request status
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });

    // Create approval record
    await prisma.approval.create({
      data: {
        leaveRequestId: id,
        approverId: req.user!.id,
        status: 'REJECTED',
        comments,
      },
    });

    // Create notification for employee
    await prisma.notification.create({
      data: {
        userId: leaveRequest.userId,
        title: 'Leave Request Rejected',
        message: `Your leave request has been rejected. Reason: ${comments}`,
        link: `/leave-requests/${id}`,
      },
    });

    res.json({
      message: 'Leave request rejected successfully',
      leaveRequest: updatedRequest,
    });
  } catch (error) {
    console.error('Reject leave request error:', error);
    res.status(500).json({ message: 'Error rejecting leave request' });
  }
};
