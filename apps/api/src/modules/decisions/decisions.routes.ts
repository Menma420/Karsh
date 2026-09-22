import { Router, Response } from "express";
import { CreateDecisionSchema, UpdateDecisionSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const decisionsRouter = Router();

decisionsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = CreateDecisionSchema.parse(req.body);
    const decision = await prisma.decision.create({
      data: {
        userId: req.userId!,
        date: new Date(body.date + "T00:00:00.000Z"),
        title: body.title,
        decision: body.decision,
        context: body.context,
        options: body.options ? body.options : undefined,
        chosenOption: body.chosenOption,
        reasoning: body.reasoning,
        assumptions: body.assumptions,
        expectedOutcome: body.expectedOutcome,
        confidence: body.confidence,
        actualOutcome: body.actualOutcome,
        lesson: body.lesson,
      },
    });
    return res.status(201).json({ decision });
  } catch (err) {
    next(err);
  }
});

decisionsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { from, to } = req.query;
    const where: any = { userId: req.userId! };
    if (from || to) {
      where.date = {};
      if (typeof from === "string") where.date.gte = new Date(from + "T00:00:00.000Z");
      if (typeof to === "string") where.date.lte = new Date(to + "T23:59:59.999Z");
    }
    const decisions = await prisma.decision.findMany({
      where,
      orderBy: { date: "desc" },
    });
    return res.json({ decisions });
  } catch (err) {
    next(err);
  }
});

decisionsRouter.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = UpdateDecisionSchema.parse(req.body);
    const existing = await prisma.decision.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Decision record not found" } });

    const data: any = { ...body };
    if (body.date) data.date = new Date(body.date + "T00:00:00.000Z");

    const updated = await prisma.decision.update({
      where: { id: existing.id },
      data,
    });
    return res.json({ decision: updated });
  } catch (err) {
    next(err);
  }
});

decisionsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const decision = await prisma.decision.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!decision) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Decision record not found" } });
    return res.json({ decision });
  } catch (err) {
    next(err);
  }
});

decisionsRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const existing = await prisma.decision.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Decision record not found" } });

    await prisma.decision.delete({ where: { id: existing.id } });
    return res.json({ message: "Decision deleted successfully" });
  } catch (err) {
    next(err);
  }
});

