  import express from "express";
  import cors from "cors";
  import { prisma } from "./prisma";
  import { authRouter } from "./modules/auth/auth.routes";
  import { errorHandler } from "./middlewares/error";
  import { jobsRouter } from "./modules/jobs/jobs.routes";
  import { adminRouter } from "./modules/admin/admin.routes";
  import { companyRouter } from "./modules/company/company.routes";
  import { companiesRouter } from "./modules/companies/companies.routes";
  import { seekerProfileRouter } from "./modules/seeker/seeker-profile.routes";
  import { seekerPhotosRouter } from "./modules/seeker-photo/seeker-photos.routes";
  import { resumesRouter } from "./modules/resumes/resumes.routes";
  import { publicSeekersRouter } from "./modules/public-seekers/public-seekers.routes";
  import path from "path"

// ... после остальных роутов


  const app = express();
  const PORT = Number(process.env.PORT) || 5000;


  // app.use(cors({
  //   origin: true, 
  //   credentials: true
  // }));

  app.use(cors({
    origin: 'http://localhost:5173', // разрешаем только фронтенд
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);

  app.use("/api/jobs", jobsRouter);

  app.use("/api/company", companyRouter);

  app.use("/api/companies", companiesRouter);

  app.use("/api/seeker", seekerProfileRouter);
  app.use("/api/seeker", seekerPhotosRouter);
  app.use("/api/seeker", resumesRouter);
  app.use("/api", publicSeekersRouter);

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


  app.use("/api/admin", adminRouter);

  app.get("/api/db-check", async (_req, res) => {
    const result = await prisma.user.findMany();
    res.json({ ok: true, usersCount: result.length });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });