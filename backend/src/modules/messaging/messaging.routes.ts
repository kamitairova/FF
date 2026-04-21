import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  createApplicationThread,
  createInvitationThread,
  listThreads,
  listSeekerApplications,
  getThreadById,
  sendMessage,
  listCompanyCandidates,
  updateCandidateStage,
  hideThreadForMe,
} from "./messaging.service";

export const messagingRouter = Router();

function sendError(res: any, e: any, fallback = "Unexpected error") {
  const status = Number(e?.status) || 500;
  res.status(status).json({
    message: e?.message ?? fallback,
  });
}

messagingRouter.post("/apply", requireAuth, async (req, res) => {
  try {
    const data = await createApplicationThread({
      actor: req.user!,
      vacancyId: Number(req.body.vacancyId),
    });
    res.json(data);
  } catch (e: any) {
    sendError(res, e, "Не удалось создать чат отклика");
  }
});

messagingRouter.post("/invite", requireAuth, async (req, res) => {
  try {
    const data = await createInvitationThread({
      actor: req.user!,
      seekerProfileId: Number(req.body.seekerProfileId),
      vacancyId: Number(req.body.vacancyId),
    });
    res.json(data);
  } catch (e: any) {
    sendError(res, e, "Не удалось создать чат приглашения");
  }
});

messagingRouter.get("/threads", requireAuth, async (req, res) => {
  try {
    res.json(await listThreads(req.user!));
  } catch (e: any) {
    sendError(res, e, "Не удалось загрузить чаты");
  }
});

messagingRouter.get("/seeker/applications", requireAuth, async (req, res) => {
  try {
    res.json(await listSeekerApplications(req.user!));
  } catch (e: any) {
    sendError(res, e, "Не удалось загрузить отклики");
  }
});

messagingRouter.get("/threads/:id", requireAuth, async (req, res) => {
  try {
    const threadId = Number(req.params.id);

    console.log("[messaging] get thread request", {
      actor: req.user,
      threadId,
    });

    const data = await getThreadById(req.user!, threadId);
    res.json(data);
  } catch (e: any) {
    console.error("[messaging] getThreadById failed:", e);

    res.status(Number(e?.status) || 500).json({
      message: e?.message ?? "Thread load failed",
    });
  }
});

messagingRouter.post("/threads/:id/messages", requireAuth, async (req, res) => {
  try {
    const data = await sendMessage({
      actor: req.user!,
      threadId: Number(req.params.id),
      body: String(req.body.body ?? ""),
    });
    res.json(data);
  } catch (e: any) {
    sendError(res, e, "Не удалось отправить сообщение");
  }
});

messagingRouter.delete("/threads/:id/for-me", requireAuth, async (req, res) => {
  try {
    await hideThreadForMe(req.user!, Number(req.params.id));
    res.json({ ok: true });
  } catch (e: any) {
    sendError(res, e, "Не удалось скрыть чат");
  }
});

messagingRouter.get("/company/candidates", requireAuth, async (req, res) => {
  try {
    res.json(await listCompanyCandidates(req.user!));
  } catch (e: any) {
    sendError(res, e, "Не удалось загрузить кандидатов");
  }
});

messagingRouter.patch("/company/candidates/:id/stage", requireAuth, async (req, res) => {
  try {
    const data = await updateCandidateStage({
      actor: req.user!,
      threadId: Number(req.params.id),
      stage: req.body.stage,
    });
    res.json(data);
  } catch (e: any) {
    sendError(res, e, "Не удалось обновить статус кандидата");
  }
});