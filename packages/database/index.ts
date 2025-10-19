import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database utility functions
export * from '@prisma/client';

// Helper functions for common operations
export class DatabaseHelpers {
  static async getUserWithFamily(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        familyMemberships: {
          include: {
            family: {
              include: {
                projects: {
                  include: {
                    tasks: {
                      include: {
                        subtasks: true,
                        comments: true,
                        attachments: true,
                      },
                    },
                  },
                },
                children: {
                  include: {
                    activities: {
                      include: {
                        schedules: true,
                      },
                    },
                    events: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async getProjectWithTasks(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            subtasks: {
              include: {
                subtasks: true, // Support for nested subtasks
                comments: true,
                attachments: true,
              },
            },
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            attachments: true,
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { dueDate: 'asc' },
            { createdAt: 'asc' },
          ],
        },
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async getTasksForUser(userId: string, options?: {
    status?: string[];
    priority?: string[];
    dueDate?: { from?: Date; to?: Date };
    projectIds?: string[];
  }) {
    const where: any = {
      OR: [
        { assignedTo: userId },
        { createdBy: userId },
        {
          AND: [
            { visibility: 'FAMILY' },
            {
              project: {
                family: {
                  members: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          ],
        },
        {
          AND: [
            { visibility: 'CUSTOM' },
            { sharedWith: { has: userId } },
          ],
        },
      ],
    };

    if (options?.status) {
      where.status = { in: options.status };
    }

    if (options?.priority) {
      where.priority = { in: options.priority };
    }

    if (options?.dueDate) {
      where.dueDate = {};
      if (options.dueDate.from) {
        where.dueDate.gte = options.dueDate.from;
      }
      if (options.dueDate.to) {
        where.dueDate.lte = options.dueDate.to;
      }
    }

    if (options?.projectIds) {
      where.projectId = { in: options.projectIds };
    }

    return prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        subtasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  static async getDashboardStats(userId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [totalTasks, completedTasks, overdueTasks, tasksToday, projectsActive] = await Promise.all([
      prisma.task.count({
        where: {
          OR: [
            { assignedTo: userId },
            { createdBy: userId },
          ],
        },
      }),
      prisma.task.count({
        where: {
          OR: [
            { assignedTo: userId },
            { createdBy: userId },
          ],
          status: 'COMPLETED',
        },
      }),
      prisma.task.count({
        where: {
          OR: [
            { assignedTo: userId },
            { createdBy: userId },
          ],
          dueDate: {
            lt: today,
          },
          status: {
            not: 'COMPLETED',
          },
        },
      }),
      prisma.task.count({
        where: {
          OR: [
            { assignedTo: userId },
            { createdBy: userId },
          ],
          dueDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
          status: {
            not: 'COMPLETED',
          },
        },
      }),
      prisma.project.count({
        where: {
          OR: [
            { ownerId: userId },
            { sharedWith: { has: userId } },
          ],
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksToday,
      projectsActive,
    };
  }
}