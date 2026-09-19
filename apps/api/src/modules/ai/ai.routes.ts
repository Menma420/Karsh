import { Router, Response } from "express";
import { ReviewPackageRequestSchema, AIAssessmentSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";
import { buildReviewPackage } from "./review-package";

export const aiRouter = Router();

// POST /ai/review-package
aiRouter.post("/review-package", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = ReviewPackageRequestSchema.parse(req.body);
    const result = await buildReviewPackage(req.userId!, body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/** Strip markdown code fences if present */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// POST /ai/validate-assessment
aiRouter.post("/validate-assessment", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { rawResponse } = req.body;
    if (!rawResponse || typeof rawResponse !== "string") {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Raw response text is required." }
      });
    }

    // 1. Strip markdown code fences
    const cleanedJson = stripCodeFences(rawResponse);

    // 2. JSON.parse (Do NOT guess/repair malformed JSON)
    let parsed: any;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch (e: any) {
      return res.status(422).json({
        error: { code: "MALFORMED_JSON", message: "Malformed JSON syntax", details: [e.message] }
      });
    }

    // 3. Zod schema validation
    const zodResult = AIAssessmentSchema.safeParse(parsed);
    if (!zodResult.success) {
      const fieldErrors = zodResult.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return res.status(422).json({
        error: { code: "VALIDATION_FAILED", message: "Invalid payload format", details: fieldErrors }
      });
    }

    const payload = zodResult.data;

    // 4. Validate capability names against active DB taxonomy
    const dbCapabilities = await prisma.capability.findMany({
      where: { active: true },
      select: { name: true },
    });
    const validNames = new Set(dbCapabilities.map((c) => c.name.toLowerCase()));

    const unknownCapabilities: string[] = [];
    payload.capabilities.forEach((c) => {
      if (!validNames.has(c.capability.toLowerCase())) {
        unknownCapabilities.push(c.capability);
      }
    });

    if (unknownCapabilities.length > 0) {
      return res.status(422).json({
        error: { 
          code: "UNKNOWN_CAPABILITY", 
          message: "Unknown capabilities not present in taxonomy", 
          details: unknownCapabilities 
        }
      });
    }

    // Fetch latest active prompt version ID
    const activePrompt = await prisma.aIPromptVersion.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      valid: true,
      parsedPayload: payload,
      promptVersionId: activePrompt?.id || "",
      schemaVersion: activePrompt?.schemaVersion || "1.0.0",
    });
  } catch (err) {
    next(err);
  }
});

// POST /ai/import-assessment
aiRouter.post("/import-assessment", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { rawResponse, parsedPayload, promptVersionId } = req.body;

    if (!rawResponse || !parsedPayload) {
      return res.status(400).json({ error: { code: "MISSING_PAYLOAD", message: "rawResponse and parsedPayload are required" } });
    }

    // Server-side re-validation (Never trust client echo)
    const zodResult = AIAssessmentSchema.safeParse(parsedPayload);
    if (!zodResult.success) {
      return res.status(422).json({ error: { code: "INVALID_PAYLOAD", message: "Invalid assessment payload" } });
    }
    const payload = zodResult.data;

    // Map capabilities by name
    const dbCapabilities = await prisma.capability.findMany({ where: { active: true } });
    const capMap = new Map(dbCapabilities.map((c) => [c.name.toLowerCase(), c.id]));

    for (const item of payload.capabilities) {
      if (!capMap.has(item.capability.toLowerCase())) {
        return res.status(422).json({
          error: {
            code: "UNKNOWN_CAPABILITY",
            message: `Unknown capability '${item.capability}'`,
          },
        });
      }
    }

    // Single Atomic DB Transaction
    const result = await prisma.$transaction(async (tx) => {
      const aiAssessment = await tx.aIAssessment.create({
        data: {
          userId: req.userId!,
          periodStart: new Date(payload.assessment_period.start + "T00:00:00.000Z"),
          periodEnd: new Date(payload.assessment_period.end + "T23:59:59.999Z"),
          rawResponse, // EXACT raw response stored
          parsedPayload: payload as any,
          promptVersionId: promptVersionId || dbCapabilities[0]?.id || "",
          schemaVersion: "1.0.0",
        },
      });

      const capAssessments = await Promise.all(
        payload.capabilities.map((c) => {
          const capId = capMap.get(c.capability.toLowerCase())!;
          return tx.capabilityAssessment.create({
            data: {
              userId: req.userId!,
              capabilityId: capId,
              aiAssessmentId: aiAssessment.id,
              score: c.score,
              previousScore: c.previous_score,
              confidence: c.confidence,
              evidence: c.evidence,
              strengths: c.strengths,
              weaknesses: c.weaknesses,
              observations: c.observations,
            },
          });
        })
      );

      return { aiAssessment, capAssessments };
    });

    return res.status(201).json({
      message: "AI Assessment imported successfully",
      assessmentId: result.aiAssessment.id,
      importedCount: result.capAssessments.length,
    });
  } catch (err) {
    next(err);
  }
});
