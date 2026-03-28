import { prisma } from "../../prisma";

async function getMyCompanyProfileOrThrow(userId: number) {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Company profile not found");
  }

  return profile;
}

export async function getCompanyProfileByUserId(userId: number) {
  return prisma.companyProfile.findUnique({
    where: { userId },
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
    },
  });
}

export async function updateCompanyProfileByUserId(userId: number, data: any) {
  return prisma.companyProfile.update({
    where: { userId },
    data: {
      companyName: data.companyName ?? "",
      companyLogoUrl: data.companyLogoUrl ?? null,
      companyShortDescription: data.companyShortDescription ?? null,
      companyDescription: data.companyDescription ?? null,
      companyWebsite: data.companyWebsite ?? null,
      companyPhone: data.companyPhone ?? null,
      companyCity: data.companyCity ?? null,
      companyCountry: data.companyCountry ?? null,
    },
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
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

export async function addPhoto(userId: number, imageUrl: string) {
  const profile = await getMyCompanyProfileOrThrow(userId);
  const trimmed = String(imageUrl || "").trim();

  if (!trimmed) {
    throw new Error("Ссылка на фото обязательна");
  }

  const count = await prisma.companyPhoto.count({
    where: { companyProfileId: profile.id },
  });

  if (count >= 5) {
    throw new Error("Максимум 5 фото");
  }

  return prisma.companyPhoto.create({
    data: {
      companyProfileId: profile.id,
      imageUrl: trimmed,
    },
  });
}

export async function getPhotos(userId: number) {
  const profile = await getMyCompanyProfileOrThrow(userId);

  return prisma.companyPhoto.findMany({
    where: { companyProfileId: profile.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function deletePhoto(userId: number, id: number) {
  const profile = await getMyCompanyProfileOrThrow(userId);

  return prisma.companyPhoto.deleteMany({
    where: {
      id,
      companyProfileId: profile.id,
    },
  });
}