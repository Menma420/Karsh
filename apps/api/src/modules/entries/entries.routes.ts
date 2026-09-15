import { Router, Response } from "express";
import { CreateEntrySchema, UpdateEntrySchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";
import { validateOccurredOn } from "../../lib/date";

export const entriesRouter = Router();

// POST /reflection-entries
entriesRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = CreateEntrySchema.parse(req.body);

    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.userId! },
    });

    const timezone = settings?.timezone || "Asia/Kolkata";
    const backfillDays = settings?.backfillDays ?? 7;

    const validation = validateOccurredOn(body.occurredOn, timezone, backfillDays);
    if (!validation.valid) {
      return res.status(422).json({
        error: {
          code: "INVALID_OCCURRED_ON",
          message: validation.reason,
        },
      });
    }

    const { tags, occurredOn, occurredAt, ...entryFields } = body;

    const entry = await prisma.reflectionEntry.create({
      data: {
        userId: req.userId!,
        occurredOn: new Date(occurredOn + "T00:00:00.000Z"),
        occurredAt: occurredAt ? new Date(occurredAt) : null,
        ...entryFields,
        ...(tags && tags.length > 0
          ? {
              tags: {
                create: await Promise.all(
                  tags.map(async (tagName) => {
                    const tag = await prisma.tag.upsert({
                      where: { userId_name: { userId: req.userId!, name: tagName } },
                      update: {},
                      create: { userId: req.userId!, name: tagName },
                    });
                    return { tagId: tag.id };
                  })
                ),
              },
            }
          : {}),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
});

// GET /reflection-entries
entriesRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { from, to } = req.query;

    const where: any = { userId: req.userId! };

    if (from || to) {
      where.occurredOn = {};
      if (typeof from === "string") {
        where.occurredOn.gte = new Date(from + "T00:00:00.000Z");
      }
      if (typeof to === "string") {
        where.occurredOn.lte = new Date(to + "T23:59:59.999Z");
      }
    }

    const entries = await prisma.reflectionEntry.findMany({
      where,
      orderBy: [
        { occurredOn: "asc" },
        { occurredAt: "asc" },
      ],
      include: {
        tags: { include: { tag: true } },
        experimentLinks: { include: { experiment: true } },
      },
    });

    return res.json({ entries });
  } catch (err) {
    next(err);
  }
});

// GET /reflection-entries/:id
entriesRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const entry = await prisma.reflectionEntry.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        tags: { include: { tag: true } },
        experimentLinks: { include: { experiment: true } },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Reflection entry not found" } });
    }

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// PATCH /reflection-entries/:id (Does NOT re-validate backfill window, does NOT alter occurredOn)
entriesRouter.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const existing = await prisma.reflectionEntry.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Reflection entry not found" } });
    }

    const body = UpdateEntrySchema.parse(req.body);
    const { tags, occurredAt, ...updateFields } = body;

    const data: any = { ...updateFields };
    if (occurredAt !== undefined) {
      data.occurredAt = occurredAt ? new Date(occurredAt) : null;
    }

    if (tags) {
      await prisma.entryTag.deleteMany({ where: { entryId: existing.id } });
      data.tags = {
        create: await Promise.all(
          tags.map(async (tagName) => {
            const tag = await prisma.tag.upsert({
              where: { userId_name: { userId: req.userId!, name: tagName } },
              update: {},
              create: { userId: req.userId!, name: tagName },
            });
            return { tagId: tag.id };
          })
        ),
      };
    }

    const updated = await prisma.reflectionEntry.update({
      where: { id: existing.id },
      data,
      include: {
        tags: { include: { tag: true } },
        experimentLinks: { include: { experiment: true } },
      },
    });

    return res.json({ entry: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /reflection-entries/:id
entriesRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const existing = await prisma.reflectionEntry.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Reflection entry not found" } });
    }

    await prisma.reflectionEntry.delete({ where: { id: existing.id } });

    return res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    next(err);
  }
});
