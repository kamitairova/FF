import { PrismaClient, Role, VacancyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function upsertCompany(params: {
  email: string;
  password: string;
  companyName: string;
  companyCity?: string;
  companyCountry?: string;
  companyDescription?: string;
}) {
  const passwordHash = await hashPassword(params.password);

  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {
      password: passwordHash,
      role: Role.COMPANY,
    },
    create: {
      email: params.email,
      password: passwordHash,
      role: Role.COMPANY,
    },
  });

  const profile = await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: params.companyName,
      companyCity: params.companyCity ?? null,
      companyCountry: params.companyCountry ?? null,
      companyDescription: params.companyDescription ?? null,
    },
    create: {
      userId: user.id,
      companyName: params.companyName,
      companyCity: params.companyCity ?? null,
      companyCountry: params.companyCountry ?? null,
      companyDescription: params.companyDescription ?? null,
    },
  });

  return { user, profile };
}

async function upsertSeeker(params: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  location?: string;
  headline?: string;
  experienceLevel?: "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
  resume?: {
    title: string;
    desiredPosition?: string;
    salaryExpectation?: number;
    experienceLevel?: "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
    skills?: string[];
    isPublic?: boolean;
  };
}) {
  const passwordHash = await hashPassword(params.password);

  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {
      password: passwordHash,
      role: Role.USER,
    },
    create: {
      email: params.email,
      password: passwordHash,
      role: Role.USER,
    },
  });

  const profile = await prisma.jobSeekerProfile.upsert({
    where: { userId: user.id },
    update: {
      firstName: params.firstName,
      lastName: params.lastName ?? null,
      location: params.location ?? null,
      headline: params.headline ?? null,
      experienceLevel: params.experienceLevel ?? null,
    },
    create: {
      userId: user.id,
      firstName: params.firstName,
      lastName: params.lastName ?? null,
      location: params.location ?? null,
      headline: params.headline ?? null,
      experienceLevel: params.experienceLevel ?? null,
    },
  });

  if (params.resume) {
    const existingResume = await prisma.resume.findFirst({
      where: {
        seekerProfileId: profile.id,
        title: params.resume.title,
      },
    });

    if (existingResume) {
      await prisma.resume.update({
        where: { id: existingResume.id },
        data: {
          desiredPosition: params.resume.desiredPosition ?? null,
          salaryExpectation: params.resume.salaryExpectation ?? null,
          experienceLevel: params.resume.experienceLevel ?? null,
          skills: params.resume.skills ?? [],
          isPublic: params.resume.isPublic ?? true,
        },
      });
    } else {
      await prisma.resume.create({
        data: {
          seekerProfileId: profile.id,
          title: params.resume.title,
          desiredPosition: params.resume.desiredPosition ?? null,
          salaryExpectation: params.resume.salaryExpectation ?? null,
          experienceLevel: params.resume.experienceLevel ?? null,
          skills: params.resume.skills ?? [],
          isPublic: params.resume.isPublic ?? true,
        },
      });
    }
  }

  return { user, profile };
}

async function createVacancy(params: {
  companyProfileId: number;
  title: string;
  description: string;
  city?: string;
  salaryFrom?: number;
  salaryTo?: number;
  requiredSkills?: string[];
  status?: VacancyStatus;
}) {
  return prisma.vacancy.create({
    data: {
      companyProfileId: params.companyProfileId,
      title: params.title,
      description: params.description,
      city: params.city ?? null,
      salaryFrom: params.salaryFrom ?? null,
      salaryTo: params.salaryTo ?? null,
      requiredSkills: params.requiredSkills ?? [],
      status: params.status ?? VacancyStatus.APPROVED,
    },
  });
}

async function main() {
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.resumeFile.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.seekerPhoto.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.companyPhoto.deleteMany();
  await prisma.jobSeekerProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.user.deleteMany();

  const company1 = await upsertCompany({
    email: "company1@test.com",
    password: "123456",
    companyName: "Tech Vision",
    companyCity: "Bishkek",
    companyCountry: "Kyrgyzstan",
    companyDescription: "Frontend and backend development company",
  });

  const company2 = await upsertCompany({
    email: "company2@test.com",
    password: "123456",
    companyName: "Cloud Peak",
    companyCity: "Bishkek",
    companyCountry: "Kyrgyzstan",
    companyDescription: "Remote-first software team",
  });

  await upsertSeeker({
    email: "seeker1@test.com",
    password: "123456",
    firstName: "Kamilla",
    lastName: "Tairova",
    location: "Bishkek",
    headline: "Frontend Developer",
    experienceLevel: "JUNIOR",
    resume: {
      title: "Frontend Resume",
      desiredPosition: "Frontend Developer",
      salaryExpectation: 1200,
      experienceLevel: "JUNIOR",
      skills: ["React", "TypeScript", "CSS"],
      isPublic: true,
    },
  });

  await upsertSeeker({
    email: "seeker2@test.com",
    password: "123456",
    firstName: "Aida",
    lastName: "Asanova",
    location: "Osh",
    headline: "UI/UX Designer",
    experienceLevel: "MIDDLE",
    resume: {
      title: "Designer Resume",
      desiredPosition: "UI/UX Designer",
      salaryExpectation: 1000,
      experienceLevel: "MIDDLE",
      skills: ["Figma", "UX Research", "Prototyping"],
      isPublic: true,
    },
  });

  await upsertSeeker({
    email: "seeker3@test.com",
    password: "123456",
    firstName: "Ilya",
    lastName: "Petrov",
    location: "Bishkek",
    headline: "Backend Developer",
    experienceLevel: "MIDDLE",
    resume: {
      title: "Backend Resume",
      desiredPosition: "Backend Developer",
      salaryExpectation: 1500,
      experienceLevel: "MIDDLE",
      skills: ["Node.js", "PostgreSQL", "Prisma"],
      isPublic: true,
    },
  });

  await createVacancy({
    companyProfileId: company1.profile.id,
    title: "Frontend Developer",
    description: "React, TypeScript, Vite",
    city: "Bishkek",
    salaryFrom: 1000,
    salaryTo: 1500,
    requiredSkills: ["React", "TypeScript", "CSS"],
    status: VacancyStatus.APPROVED,
  });

  await createVacancy({
    companyProfileId: company1.profile.id,
    title: "Backend Developer",
    description: "Node.js, Prisma, PostgreSQL",
    city: "Bishkek",
    salaryFrom: 1200,
    salaryTo: 1800,
    requiredSkills: ["Node.js", "Prisma", "PostgreSQL"],
    status: VacancyStatus.PENDING,
  });

  await createVacancy({
    companyProfileId: company2.profile.id,
    title: "UI/UX Designer",
    description: "Figma, design systems, prototyping",
    city: "Remote",
    salaryFrom: 900,
    salaryTo: 1400,
    requiredSkills: ["Figma", "UX", "Prototyping"],
    status: VacancyStatus.APPROVED,
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });