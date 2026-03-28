import { Prisma, VacancyStatus } from "@prisma/client";
import { prisma } from "../../prisma";
import { listPublicJobsQuerySchema } from "./jobs.schemas";

function buildRelevanceScore(
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    createdAt: Date;
  },
  q: string
) {
  const query = q.toLowerCase().trim();
  if (!query) return 0;

  let score = 0;
  if (job.title.toLowerCase().includes(query)) score += 5;
  if (job.description.toLowerCase().includes(query)) score += 3;
  if (job.requiredSkills.some((skill) => skill.toLowerCase().includes(query))) score += 4;

  return score;
}

async function getMyCompanyProfileId(userId: number) {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Company profile not found");
  }

  return profile.id;
}

const publicJobSelect = {
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
  wasPublishedBefore: true,
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
} as const;

const companyJobSelect = {
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
  wasPublishedBefore: true,
  createdAt: true,
  updatedAt: true,
  companyProfileId: true,
  companyProfile: {
    select: {
      id: true,
      companyName: true,
      companyLogoUrl: true,
    },
  },
} as const;

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

    ...(location ? { city: { contains: location, mode: "insensitive" } } : {}),
    ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(workMode ? { workMode } : {}),
    ...(experienceLevel ? { experienceLevel } : {}),
    ...(salaryMin !== undefined ? { salaryTo: { gte: salaryMin } } : {}),
    ...(salaryMax !== undefined ? { salaryFrom: { lte: salaryMax } } : {}),
  };

  const skip = (page - 1) * pageSize;

  let orderBy: Prisma.VacancyOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  if (sort === "salary_asc") orderBy = [{ salaryFrom: "asc" }, { createdAt: "desc" }];
  if (sort === "salary_desc") orderBy = [{ salaryTo: "desc" }, { createdAt: "desc" }];

  const [total, rows] = await Promise.all([
    prisma.vacancy.count({ where }),
    prisma.vacancy.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: publicJobSelect,
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

  return { data, page, pageSize, total };
}

export async function getPublicJobById(id: number) {
  return prisma.vacancy.findFirst({
    where: {
      id,
      status: VacancyStatus.APPROVED,
    },
    select: publicJobSelect,
  });
}

export async function getMyJobById(userId: number, id: number) {
  const companyProfileId = await getMyCompanyProfileId(userId);

  return prisma.vacancy.findFirst({
    where: {
      id,
      companyProfileId,
    },
    select: companyJobSelect,
  });
}

export async function createJob(userId: number, data: any) {
  const companyProfileId = await getMyCompanyProfileId(userId);

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
      companyProfileId,
      status: VacancyStatus.PENDING,
      wasPublishedBefore: false,
    },
    select: companyJobSelect,
  });
}

export async function updateJob(userId: number, id: number, data: any) {
  const companyProfileId = await getMyCompanyProfileId(userId);

  const existing = await prisma.vacancy.findUnique({
    where: { id },
  });

  if (!existing) return null;
  if (existing.companyProfileId !== companyProfileId) return "FORBIDDEN";

  const shouldReturnToPending = existing.status === VacancyStatus.APPROVED;

  return prisma.vacancy.update({
    where: { id },
    data: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      salaryFrom: data.salaryFrom ?? undefined,
      salaryTo: data.salaryTo ?? undefined,
      city: data.city ?? undefined,
      category: data.category ?? undefined,
      employmentType: data.employmentType ?? undefined,
      workMode: data.workMode ?? undefined,
      experienceLevel: data.experienceLevel ?? undefined,
      requiredSkills: data.requiredSkills ?? undefined,
      status: shouldReturnToPending ? VacancyStatus.PENDING : existing.status,
      wasPublishedBefore: shouldReturnToPending ? true : existing.wasPublishedBefore,
    },
    select: companyJobSelect,
  });
}

export async function deleteJob(userId: number, id: number) {
  const companyProfileId = await getMyCompanyProfileId(userId);

  const existing = await prisma.vacancy.findUnique({
    where: { id },
  });

  if (!existing) return null;
  if (existing.companyProfileId !== companyProfileId) return "FORBIDDEN";

  await prisma.vacancy.delete({
    where: { id },
  });

  return true;
}

export async function listMyJobs(userId: number) {
  const companyProfileId = await getMyCompanyProfileId(userId);

  return prisma.vacancy.findMany({
    where: { companyProfileId },
    orderBy: { createdAt: "desc" },
    select: companyJobSelect,
  });
}

export async function setJobStatus(id: number, status: VacancyStatus) {
  return prisma.vacancy.update({
    where: { id },
    data: { status },
    select: publicJobSelect,
  });
}