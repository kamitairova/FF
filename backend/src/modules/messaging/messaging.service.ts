import { CandidateStage, Prisma, Role } from "@prisma/client";
import { prisma } from "../../prisma";

type Actor = {
  userId: number;
  role: Role;
};

function httpError(status: number, message: string) {
  const err = new Error(message) as Error & { status?: number };
  err.status = status;
  return err;
}

function actorThreadWhere(actor: Actor): Prisma.ThreadWhereInput {
  return {
    OR: [
      { seekerProfile: { userId: actor.userId } },
      { companyProfile: { userId: actor.userId } },
    ],
  };
}

const threadListInclude: Prisma.ThreadInclude = {
  seekerProfile: {
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      headline: true,
      location: true,
    },
  },
  companyProfile: {
    select: {
      id: true,
      userId: true,
      companyName: true,
      companyCity: true,
      companyCountry: true,
      companyLogoUrl: true,
    },
  },
  vacancy: {
    select: {
      id: true,
      title: true,
    },
  },
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
    include: {
      senderUser: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  },
};

const threadDetailInclude: Prisma.ThreadInclude = {
  seekerProfile: {
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      headline: true,
      location: true,
    },
  },
  companyProfile: {
    select: {
      id: true,
      userId: true,
      companyName: true,
      companyCity: true,
      companyCountry: true,
      companyLogoUrl: true,
    },
  },
  vacancy: {
    select: {
      id: true,
      title: true,
    },
  },
  messages: {
    orderBy: { createdAt: "asc" },
    include: {
      senderUser: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  },
};

type ThreadAccessRecord = Prisma.ThreadGetPayload<{
  include: {
    seekerProfile: {
      select: {
        id: true;
        userId: true;
        firstName: true;
        lastName: true;
        headline: true;
        location: true;
      };
    };
    companyProfile: {
      select: {
        id: true;
        userId: true;
        companyName: true;
        companyCity: true;
        companyCountry: true;
        companyLogoUrl: true;
      };
    };
    vacancy: {
      select: {
        id: true;
        title: true;
      };
    };
  };
}>;

async function getThreadAccessRecord(threadId: number) {
  return prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      seekerProfile: {
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          headline: true,
          location: true,
        },
      },
      companyProfile: {
        select: {
          id: true,
          userId: true,
          companyName: true,
          companyCity: true,
          companyCountry: true,
          companyLogoUrl: true,
        },
      },
      vacancy: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

async function assertVisibleThreadForActor(actor: Actor, threadId: number) {
  const thread = await prisma.thread.findFirst({
    where: {
      id: threadId,
      ...actorThreadWhere(actor),
    },
    include: {
      seekerProfile: {
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          headline: true,
          location: true,
        },
      },
      companyProfile: {
        select: {
          id: true,
          userId: true,
          companyName: true,
          companyCity: true,
          companyCountry: true,
          companyLogoUrl: true,
        },
      },
      vacancy: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!thread) {
    throw httpError(404, "Чат не найден");
  }

  const hidden = await prisma.threadParticipantHidden.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId: actor.userId,
      },
    },
  });

  if (hidden) {
    throw httpError(404, "Чат не найден");
  }

  return thread;
}

function getParticipantUserIds(thread: ThreadAccessRecord) {
  return [thread.seekerProfile.userId, thread.companyProfile.userId];
}

function getOtherParticipantIds(thread: ThreadAccessRecord, actorUserId: number) {
  return getParticipantUserIds(thread).filter((id) => id !== actorUserId);
}

async function unhideForUser(threadId: number, userId: number) {
  await prisma.threadParticipantHidden.deleteMany({
    where: {
      threadId,
      userId,
    },
  });
}

async function unhideForOtherSide(thread: ThreadAccessRecord, actorUserId: number) {
  const otherIds = getOtherParticipantIds(thread, actorUserId);
  if (!otherIds.length) return;

  await prisma.threadParticipantHidden.deleteMany({
    where: {
      threadId: thread.id,
      userId: { in: otherIds },
    },
  });
}

async function findOrCreateThread(data: {
  seekerProfileId: number;
  companyProfileId: number;
  vacancyId: number;
  createdByUserId: number;
  companyEngagedAt?: Date | null;
  candidateStage?: CandidateStage | null;
}) {
  const existing = await prisma.thread.findUnique({
    where: {
      seekerProfileId_companyProfileId_vacancyId: {
        seekerProfileId: data.seekerProfileId,
        companyProfileId: data.companyProfileId,
        vacancyId: data.vacancyId,
      },
    },
  });

  if (existing) {
    return { threadId: existing.id, created: false };
  }

  const created = await prisma.thread.create({
    data,
  });

  return { threadId: created.id, created: true };
}

export async function createApplicationThread(params: {
  actor: Actor;
  vacancyId: number;
}) {
  const { actor, vacancyId } = params;

  if (actor.role !== "USER") {
    throw httpError(403, "Только соискатель может откликаться на вакансию");
  }

  const seeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId: actor.userId },
  });

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
  });

  if (!seeker) {
    throw httpError(404, "Профиль соискателя не найден");
  }

  if (!vacancy) {
    throw httpError(404, "Вакансия не найдена");
  }

  const { threadId, created } = await findOrCreateThread({
    seekerProfileId: seeker.id,
    companyProfileId: vacancy.companyProfileId,
    vacancyId,
    createdByUserId: actor.userId,
  });

  await unhideForUser(threadId, actor.userId);

  if (created) {
    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          threadId,
          senderUserId: actor.userId,
          body: `Здравствуйте! Я откликаюсь на вакансию «${vacancy.title}».`,
        },
      });

      await tx.thread.update({
        where: { id: threadId },
        data: {
          updatedAt: new Date(),
        },
      });
    });
  }

  return { id: threadId };
}

export async function createInvitationThread(params: {
  actor: Actor;
  seekerProfileId: number;
  vacancyId: number;
}) {
  const { actor, seekerProfileId, vacancyId } = params;

  if (actor.role !== "COMPANY") {
    throw httpError(403, "Только компания может приглашать кандидатов");
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: actor.userId },
  });

  const seeker = await prisma.jobSeekerProfile.findUnique({
    where: { id: seekerProfileId },
  });

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
  });

  if (!company) {
    throw httpError(404, "Профиль компании не найден");
  }

  if (!seeker) {
    throw httpError(404, "Профиль соискателя не найден");
  }

  if (!vacancy) {
    throw httpError(404, "Вакансия не найдена");
  }

  if (vacancy.companyProfileId !== company.id) {
    throw httpError(403, "Нельзя приглашать кандидата в чужую вакансию");
  }

  const { threadId, created } = await findOrCreateThread({
    seekerProfileId,
    companyProfileId: company.id,
    vacancyId,
    createdByUserId: actor.userId,
    companyEngagedAt: new Date(),
    candidateStage: CandidateStage.UNDER_REVIEW,
  });

  await unhideForUser(threadId, actor.userId);

  const access = await getThreadAccessRecord(threadId);
  if (!access) {
    throw httpError(404, "Чат не найден");
  }

  const shouldSendInviteMessage = created || !access.companyEngagedAt;

  if (shouldSendInviteMessage) {
    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          threadId,
          senderUserId: actor.userId,
          body: `Здравствуйте! Приглашаем вас обсудить вакансию «${vacancy.title}».`,
        },
      });

      await tx.thread.update({
        where: { id: threadId },
        data: {
          companyEngagedAt: new Date(),
          candidateStage: access.candidateStage ?? CandidateStage.UNDER_REVIEW,
          updatedAt: new Date(),
        },
      });

      const otherIds = getOtherParticipantIds(access, actor.userId);
      if (otherIds.length) {
        await tx.threadParticipantHidden.deleteMany({
          where: {
            threadId,
            userId: { in: otherIds },
          },
        });
      }
    });
  }

  return { id: threadId };
}

export async function sendMessage(params: {
  actor: Actor;
  threadId: number;
  body: string;
}) {
  const { actor, threadId, body } = params;

  const thread = await assertVisibleThreadForActor(actor, threadId);

  const participantIds = getParticipantUserIds(thread);
  if (!participantIds.includes(actor.userId)) {
    throw httpError(403, "Нет доступа к этому чату");
  }

  const messageText = body.trim();
  if (!messageText) {
    throw httpError(400, "Сообщение не должно быть пустым");
  }

  return prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        threadId,
        senderUserId: actor.userId,
        body: messageText,
      },
    });

    const updateData: Prisma.ThreadUpdateInput = {
      updatedAt: new Date(),
    };

    if (actor.role === "COMPANY" && !thread.companyEngagedAt) {
      updateData.companyEngagedAt = new Date();
      updateData.candidateStage = thread.candidateStage ?? CandidateStage.UNDER_REVIEW;
    }

    await tx.thread.update({
      where: { id: threadId },
      data: updateData,
    });

    const otherIds = getOtherParticipantIds(thread, actor.userId);
    if (otherIds.length) {
      await tx.threadParticipantHidden.deleteMany({
        where: {
          threadId,
          userId: { in: otherIds },
        },
      });
    }

    return msg;
  });
}

async function filterHiddenThreadsForActor(actor: Actor, threadIds: number[]) {
  if (!threadIds.length) return new Set<number>();

  const hiddenRows = await prisma.threadParticipantHidden.findMany({
    where: {
      userId: actor.userId,
      threadId: { in: threadIds },
    },
    select: {
      threadId: true,
    },
  });

  return new Set(hiddenRows.map((row) => row.threadId));
}

export async function listThreads(actor: Actor) {
  const rows = await prisma.thread.findMany({
    where: actorThreadWhere(actor),
    include: threadListInclude,
    orderBy: { updatedAt: "desc" },
  });

  const hiddenIds = await filterHiddenThreadsForActor(
    actor,
    rows.map((row) => row.id)
  );

  return rows.filter((row) => !hiddenIds.has(row.id));
}

export async function listSeekerApplications(actor: Actor) {
  if (actor.role !== "USER") {
    throw httpError(403, "Только соискатель может смотреть отклики");
  }

  const rows = await prisma.thread.findMany({
    where: {
      seekerProfile: { userId: actor.userId },
      companyEngagedAt: { not: null },
    },
    include: threadListInclude,
    orderBy: { updatedAt: "desc" },
  });

  const hiddenIds = await filterHiddenThreadsForActor(
    actor,
    rows.map((row) => row.id)
  );

  return rows.filter((row) => !hiddenIds.has(row.id));
}

export async function getThreadById(actor: Actor, threadId: number) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      seekerProfile: true,
      companyProfile: true,
      vacancy: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  console.log("[messaging] thread by id without access filter", {
    actor,
    threadId,
    found: !!thread,
    seekerUserId: thread?.seekerProfile?.userId,
    companyUserId: thread?.companyProfile?.userId,
  });

  if (!thread) {
    throw Object.assign(new Error("Чат физически не существует"), { status: 404 });
  }

  const allowed =
    thread.seekerProfile?.userId === actor.userId ||
    thread.companyProfile?.userId === actor.userId;

  if (!allowed) {
    throw Object.assign(new Error("Нет доступа к этому чату"), { status: 403 });
  }

  return thread;
}

export async function hideThreadForMe(actor: Actor, threadId: number) {
  const thread = await prisma.thread.findFirst({
    where: {
      id: threadId,
      ...actorThreadWhere(actor),
    },
    include: {
      seekerProfile: {
        select: {
          userId: true,
        },
      },
      companyProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!thread) {
    throw httpError(404, "Чат не найден");
  }

  await prisma.threadParticipantHidden.upsert({
    where: {
      threadId_userId: {
        threadId,
        userId: actor.userId,
      },
    },
    update: {},
    create: {
      threadId,
      userId: actor.userId,
    },
  });

  const participantIds = [thread.seekerProfile.userId, thread.companyProfile.userId];

  const hiddenCount = await prisma.threadParticipantHidden.count({
    where: {
      threadId,
      userId: { in: participantIds },
    },
  });

  if (hiddenCount >= participantIds.length) {
    await prisma.$transaction(async (tx) => {
      await tx.threadParticipantHidden.deleteMany({
        where: { threadId },
      });

      await tx.message.deleteMany({
        where: { threadId },
      });

      await tx.thread.delete({
        where: { id: threadId },
      });
    });
  }

  return { ok: true };
}

export async function listCompanyCandidates(actor: Actor) {
  if (actor.role !== "COMPANY") {
    throw httpError(403, "Только компания может смотреть кандидатов");
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: actor.userId },
  });

  if (!company) {
    throw httpError(404, "Профиль компании не найден");
  }

  const rows = await prisma.thread.findMany({
    where: {
      companyProfileId: company.id,
      companyEngagedAt: { not: null },
    },
    include: threadListInclude,
    orderBy: { updatedAt: "desc" },
  });

  const hiddenIds = await filterHiddenThreadsForActor(
    actor,
    rows.map((row) => row.id)
  );

  return rows.filter((row) => !hiddenIds.has(row.id));
}

export async function updateCandidateStage(params: {
  actor: Actor;
  threadId: number;
  stage: CandidateStage;
}) {
  const company = await prisma.companyProfile.findUnique({
    where: { userId: params.actor.userId },
  });

  if (!company) {
    throw httpError(404, "Профиль компании не найден");
  }

  const thread = await prisma.thread.findFirst({
    where: {
      id: params.threadId,
      companyProfileId: company.id,
      companyEngagedAt: { not: null },
    },
  });

  if (!thread) {
    throw httpError(404, "Кандидатский чат не найден");
  }

  return prisma.thread.update({
    where: { id: params.threadId },
    data: {
      candidateStage: params.stage,
      updatedAt: new Date(),
    },
  });
}