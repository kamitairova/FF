import { VacancyStatus } from "@prisma/client";
import { prisma } from "../../prisma";

export async function getPublicCompanyProfile(companyProfileId: number) {
  return prisma.companyProfile.findUnique({
    where: { id: companyProfileId },
    select: {
      id: true,
      userId: true,
      companyName: true,
      companyLogoUrl: true,
      companyShortDescription: true,
      companyDescription: true,
      companyWebsite: true,
      companyPhone: true,
      companyCity: true,
      companyCountry: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      photos: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          imageUrl: true,
          sortOrder: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getPublicCompanyJobs(companyProfileId: number) {
  return prisma.vacancy.findMany({
    where: {
      companyProfileId,
      status: VacancyStatus.APPROVED,
    },
    orderBy: { createdAt: "desc" },
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
    },
  });
}