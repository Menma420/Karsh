import { Router, Response } from "express";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const capabilitiesRouter = Router();

// GET /capabilities
capabilitiesRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const capabilities = await prisma.capability.findMany({
      where: { active: true },
      orderBy: [
        { level: "asc" },
        { sortOrder: "asc" },
      ],
      include: {
        assessments: {
          where: { userId: req.userId! },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            aiAssessment: {
              select: {
                id: true,
                importedAt: true,
                promptVersion: { select: { version: true } },
              },
            },
          },
        },
      },
    });

    const result = capabilities.map((cap: typeof capabilities[0]) => {
      const latestAssessment = cap.assessments[0] || null;
      return {
        id: cap.id,
        name: cap.name,
        level: cap.level,
        description: cap.description,
        sortOrder: cap.sortOrder,
        latestAssessment: latestAssessment
          ? {
              id: latestAssessment.id,
              score: latestAssessment.score,
              previousScore: latestAssessment.previousScore,
              confidence: latestAssessment.confidence,
              evidence: latestAssessment.evidence,
              strengths: latestAssessment.strengths,
              weaknesses: latestAssessment.weaknesses,
              observations: latestAssessment.observations,
              createdAt: latestAssessment.createdAt,
              provenance: {
                importedAt: latestAssessment.aiAssessment.importedAt,
                promptVersion: latestAssessment.aiAssessment.promptVersion.version,
                aiAssessmentId: latestAssessment.aiAssessment.id,
              },
            }
          : null,
      };
    });

    return res.json({ capabilities: result });
  } catch (err) {
    next(err);
  }
});

// GET /capabilities/:id/history
capabilitiesRouter.get("/:id/history", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const capability = await prisma.capability.findUnique({
      where: { id: req.params.id },
    });

    if (!capability) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Capability not found" } });
    }

    const history = await prisma.capabilityAssessment.findMany({
      where: { capabilityId: capability.id, userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: {
        aiAssessment: {
          select: {
            id: true,
            importedAt: true,
            periodStart: true,
            periodEnd: true,
            promptVersion: { select: { version: true } },
          },
        },
      },
    });

    return res.json({
      capability,
      history: history.map((item: typeof history[0]) => ({
        id: item.id,
        score: item.score,
        previousScore: item.previousScore,
        confidence: item.confidence,
        evidence: item.evidence,
        strengths: item.strengths,
        weaknesses: item.weaknesses,
        observations: item.observations,
        createdAt: item.createdAt,
        provenance: {
          importedAt: item.aiAssessment.importedAt,
          periodStart: item.aiAssessment.periodStart,
          periodEnd: item.aiAssessment.periodEnd,
          promptVersion: item.aiAssessment.promptVersion.version,
          aiAssessmentId: item.aiAssessment.id,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
});
