import {
  PrismaClient,
  Role,
  VacancyStatus,
  ExperienceLevel,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 Seeding...");

  await prisma.$transaction([
    prisma.application.deleteMany(),
    prisma.savedJob.deleteMany(),
    prisma.vacancy.deleteMany(),
    prisma.companyPhoto.deleteMany(),
    prisma.companyProfile.deleteMany(),
    prisma.resume.deleteMany(),
    prisma.seekerPhoto.deleteMany(),
    prisma.jobSeekerProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ===== USERS =====
  const users = [];

  for (let i = 1; i <= 5; i++) {
    users.push(
      await prisma.user.create({
        data: {
          email: `company${i}@test.com`,
          password: await hash("123456"),
          role: Role.COMPANY,
        },
      })
    );

    users.push(
      await prisma.user.create({
        data: {
          email: `user${i}@test.com`,
          password: await hash("123456"),
          role: Role.USER,
        },
      })
    );
  }

  // ===== DATA =====

  const companyNames = [
    "TechNova Solutions",
    "GreenFarm Market",
    "EduSmart Academy",
    "LogiTrans Group",
    "Creative Media Hub",
  ];

  const companyImages = [
    "https://uradres.rent/_mod_files/ce_images/articles/chastnaya-kompaniya-vidy-osobennosti.jpg",
    "https://catalog-cdn.detmir.st/media/Bqc07nIzj92_Alt3LslI50B56dldsdnm2PCjBFVIvxI=.webp?preset=site_product_gallery_r1500",
    "https://habrastorage.org/getpro/habr/upload_files/741/73b/ac4/74173bac4ae562f46fd359b5ac2d2c43.jpg",
    "https://avatars.mds.yandex.net/get-kinopoisk-post-img/1345014/1bc8f15fed404d47a278a68df0986ea6/960x540",
    "https://img.freepik.com/free-photo/empty-room-with-chairs-desks_23-2149008873.jpg",
  ];

  const people = [
    { firstName: "Алина", lastName: "Ибраимова" },
    { firstName: "Данияр", lastName: "Султанов" },
    { firstName: "Айбек", lastName: "Касымов" },
    { firstName: "Нуриза", lastName: "Абдыкадырова" },
    { firstName: "Тимур", lastName: "Жолдошев" },
  ];

  const seekerImages = [
    "/uploads/seeker-photos/1775651203683-40b793cef9ce95d6.png",
    "/uploads/seeker-photos/1775651203861-efd6f4bb8c8b6c8f.png",
    "/uploads/seeker-photos/1775651203987-56b7cae34aa476bd.jpg",
    "/uploads/seeker-photos/1775651203995-d1509e9ce49c9439.jpg",
    "/uploads/seeker-photos/1775651203995-d1509e9ce49c9439.jpg",
  ];

  // ===== COMPANIES =====

  const companies = [];

  for (let i = 0; i < 5; i++) {
    const company = await prisma.companyProfile.create({
      data: {
        userId: users[i * 2].id,
        companyName: companyNames[i],
        companyLogoUrl: companyImages[i],
        companyCity: "Бишкек",
        companyCountry: "Кыргызстан",
        companyDescription: `${companyNames[i]} — современная компания, ориентированная на развитие сотрудников и качество продукта. Мы создаём комфортные условия труда и ценим инициативу.`,

        photos: {
          create: [
            { imageUrl: companyImages[i], sortOrder: 0 },
            { imageUrl: companyImages[i], sortOrder: 1 },
            { imageUrl: companyImages[i], sortOrder: 2 },
          ],
        },
      },
    });

    companies.push(company);
  }

  // ===== SEEKERS =====

  const seekers = [];

  for (let i = 0; i < 5; i++) {
    const p = people[i];

    const seeker = await prisma.jobSeekerProfile.create({
      data: {
        userId: users[i * 2 + 1].id,
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: seekerImages[i],
        location: "Бишкек",
        headline: "Специалист с опытом",
        summary: `Меня зовут ${p.firstName}. Я ответственный и мотивированный специалист, стремлюсь к профессиональному росту и развитию.`,

        experienceLevel:
          [ExperienceLevel.JUNIOR, ExperienceLevel.MIDDLE, ExperienceLevel.SENIOR][
            i % 3
          ],

        photos: {
          create: [
            {
              fileName: "img.jpg",
              mimeType: "image/jpeg",
              storagePath: seekerImages[i],
              sizeBytes: 1000,
              sortOrder: 0,
            },
            {
              fileName: "img.jpg",
              mimeType: "image/jpeg",
              storagePath: seekerImages[i],
              sizeBytes: 1000,
              sortOrder: 1,
            },
            {
              fileName: "img.jpg",
              mimeType: "image/jpeg",
              storagePath: seekerImages[i],
              sizeBytes: 1000,
              sortOrder: 2,
            },
          ],
        },
      },
    });

    seekers.push(seeker);
  }

  // ===== VACANCIES =====

  const vacanciesBase = [
    {
      title: "Frontend разработчик (React)",
      skills: ["React", "TypeScript", "CSS"],
      category: "IT",
    },
    {
      title: "Маркетолог",
      skills: ["SMM", "SEO", "Контент"],
      category: "Маркетинг",
    },
    {
      title: "Продавец-консультант",
      skills: ["Продажи", "Коммуникация"],
      category: "Ритейл",
    },
    {
      title: "Водитель-экспедитор",
      skills: ["Вождение", "Логистика"],
      category: "Логистика",
    },
    {
      title: "Преподаватель английского",
      skills: ["English", "Teaching"],
      category: "Образование",
    },
    {
      title: "UI/UX дизайнер",
      skills: ["Figma", "UX/UI"],
      category: "Дизайн",
    },
  ];

  for (let i = 0; i < 15; i++) {
    const base = vacanciesBase[i % vacanciesBase.length];

    await prisma.vacancy.create({
      data: {
        title: base.title,
        description: `Компания ищет специалиста на позицию "${base.title}". Обязанности включают выполнение задач, работу в команде и развитие профессиональных навыков.`,
        salaryFrom: 400 + i * 50,
        salaryTo: 800 + i * 100,
        city: "Бишкек",
        category: base.category,
        requiredSkills: base.skills,
        status: VacancyStatus.APPROVED,
        companyProfileId: companies[i % 5].id,
      },
    });
  }

  // ===== RESUMES =====

  for (let i = 0; i < 7; i++) {
    await prisma.resume.create({
      data: {
        seekerProfileId: seekers[i % 5].id,
        title: `Резюме ${i + 1}`,
        desiredPosition: "Специалист",
        salaryExpectation: 800,
        experienceLevel: ExperienceLevel.JUNIOR,
        skills: ["Коммуникация", "Ответственность"],
        isPublic: true,

        resumeFile: {
          create: {
            fileName: "1776085125999-78827982-cv-template-01.jpg",
            mimeType: "image/jpeg",
            storagePath:
              "/uploads/1776085125999-78827982-cv-template-01.jpg",
            sizeBytes: 10000,
          },
        },
      },
    });
  }

  console.log("✅ Seed completed");
}

main().finally(() => prisma.$disconnect());