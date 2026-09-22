import { Router, Response } from "express";
import { CreateExperimentSchema, UpdateExperimentSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const experimentsRouter = Router();

experimentsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = CreateExperimentSchema.parse(req.body);
    const experiment = await prisma.experiment.create({
      data: {
        userId: req.userId!,
        title: body.title,
        problem: body.problem,
        hypothesis: body.hypothesis,
        intervention: body.intervention,
        measurement: body.measurement,
        startDate: new Date(body.startDate + "T00:00:00.000Z"),
        endDate: body.endDate ? new Date(body.endDate + "T00:00:00.000Z") : null,
        status: body.status,
        result: body.result,
        lesson: body.lesson,
        nextAction: body.nextAction,
      },
    });
    return res.status(201).json({ experiment });
  } catch (err) {
    next(err);
  }
});

experimentsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status } = req.query;
    const where: any = { userId: req.userId! };
    if (typeof status === "string") {
      where.status = status;
    }
    const experiments = await prisma.experiment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        linkedEntries: { include: { entry: true } },
      },
    });

    experiments.forEach(exp => {
      exp.linkedEntries.sort((a, b) => {
        const d1 = a.entry.occurredOn.getTime();
        const d2 = b.entry.occurredOn.getTime();
        if (d1 !== d2) return d1 - d2;
        const t1 = a.entry.occurredAt?.getTime() || 0;
        const t2 = b.entry.occurredAt?.getTime() || 0;
        if (t1 !== t2) return t1 - t2;
        return a.entry.createdAt.getTime() - b.entry.createdAt.getTime();
      });
    });

    return res.json({ experiments });
  } catch (err) {
    next(err);
  }
});

experimentsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const experiment = await prisma.experiment.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        linkedEntries: { include: { entry: true } },
      },
    });
    if (!experiment) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Experiment not found" } });
    }
    
    experiment.linkedEntries.sort((a, b) => {
      const d1 = a.entry.occurredOn.getTime();
      const d2 = b.entry.occurredOn.getTime();
      if (d1 !== d2) return d1 - d2;
      const t1 = a.entry.occurredAt?.getTime() || 0;
      const t2 = b.entry.occurredAt?.getTime() || 0;
      if (t1 !== t2) return t1 - t2;
      return a.entry.createdAt.getTime() - b.entry.createdAt.getTime();
    });

    return res.json({ experiment });
  } catch (err) {
    next(err);
  }
});

experimentsRouter.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = UpdateExperimentSchema.parse(req.body);
    const existing = await prisma.experiment.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Experiment not found" } });
    }
    const data: any = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate + "T00:00:00.000Z");
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate + "T00:00:00.000Z") : null;

    const updated = await prisma.experiment.update({
      where: { id: existing.id },
      data,
    });
    return res.json({ experiment: updated });
  } catch (err) {
    next(err);
  }
});

experimentsRouter.post("/:id/link-entry", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { entryId } = req.body;
    const experiment = await prisma.experiment.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!experiment) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Experiment not found" } });

    const entry = await prisma.reflectionEntry.findFirst({ where: { id: entryId, userId: req.userId! } });
    if (!entry) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Reflection entry not found" } });

    await prisma.experimentEntryLink.upsert({
      where: { experimentId_entryId: { experimentId: experiment.id, entryId: entry.id } },
      update: {},
      create: { experimentId: experiment.id, entryId: entry.id },
    });

    return res.json({ message: "Linked successfully" });
  } catch (err) {
    next(err);
  }
});

experimentsRouter.delete("/:id/entries/:entryId", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const experiment = await prisma.experiment.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!experiment) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Experiment not found" } });

    const entry = await prisma.reflectionEntry.findFirst({
      where: { id: req.params.entryId, userId: req.userId! },
    });
    if (!entry) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Reflection entry not found" } });

    await prisma.experimentEntryLink.delete({
      where: { experimentId_entryId: { experimentId: experiment.id, entryId: entry.id } },
    });

    return res.json({ message: "Unlinked successfully" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: { code: "NOT_FOUND", message: "Link not found" } });
    next(err);
  }
});

experimentsRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const existing = await prisma.experiment.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Experiment not found" } });
    }
    
    await prisma.experiment.delete({
      where: { id: existing.id }
    });

    return res.json({ message: "Experiment deleted successfully" });
  } catch (err) {
    next(err);
  }
});
