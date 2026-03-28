import { Prisma, VacancyStatus } from "@prisma/client";
import { prisma } from "../../prisma";

type PageParams = {
  page?: number;
  pageSize?: number;
};

export async function getMetrics() {
  const [
    users,
    companies,
    admins,
    disabledUsers,
    totalJobs,
    pendingJobs,
    approvedJobs,
    rejectedJobs,
    removedJobs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "COMPANY" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isDisabled: true } }),
    prisma.vacancy.count(),
    prisma.vacancy.count({ where: { status: "PENDING" } }),
    prisma.vacancy.count({ where: { status: "APPROVED" } }),
    prisma.vacancy.count({ where: { status: "REJECTED" } }),
    prisma.vacancy.count({ where: { status: "REMOVED" } }),
  ]);

  return {
    users,
    companies,
    admins,
    disabledUsers,
    totalJobs,
    pendingJobs,
    approvedJobs,
    rejectedJobs,
    removedJobs,
  };
}

export async function listUsers(params: PageParams = {}) {
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  const skip = (page - 1) * pageSize;

  const [total, data] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        role: true,
        isDisabled: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    data,
    page,
    pageSize,
    total,
  };
}

export async function disableUser(id: number) {
  return prisma.user.update({
    where: { id },
    data: { isDisabled: true },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
  });
}

export async function enableUser(id: number) {
  return prisma.user.update({
    where: { id },
    data: { isDisabled: false },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
  });
}

export async function listJobs(
  params: PageParams & { status?: string } = {}
) {
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  const skip = (page - 1) * pageSize;

  const where: Prisma.VacancyWhereInput = {};

  if (
    params.status &&
    ["PENDING", "APPROVED", "REJECTED", "REMOVED"].includes(params.status)
  ) {
    where.status = params.status as VacancyStatus;
  }

  const [total, data] = await Promise.all([
    prisma.vacancy.count({ where }),
    prisma.vacancy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        salaryFrom: true,
        salaryTo: true,
        city: true,
        category: true,
        employmentType: true,
        workMode: true,
        experienceLevel: true,
        requiredSkills: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        companyProfileId: true,
        companyProfile: {
          select: {
            id: true,
            companyName: true,
            companyLogoUrl: true,
            companyCity: true,
            companyCountry: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    data,
    page,
    pageSize,
    total,
  };
}

export async function setJobStatus(id: number, status: VacancyStatus) {
  return prisma.vacancy.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      title: true,
      description: true,
      salaryFrom: true,
      salaryTo: true,
      city: true,
      category: true,
      employmentType: true,
      workMode: true,
      experienceLevel: true,
      requiredSkills: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      companyProfileId: true,
      companyProfile: {
        select: {
          id: true,
          companyName: true,
          companyLogoUrl: true,
          companyCity: true,
          companyCountry: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
  });
}