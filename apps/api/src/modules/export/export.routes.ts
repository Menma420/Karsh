import { Router, Response } from "express";
import archiver from "archiver";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const exportRouter = Router();

exportRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.userId!;

    const [user, settings, entries, experiments, decisions, learningRecords, weeklyReviews, monthlyReviews, aiAssessments, capabilityAssessments] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, createdAt: true } }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.reflectionEntry.findMany({ where: { userId }, include: { tags: { include: { tag: true } } } }),
      prisma.experiment.findMany({ where: { userId } }),
      prisma.decision.findMany({ where: { userId } }),
      prisma.learningRecord.findMany({ where: { userId } }),
      prisma.weeklyReview.findMany({ where: { userId } }),
      prisma.monthlyReview.findMany({ where: { userId } }),
      prisma.aIAssessment.findMany({ where: { userId } }),
      prisma.capabilityAssessment.findMany({ where: { userId }, include: { capability: true } }),
    ]);

    const exportData = {
      user,
      settings,
      reflectionEntries: entries,
      experiments,
      decisions,
      learningRecords,
      weeklyReviews,
      monthlyReviews,
      aiAssessments,
      capabilityAssessments,
      exportedAt: new Date().toISOString(),
    };

    let mdBundle = `# Personal Capability OS — Data Export Archive\n`;
    mdBundle += `Exported: ${new Date().toISOString()}\n\n`;

    mdBundle += `## Reflection Entries (${entries.length})\n\n`;
    entries.forEach((e) => {
      mdBundle += `### Date: ${e.occurredOn.toISOString().split("T")[0]}\n`;
      if (e.title) mdBundle += `**Title:** ${e.title}\n`;
      if (e.intent) mdBundle += `**Intent:** ${e.intent}\n`;
      if (e.outcome) mdBundle += `**Outcome:** ${e.outcome}\n`;
      if (e.learned) mdBundle += `**Learned:** ${e.learned}\n`;
      mdBundle += `\n---\n\n`;
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=personal_capability_os_export_${Date.now()}.zip`);

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.append(JSON.stringify(exportData, null, 2), { name: "data.json" });
    archive.append(mdBundle, { name: "reflections.md" });

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});
