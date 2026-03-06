import { prisma } from "../../prisma";
import { VacancyStatus } from "@prisma/client";

export function listPublicJobs() {
  return prisma.vacancy.findMany({
    where: { status: VacancyStatus.APPROVED },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      salaryFrom: true,
      salaryTo: true,
      city: true,
      status: true,
      createdAt: true,
      company: { select: { id: true, email: true } },
    },
  });
}

export function getJobById(id: number) {
  return prisma.vacancy.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      salaryFrom: true,
      salaryTo: true,
      city: true,
      status: true,
      createdAt: true,
      companyId: true,
      company: { select: { id: true, email: true } },
    },
  });
}

export function createJob(companyId: number, data: any) {
  return prisma.vacancy.create({
    data: {
      title: data.title,
      description: data.description,
      salaryFrom: data.salaryFrom,
      salaryTo: data.salaryTo,
      city: data.city,
      companyId,
      status: VacancyStatus.APPROVED,
    },
    select: {
      id: true,
      title: true,
      description: true,
      salaryFrom: true,
      salaryTo: true,
      city: true,
      status: true,
      createdAt: true,
      companyId: true,
    },
  });
}

export async function updateJob(companyId: number, id: number, data: any) {
  const existing = await prisma.vacancy.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.companyId !== companyId) return "FORBIDDEN";

  return prisma.vacancy.update({
    where: { id },
    data,
    select: {
      id: true,
      title: true,
      description: true,
      salaryFrom: true,
      salaryTo: true,
      city: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function deleteJob(companyId: number, id: number) {
  const existing = await prisma.vacancy.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.companyId !== companyId) return "FORBIDDEN";

  await prisma.vacancy.delete({ where: { id } });
  return true;
}

export function listMyJobs(companyId: number) {
  return prisma.vacancy.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
}

export async function setJobStatus(id: number, status: VacancyStatus) {
  return prisma.vacancy.update({
    where: { id },
    data: { status },
  });
}