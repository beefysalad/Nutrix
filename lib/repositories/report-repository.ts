import prisma from '@/lib/prisma'

export const reportRepository = {
  async findDailyReport(userId: string, start: Date, end: Date) {
    return prisma.dailyReport.findFirst({
      where: {
        userId,
        reportDate: {
          gte: start,
          lte: end,
        },
      },
    })
  },

  async findAllByUser(userId: string) {
    return prisma.dailyReport.findMany({
      where: { userId },
      orderBy: { reportDate: 'desc' },
    })
  },

  async updateDailyReport(id: string, data: { rating: number; note: string | null }) {
    return prisma.dailyReport.update({
      where: { id },
      data,
    })
  },

  async createDailyReport(userId: string, reportDate: Date, data: { rating: number; note: string | null }) {
    return prisma.dailyReport.create({
      data: {
        userId,
        reportDate,
        ...data,
      },
    })
  },
}
