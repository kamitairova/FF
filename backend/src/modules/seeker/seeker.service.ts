import { prisma } from "../../prisma";

export const SeekerService = {
  async getProfile(userId: number) {
    let profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      include: { resume: true, resumeFile: true }
    });

    if (!profile) {
      profile = await prisma.jobSeekerProfile.create({
        data: {
          userId,
          fullName: "Новый соискатель",
        },
        include: { resume: true, resumeFile: true }
      });
    }
    return profile;
  },

  async updateProfile(userId: number, data: any) {
    return prisma.jobSeekerProfile.update({
      where: { userId },
      data: {
        fullName: data.fullName,
        location: data.location,
        headline: data.headline,
        summary: data.summary,
        skills: data.skills,
        experienceLevel: data.experienceLevel,
        avatarUrl: data.avatarUrl
      }
    });
  },

  async updateResume(seekerProfileId: number, content: any) {
    return prisma.resume.upsert({
      where: { seekerProfileId },
      update: { content },
      create: {
        seekerProfileId,
        content
      }
    });
  }
};