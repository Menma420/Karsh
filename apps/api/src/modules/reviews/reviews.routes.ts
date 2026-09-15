import { Router, Response } from "express";
import { WeeklyReviewSchema, MonthlyReviewSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const reviewsRouter = Router();

// POST /reviews/weekly
reviewsRouter.post("/weekly", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = WeeklyReviewSchema.parse(req.body);
    const start = new Date(body.periodStart + "T00:00:00.000Z");
    const end = new Date(body.periodEnd + "T00:00:00.000Z");

    const review = await prisma.weeklyReview.create({
      data: {
        userId: req.userId!,
        periodStart: start,
        periodEnd: end,
        answers: body.answers,
      },
    });

    return res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

// GET /reviews/weekly
reviewsRouter.get("/weekly", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reviews = await prisma.weeklyReview.findMany({
      where: { userId: req.userId! },
      orderBy: { periodStart: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

// POST /reviews/monthly
reviewsRouter.post("/monthly", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = MonthlyReviewSchema.parse(req.body);
    const start = new Date(body.periodStart + "T00:00:00.000Z");
    const end = new Date(body.periodEnd + "T00:00:00.000Z");

    const review = await prisma.monthlyReview.create({
      data: {
        userId: req.userId!,
        periodStart: start,
        periodEnd: end,
        answers: body.answers,
      },
    });

    return res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

// GET /reviews/monthly
reviewsRouter.get("/monthly", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reviews = await prisma.monthlyReview.findMany({
      where: { userId: req.userId! },
      orderBy: { periodStart: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
});
