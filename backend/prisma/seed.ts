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

async function upsertCompanyWithProfile(params: {
  email: string;
  passwordHash: string;
  profile: {
    companyName: string;
    companyLogoUrl?: string;
    companyShortDescription?: string;
    companyDescription?: string;
    companyWebsite?: string;
    companyPhone?: string;
    companyCity?: string;
    companyCountry?: string;
  };
  photos?: string[];
}) {
  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {
      password: params.passwordHash,
      role: Role.COMPANY,
      isDisabled: false,
    },
    create: {
      email: params.email,
      password: params.passwordHash,
      role: Role.COMPANY,
      isDisabled: false,
    },
  });

  const companyProfile = await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: params.profile.companyName,
      companyLogoUrl: params.profile.companyLogoUrl ?? null,
      companyShortDescription: params.profile.companyShortDescription ?? null,
      companyDescription: params.profile.companyDescription ?? null,
      companyWebsite: params.profile.companyWebsite ?? null,
      companyPhone: params.profile.companyPhone ?? null,
      companyCity: params.profile.companyCity ?? null,
      companyCountry: params.profile.companyCountry ?? null,
    },
    create: {
      userId: user.id,
      companyName: params.profile.companyName,
      companyLogoUrl: params.profile.companyLogoUrl ?? null,
      companyShortDescription: params.profile.companyShortDescription ?? null,
      companyDescription: params.profile.companyDescription ?? null,
      companyWebsite: params.profile.companyWebsite ?? null,
      companyPhone: params.profile.companyPhone ?? null,
      companyCity: params.profile.companyCity ?? null,
      companyCountry: params.profile.companyCountry ?? null,
    },
  });

  await prisma.companyPhoto.deleteMany({
    where: { companyProfileId: companyProfile.id },
  });

  if (params.photos?.length) {
    await prisma.companyPhoto.createMany({
      data: params.photos.map((imageUrl, index) => ({
        companyProfileId: companyProfile.id,
        imageUrl,
        sortOrder: index,
      })),
    });
  }

  return { user, companyProfile };
}

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 10);
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
      isDisabled: false,
    },
    create: {
      email: "admin@example.com",
      password: adminPasswordHash,
      role: Role.ADMIN,
      isDisabled: false,
    },
  });

  const companies = [
    {
      email: "test2@example.com",
      profile: {
        companyName: "NovaTech Studio",
        companyLogoUrl:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=400&q=80",
        companyShortDescription:
          "Product company building modern web platforms and internal business systems.",
        companyDescription:
          "NovaTech Studio develops modern digital products for businesses in Central Asia. We build internal dashboards, CRM systems, public websites, and scalable web applications. Our team works with React, TypeScript, Node.js, and PostgreSQL.",
        companyWebsite: "https://novatech.example.com",
        companyPhone: "+996700112233",
        companyCity: "Bishkek",
        companyCountry: "Kyrgyzstan",
      },
      photos: [
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      email: "test3@example.com",
      profile: {
        companyName: "FinAxis Group",
        companyLogoUrl:
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80",
        companyShortDescription:
          "Finance and operations company focused on reporting and support.",
        companyDescription:
          "FinAxis Group helps companies manage accounting, business reporting, support operations, and process control.",
        companyWebsite: "https://finaxis.example.com",
        companyPhone: "+996555446688",
        companyCity: "Bishkek",
        companyCountry: "Kyrgyzstan",
      },
      photos: [
        "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      email: "test4@example.com",
      profile: {
        companyName: "PeopleFirst Hub",
        companyLogoUrl:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80",
        companyShortDescription:
          "HR, education, and service brand focused on people and communication.",
        companyDescription:
          "PeopleFirst Hub works in recruitment, education, and hospitality-related hiring.",
        companyWebsite: "https://peoplefirst.example.com",
        companyPhone: "+77775544221",
        companyCity: "Almaty",
        companyCountry: "Kazakhstan",
      },
      photos: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      email: "test5@example.com",
      profile: {
        companyName: "MarketFlow Media",
        companyLogoUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
        companyShortDescription:
          "Creative marketing team focused on content, design, and audience growth.",
        companyDescription:
          "MarketFlow Media develops content strategies, social media campaigns, visuals, and brand communication.",
        companyWebsite: "https://marketflow.example.com",
        companyPhone: "+996705901212",
        companyCity: "Bishkek",
        companyCountry: "Kyrgyzstan",
      },
      photos: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const created = await upsertCompanyWithProfile({
      email: company.email,
      passwordHash,
      profile: company.profile,
      photos: company.photos,
    });
    createdCompanies.push(created);
  }

  const companyByEmail = new Map(
    createdCompanies.map((item) => [item.user.email, item.companyProfile])
  );

  const profile2 = companyByEmail.get("test2@example.com")!;
  const profile3 = companyByEmail.get("test3@example.com")!;
  const profile4 = companyByEmail.get("test4@example.com")!;
  const profile5 = companyByEmail.get("test5@example.com")!;

  await prisma.vacancy.deleteMany({
    where: {
      companyProfileId: {
        in: [profile2.id, profile3.id, profile4.id, profile5.id],
      },
    },
  });

  await prisma.vacancy.createMany({
    data: [
      {
        companyProfileId: profile2.id,
        title: "Frontend Developer (React)",
        description: "Build modern interfaces with React and TypeScript.",
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
        companyProfileId: profile2.id,
        title: "Backend Developer (Node.js)",
        description: "Build APIs and work with PostgreSQL and Docker.",
        salaryFrom: 1500,
        salaryTo: 2600,
        city: "Bishkek",
        category: "Backend",
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        experienceLevel: ExperienceLevel.MIDDLE,
        requiredSkills: ["Node.js", "Express", "PostgreSQL", "Docker"],
        status: VacancyStatus.APPROVED,
      },
      {
        companyProfileId: profile2.id,
        title: "UI/UX Designer",
        description: "Design dashboards, forms, and clean product interfaces.",
        salaryFrom: 1000,
        salaryTo: 1700,
        city: "Bishkek",
        category: "Design",
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        experienceLevel: ExperienceLevel.JUNIOR,
        requiredSkills: ["Figma", "UI", "UX", "Prototyping"],
        status: VacancyStatus.PENDING,
      },
      {
        companyProfileId: profile3.id,
        title: "Accountant",
        description: "Manage accounting records and prepare financial reports.",
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
        companyProfileId: profile3.id,
        title: "Customer Support Specialist",
        description: "Help clients and solve service-related issues.",
        salaryFrom: 600,
        salaryTo: 1000,
        city: "Osh",
        category: "Support",
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        experienceLevel: ExperienceLevel.JUNIOR,
        requiredSkills: ["Communication", "Support", "CRM"],
        status: VacancyStatus.APPROVED,
      },
      {
        companyProfileId: profile4.id,
        title: "HR Manager",
        description: "Coordinate recruiting and communication with candidates.",
        salaryFrom: 900,
        salaryTo: 1600,
        city: "Almaty",
        category: "HR",
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        experienceLevel: ExperienceLevel.MIDDLE,
        requiredSkills: ["Recruitment", "Interviewing", "Communication"],
        status: VacancyStatus.APPROVED,
      },
      {
        companyProfileId: profile4.id,
        title: "English Teacher",
        description: "Teach English to teenagers and adults.",
        salaryFrom: 500,
        salaryTo: 1100,
        city: "Bishkek",
        category: "Education",
        employmentType: EmploymentType.PART_TIME,
        workMode: WorkMode.ONSITE,
        experienceLevel: ExperienceLevel.MIDDLE,
        requiredSkills: ["English", "Teaching", "Lesson Planning"],
        status: VacancyStatus.APPROVED,
      },
      {
        companyProfileId: profile4.id,
        title: "Barista",
        description: "Prepare coffee and provide friendly customer service.",
        salaryFrom: 400,
        salaryTo: 700,
        city: "Bishkek",
        category: "Service",
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.ONSITE,
        experienceLevel: ExperienceLevel.INTERN,
        requiredSkills: ["Coffee", "Customer Service", "Teamwork"],
        status: VacancyStatus.PENDING,
      },
      {
        companyProfileId: profile5.id,
        title: "SMM Manager",
        description: "Create content plans and manage audience engagement.",
        salaryFrom: 700,
        salaryTo: 1300,
        city: "Bishkek",
        category: "Marketing",
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.REMOTE,
        experienceLevel: ExperienceLevel.JUNIOR,
        requiredSkills: ["SMM", "Content", "Copywriting", "Analytics"],
        status: VacancyStatus.APPROVED,
      },
      {
        companyProfileId: profile5.id,
        title: "Sales Manager",
        description: "Work with clients and help grow sales volume.",
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
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });