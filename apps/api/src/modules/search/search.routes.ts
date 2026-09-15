import { Router, Response } from "express";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const searchRouter = Router();

searchRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.json({ results: { entries: [], experiments: [], decisions: [], learningRecords: [] } });
    }

    const q = query.trim();

    const [entries, experiments, decisions, learningRecords] = await Promise.all([
      prisma.reflectionEntry.findMany({
        where: {
          userId: req.userId!,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { intent: { contains: q, mode: "insensitive" } },
            { outcome: { contains: q, mode: "insensitive" } },
            { learned: { contains: q, mode: "insensitive" } },
            { notes: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { occurredOn: "desc" },
        take: 20,
      }),

      prisma.experiment.findMany({
        where: {
          userId: req.userId!,
          OR: [
            { problem: { contains: q, mode: "insensitive" } },
            { hypothesis: { contains: q, mode: "insensitive" } },
            { intervention: { contains: q, mode: "insensitive" } },
            { result: { contains: q, mode: "insensitive" } },
            { lesson: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),

      prisma.decision.findMany({
        where: {
          userId: req.userId!,
          OR: [
            { decision: { contains: q, mode: "insensitive" } },
            { context: { contains: q, mode: "insensitive" } },
            { reasoning: { contains: q, mode: "insensitive" } },
            { lesson: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { date: "desc" },
        take: 20,
      }),

      prisma.learningRecord.findMany({
        where: {
          userId: req.userId!,
          OR: [
            { topic: { contains: q, mode: "insensitive" } },
            { whatLearned: { contains: q, mode: "insensitive" } },
            { explanation: { contains: q, mode: "insensitive" } },
            { application: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { date: "desc" },
        take: 20,
      }),
    ]);

    return res.json({
      results: {
        entries,
        experiments,
        decisions,
        learningRecords,
      },
    });
  } catch (err) {
    next(err);
  }
});
