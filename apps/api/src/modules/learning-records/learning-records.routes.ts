import { Router, Response } from "express";
import { CreateLearningRecordSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const learningRecordsRouter = Router();

learningRecordsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = CreateLearningRecordSchema.parse(req.body);
    const record = await prisma.learningRecord.create({
      data: {
        userId: req.userId!,
        date: new Date(body.date + "T00:00:00.000Z"),
        topic: body.topic,
        source: body.source,
        whatLearned: body.whatLearned,
        explanation: body.explanation,
        application: body.application,
        unresolvedQuestions: body.unresolvedQuestions,
      },
    });
    return res.status(201).json({ learningRecord: record });
  } catch (err) {
    next(err);
  }
});

learningRecordsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { from, to } = req.query;
    const where: any = { userId: req.userId! };
    if (from || to) {
      where.date = {};
      if (typeof from === "string") where.date.gte = new Date(from + "T00:00:00.000Z");
      if (typeof to === "string") where.date.lte = new Date(to + "T23:59:59.999Z");
    }
    const records = await prisma.learningRecord.findMany({
      where,
      orderBy: { date: "desc" },
    });
    return res.json({ learningRecords: records });
  } catch (err) {
    next(err);
  }
});
