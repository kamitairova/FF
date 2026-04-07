import {
  PrismaClient,
  Role,
  VacancyStatus,
  EmploymentType,
  WorkMode,
  ExperienceLevel,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 10);

  console.log("Seeding Companies...");
  const companyUser = await prisma.user.upsert({
    where: { email: "company@example.com" },
    update: { password: passwordHash, role: Role.COMPANY },
    create: { email: "company@example.com", password: passwordHash, role: Role.COMPANY },
  });

  const companyProfile = await prisma.companyProfile.upsert({
    where: { userId: companyUser.id },
    update: { companyName: "NovaTech Studio", companyCity: "Bishkek" },
    create: { userId: companyUser.id, companyName: "NovaTech Studio", companyCity: "Bishkek" },
  });

  console.log("Seeding Vacancies...");
  await prisma.vacancy.create({
    data: {
      companyProfileId: companyProfile.id,
      title: "Frontend Developer",
      description: "React/TS expert needed.",
      salaryFrom: 1500,
      city: "Bishkek",
      category: "IT",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.REMOTE,
      experienceLevel: ExperienceLevel.MIDDLE,
      status: VacancyStatus.APPROVED,
    }
  });

  console.log("Seeding Job Seekers...");
  const seekers = [
    {
      email: 'ivan@example.com',
      fullName: 'Иван Иванов',
      headline: 'Senior Frontend Developer',
      skills: ['React', 'TypeScript', 'Node.js'],
      content: {
        experience: [{ company: 'Tech Corp', position: 'Lead Dev', period: '2020-2024' }],
        education: [{ school: 'МГУ', degree: 'Магистр' }]
      }
    },
    {
      email: 'anna@example.com',
      fullName: 'Анна Смирнова',
      headline: 'UI/UX Designer',
      skills: ['Figma', 'Adobe XD'],
      content: {
        experience: [{ company: 'Design Studio', position: 'Senior Designer', period: '2021-2023' }],
        education: [{ school: 'Британка', degree: 'Дизайн' }]
      }
    }
  ];

  for (const s of seekers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { password: passwordHash, role: Role.USER },
      create: { email: s.email, password: passwordHash, role: Role.USER }
    });

    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: user.id },
      update: { fullName: s.fullName, headline: s.headline, skills: s.skills },
      create: { userId: user.id, fullName: s.fullName, headline: s.headline, skills: s.skills }
    });

    await prisma.resume.upsert({
      where: { seekerProfileId: profile.id },
      update: { content: s.content as any },
      create: { seekerProfileId: profile.id, content: s.content as any }
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());