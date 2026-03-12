import { Prisma, VacancyStatus } from "@prisma/client";
import { prisma } from "../../prisma";
import { listPublicJobsQuerySchema } from "./jobs.schemas";

function buildRelevanceScore(job: {
  title: string;
  description: string;
  requiredSkills: string[];
  createdAt: Date;
}, q: string) {
  const query = q.toLowerCase().trim();
  if (!query) return 0;

  let score = 0;

  if (job.title.toLowerCase().includes(query)) score += 5;
  if (job.description.toLowerCase().includes(query)) score += 3;
  if (job.requiredSkills.some((skill) => skill.toLowerCase().includes(query))) score += 4;

  return score;
}

export async function listPublicJobs(rawQuery: unknown) {
  const query = listPublicJobsQuerySchema.parse(rawQuery);

  const {
    q,
    location,
    category,
    salaryMin,
    salaryMax,
    employmentType,
    workMode,
    experienceLevel,
    sort,
    page,
    pageSize,
  } = query;

  const where: Prisma.VacancyWhereInput = {
    status: VacancyStatus.APPROVED,

    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { requiredSkills: { hasSome: [q] } },
          ],
        }
      : {}),

    ...(location
      ? {
          city: { contains: location, mode: "insensitive" },
        }
      : {}),

    ...(category
      ? {
          category: { equals: category, mode: "insensitive" },
        }
      : {}),

    ...(employmentType ? { employmentType } : {}),
    ...(workMode ? { workMode } : {}),
    ...(experienceLevel ? { experienceLevel } : {}),

    ...(salaryMin !== undefined ? { salaryTo: { gte: salaryMin } } : {}),
    ...(salaryMax !== undefined ? { salaryFrom: { lte: salaryMax } } : {}),
  };

  const skip = (page - 1) * pageSize;

  let orderBy: Prisma.VacancyOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  if (sort === "salary_asc") {
    orderBy = [{ salaryFrom: "asc" }, { createdAt: "desc" }];
  }

  if (sort === "salary_desc") {
    orderBy = [{ salaryTo: "desc" }, { createdAt: "desc" }];
  }

  const [total, rows] = await Promise.all([
    prisma.vacancy.count({ where }),
    prisma.vacancy.findMany({
      where,
      orderBy,
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
        company: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    }),
  ]);

  let data = rows;

  if (sort === "relevance" && q) {
    data = [...rows].sort((a, b) => {
      const diff = buildRelevanceScore(b, q) - buildRelevanceScore(a, q);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return {
    data,
    page,
    pageSize,
    total,
  };
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
      category: true,
      employmentType: true,
      workMode: true,
      experienceLevel: true,
      requiredSkills: true,
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
      category: data.category,
      employmentType: data.employmentType,
      workMode: data.workMode,
      experienceLevel: data.experienceLevel,
      requiredSkills: data.requiredSkills ?? [],
      companyId,
      status: VacancyStatus.PENDING,
    },
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
    data: {
      ...data,
      requiredSkills: data.requiredSkills ?? undefined,
    },
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