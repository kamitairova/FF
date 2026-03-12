import { PrismaClient, Role, VacancyStatus, EmploymentType, WorkMode, ExperienceLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 10);

  const companies = [
    {
      email: "test2@example.com",
      password: passwordHash,
      role: Role.COMPANY,
    },
    {
      email: "test3@example.com",
      password: passwordHash,
      role: Role.COMPANY,
    },
    {
      email: "test4@example.com",
      password: passwordHash,
      role: Role.COMPANY,
    },
  ];

  for (const company of companies) {
    await prisma.user.upsert({
      where: { email: company.email },
      update: {},
      create: company,
    });
  }

  const company2 = await prisma.user.findUniqueOrThrow({
    where: { email: "test2@example.com" },
  });

  const company3 = await prisma.user.findUniqueOrThrow({
    where: { email: "test3@example.com" },
  });

  const company4 = await prisma.user.findUniqueOrThrow({
    where: { email: "test4@example.com" },
  });

  await prisma.vacancy.deleteMany({
    where: {
      companyId: {
        in: [company2.id, company3.id, company4.id],
      },
    },
  });

  const vacancies = [
    {
      companyId: company2.id,
      title: "Frontend Developer (React)",
      description:
        "We are looking for a frontend developer who can build clean and responsive user interfaces for a modern web platform. You will work with React, TypeScript and REST APIs, communicate with the backend team, improve usability, and help implement new features. We expect attention to detail, good knowledge of component-based architecture, and the ability to work with layouts and forms.",
      salaryFrom: 1200,
      salaryTo: 2000,
      city: "Bishkek",
      category: "Frontend",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.REMOTE,
      experienceLevel: ExperienceLevel.JUNIOR,
      requiredSkills: ["React", "TypeScript", "CSS", "HTML"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company2.id,
      title: "Sales Manager",
      description:
        "Our company is searching for a sales manager who can communicate with clients, present services, negotiate conditions, and maintain long-term business relationships. The specialist will handle incoming leads, work with the client database, prepare offers, and help increase sales volume. Experience in communication, confidence, and the ability to understand customer needs are important for this role.",
      salaryFrom: 800,
      salaryTo: 1400,
      city: "Bishkek",
      category: "Sales",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.ONSITE,
      experienceLevel: ExperienceLevel.JUNIOR,
      requiredSkills: ["Communication", "Negotiation", "CRM", "Sales"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company2.id,
      title: "Graphic Designer",
      description:
        "We need a graphic designer to prepare visual materials for social media, marketing campaigns, banners, presentations, and promotional products. You will work closely with the marketing team, adapt visuals for different platforms, and maintain a consistent visual style. Creativity, strong composition skills, and confidence with design tools are required.",
      salaryFrom: 900,
      salaryTo: 1500,
      city: "Bishkek",
      category: "Design",
      employmentType: EmploymentType.PART_TIME,
      workMode: WorkMode.HYBRID,
      experienceLevel: ExperienceLevel.JUNIOR,
      requiredSkills: ["Photoshop", "Illustrator", "Branding", "Creativity"],
      status: VacancyStatus.APPROVED,
    },

    {
      companyId: company3.id,
      title: "Backend Developer (Node.js)",
      description:
        "We are hiring a backend developer to build and maintain APIs, work with a PostgreSQL database, integrate third-party services, and improve the reliability of the server side of our application. You will participate in designing business logic, optimizing queries, and supporting production features. A solid understanding of Node.js, Express and database design is expected.",
      salaryFrom: 1500,
      salaryTo: 2600,
      city: "Bishkek",
      category: "Backend",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.ONSITE,
      experienceLevel: ExperienceLevel.MIDDLE,
      requiredSkills: ["Node.js", "Express", "PostgreSQL", "Docker"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company3.id,
      title: "Accountant",
      description:
        "We are looking for an accountant who will manage financial documentation, prepare reports, monitor expenses and income, and keep records accurate and up to date. The candidate should understand accounting procedures, work carefully with numbers, and be able to prepare internal financial summaries for management. Responsibility and accuracy are essential for this position.",
      salaryFrom: 700,
      salaryTo: 1200,
      city: "Bishkek",
      category: "Finance",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.ONSITE,
      experienceLevel: ExperienceLevel.MIDDLE,
      requiredSkills: ["Accounting", "1C", "Excel", "Reporting"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company3.id,
      title: "Customer Support Specialist",
      description:
        "The support specialist will communicate with clients, answer questions, solve service-related issues, and help users navigate the platform. You will process messages, clarify requests, and provide polite and timely assistance. We value patience, грамотная communication, and readiness to work with different types of customers in a fast-paced environment.",
      salaryFrom: 600,
      salaryTo: 1000,
      city: "Osh",
      category: "Support",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      experienceLevel: ExperienceLevel.JUNIOR,
      requiredSkills: ["Communication", "Support", "Problem Solving", "CRM"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company3.id,
      title: "English Teacher",
      description:
        "We are seeking an English teacher who can conduct lessons for teenagers and adults, prepare teaching materials, explain grammar clearly, and maintain student motivation. The role includes lesson planning, checking assignments, and adapting classes to different language levels. Teaching experience, clear pronunciation, and structured communication are important.",
      salaryFrom: 500,
      salaryTo: 1100,
      city: "Bishkek",
      category: "Education",
      employmentType: EmploymentType.PART_TIME,
      workMode: WorkMode.ONSITE,
      experienceLevel: ExperienceLevel.MIDDLE,
      requiredSkills: ["English", "Teaching", "Communication", "Lesson Planning"],
      status: VacancyStatus.APPROVED,
    },

    {
      companyId: company4.id,
      title: "HR Manager",
      description:
        "The HR manager will help with recruiting, initial communication with candidates, interview coordination, adaptation of new employees, and support of internal company processes. You will work with vacancies, candidate databases, and team communication. We are looking for a person with strong organizational skills, empathy, and the ability to evaluate people professionally.",
      salaryFrom: 900,
      salaryTo: 1600,
      city: "Almaty",
      category: "HR",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      experienceLevel: ExperienceLevel.MIDDLE,
      requiredSkills: ["Recruitment", "Interviewing", "Communication", "HR"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company4.id,
      title: "Barista",
      description:
        "We are looking for a barista who can prepare coffee drinks, maintain cleanliness in the working area, interact politely with guests, and ensure a pleasant customer experience. You will work with coffee equipment, prepare beverages according to recipes, handle orders, and support the daily workflow of the coffee shop. Friendliness, speed, and responsibility are important for this role.",
      salaryFrom: 400,
      salaryTo: 700,
      city: "Bishkek",
      category: "Service",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.ONSITE,
      experienceLevel: ExperienceLevel.INTERN,
      requiredSkills: ["Coffee", "Customer Service", "Teamwork", "Cleanliness"],
      status: VacancyStatus.APPROVED,
    },
    {
      companyId: company4.id,
      title: "SMM Manager",
      description:
        "The SMM manager will create content plans, publish posts, communicate with the audience, analyze engagement, and help develop the brand on social media platforms. You will work with text, visuals, and promotion ideas, coordinate with designers, and monitor campaign performance. Creativity, consistency, and understanding of social media trends are important.",
      salaryFrom: 700,
      salaryTo: 1300,
      city: "Bishkek",
      category: "Marketing",
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.REMOTE,
      experienceLevel: ExperienceLevel.JUNIOR,
      requiredSkills: ["SMM", "Content Creation", "Copywriting", "Analytics"],
      status: VacancyStatus.APPROVED,
    },
  ];

  await prisma.vacancy.createMany({
    data: vacancies,
  });

  console.log("Seed completed successfully.");
  console.log("Companies created:");
  console.log("test2@example.com / 12345678");
  console.log("test3@example.com / 12345678");
  console.log("test4@example.com / 12345678");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });