import { format, parseISO, eachDayOfInterval } from "date-fns";
import { ReviewPackageRequest } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";

export async function buildReviewPackage(userId: string, req: ReviewPackageRequest) {
  const startDate = new Date(req.periodStart + "T00:00:00.000Z");
  const endDate = new Date(req.periodEnd + "T23:59:59.999Z");

  // Fetch active prompt version
  const promptVersion = await prisma.aIPromptVersion.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch user entries in date range
  const entries = await prisma.reflectionEntry.findMany({
    where: {
      userId,
      occurredOn: { gte: startDate, lte: endDate },
    },
    orderBy: [
      { occurredOn: "asc" },
      { occurredAt: "asc" },
    ],
    include: {
      tags: { include: { tag: true } },
      experimentLinks: { include: { experiment: true } },
    },
  });

  // Fetch experiments
  const experiments = req.include.experiments
    ? await prisma.experiment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          linkedEntries: { include: { entry: true } },
        },
      })
    : [];

  if (experiments.length > 0) {
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
  }

  // Fetch decisions
  const decisions = req.include.decisions
    ? await prisma.decision.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
      })
    : [];

  // Fetch learning records
  const learningRecords = req.include.learningRecords
    ? await prisma.learningRecord.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
      })
    : [];

  // Fetch weekly reviews
  const weeklyReviews = req.include.reviews
    ? await prisma.weeklyReview.findMany({
        where: {
          userId,
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate },
        },
        orderBy: { periodStart: "asc" },
      })
    : [];

  // Fetch monthly reviews
  const monthlyReviews = req.include.reviews
    ? await prisma.monthlyReview.findMany({
        where: {
          userId,
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate },
        },
        orderBy: { periodStart: "asc" },
      })
    : [];

  // Fetch latest capability assessments
  const capabilities = req.include.capabilityHistory
    ? await prisma.capability.findMany({
        where: { active: true },
        orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
        include: {
          assessments: {
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      })
    : [];

  // Map entries by date YYYY-MM-DD
  const entriesByDate = new Map<string, typeof entries>();
  for (const entry of entries) {
    const dStr = format(entry.occurredOn, "yyyy-MM-dd");
    if (!entriesByDate.has(dStr)) {
      entriesByDate.set(dStr, []);
    }
    entriesByDate.get(dStr)!.push(entry);
  }

  // Generate date list across period
  const allDays = eachDayOfInterval({ start: parseISO(req.periodStart), end: parseISO(req.periodEnd) });

  let markdown = `# Personal Capability Review Package\n`;
  markdown += `**Period:** ${req.periodStart} to ${req.periodEnd}\n\n`;

  // Section: Capabilities Current State
  markdown += `## 1. Capabilities Current State\n`;
  if (capabilities.length > 0) {
    capabilities.forEach((cap) => {
      const latest = cap.assessments[0];
      const scoreStr = latest ? `${latest.score}/10 (Confidence: ${latest.confidence || "N/A"})` : "Unrated";
      markdown += `- **[Level ${cap.level}] ${cap.name}**: ${scoreStr}\n`;
    });
  } else {
    markdown += `No prior capability assessments recorded.\n`;
  }
  markdown += `\n`;

  // Section: Evidence & Reflections
  markdown += `## 2. Chronological Evidence & Reflections\n`;
  for (const day of allDays) {
    const dStr = format(day, "yyyy-MM-dd");
    const dayEntries = entriesByDate.get(dStr);

    if (!dayEntries || dayEntries.length === 0) {
      markdown += `- **${dStr}**: No recorded entries\n`;
    } else {
      markdown += `### ${dStr}\n`;
      dayEntries.forEach((entry, idx) => {
        const createdDateStr = format(entry.createdAt, "yyyy-MM-dd");
        const recordedNote = createdDateStr !== dStr ? ` *(Recorded on ${createdDateStr})*` : "";
        markdown += `#### Entry ${idx + 1}${recordedNote}\n`;
        if (entry.title) markdown += `**Title:** ${entry.title}\n`;
        if (entry.intent) markdown += `**Intent:** ${entry.intent}\n`;
        if (entry.outcome) markdown += `**Outcome:** ${entry.outcome}\n`;
        if (entry.wentWell) markdown += `**Went Well:** ${entry.wentWell}\n`;
        if (entry.struggle) markdown += `**Struggle/Mistake:** ${entry.struggle}\n`;
        if (entry.whyItHappened) markdown += `**Why It Happened:** ${entry.whyItHappened}\n`;
        if (entry.learned) markdown += `**Learned:** ${entry.learned}\n`;
        if (entry.willChange) markdown += `**Will Change:** ${entry.willChange}\n`;
        if (entry.notes) markdown += `**Notes:** ${entry.notes}\n`;
        markdown += `\n`;
      });
    }
  }

  // Section: Experiments
  if (req.include.experiments && experiments.length > 0) {
    markdown += `## 3. Experiments\n\n`;
    experiments.forEach((exp) => {
      // Using problem as title fallback or static identifier string if desired.
      markdown += `### ${exp.problem}\n\n`;
      markdown += `Status: ${exp.status}\n\n`;
      markdown += `Problem:\n${exp.problem}\n\n`;
      markdown += `Hypothesis:\n${exp.hypothesis}\n\n`;
      markdown += `Protocol:\n${exp.intervention}\n\n`;
      markdown += `Measurement:\n${exp.measurement}\n\n`;
      
      markdown += `Linked Evidence:\n\n`;
      if (exp.linkedEntries && exp.linkedEntries.length > 0) {
        exp.linkedEntries.forEach((link) => {
          const entry = link.entry;
          const dStr = format(entry.occurredOn, "yyyy-MM-dd");
          markdown += `#### ${dStr}${entry.title ? ` — ${entry.title}` : ''}\n\n`;
          if (entry.intent) markdown += `Intent:\n${entry.intent}\n\n`;
          if (entry.outcome) markdown += `Outcome:\n${entry.outcome}\n\n`;
          if (entry.struggle) markdown += `Struggles:\n${entry.struggle}\n\n`;
          if (entry.learned) markdown += `Learned:\n${entry.learned}\n\n`;
          if (entry.willChange) markdown += `Changes:\n${entry.willChange}\n\n`;
          if (entry.notes) markdown += `Notes:\n${entry.notes}\n\n`;
        });
      } else {
        markdown += `*No evidence linked yet.*\n\n`;
      }
      
      markdown += `Result:\n${exp.result || "N/A"}\n\n`;
      markdown += `Lesson:\n${exp.lesson || "N/A"}\n\n`;
      markdown += `Next Action:\n${exp.nextAction || "N/A"}\n\n`;
    });
  }

  // Section: Decisions
  if (req.include.decisions && decisions.length > 0) {
    markdown += `## 4. Decision Log\n`;
    decisions.forEach((dec) => {
      const dStr = format(dec.date, "yyyy-MM-dd");
      markdown += `- **${dStr}**: Decision: "${dec.decision}". Reasoning: "${dec.reasoning || "N/A"}". Outcome: ${dec.actualOutcome || "Pending"}\n`;
    });
    markdown += `\n`;
  }

  // Section: Learning Records
  if (req.include.learningRecords && learningRecords.length > 0) {
    markdown += `## 5. Learning Records\n`;
    learningRecords.forEach((lr) => {
      const dStr = format(lr.date, "yyyy-MM-dd");
      markdown += `- **${dStr}**: Topic: "${lr.topic}". What Learned: "${lr.whatLearned || "N/A"}". Application: ${lr.application || "N/A"}\n`;
    });
    markdown += `\n`;
  }

  // Section: Prompt Instructions & Output Schema
  markdown += `## 6. AI Assessment Instructions & Output Contract\n`;
  markdown += `${promptVersion?.promptText || "Produce a capability assessment based on evidence."}\n\n`;
  markdown += `Return ONLY valid JSON adhering strictly to this schema:\n`;
  markdown += `\`\`\`json
{
  "assessment_period": {
    "start": "${req.periodStart}",
    "end": "${req.periodEnd}"
  },
  "capabilities": [
    {
      "capability": "Metacognition",
      "score": 7,
      "previous_score": 6,
      "confidence": "high",
      "evidence": ["Used clear metacognitive reflection on Sep 10"],
      "strengths": ["Consistent self-observation"],
      "weaknesses": ["Occasional cognitive overload"],
      "observations": ["Good awareness of bottleneck"]
    }
  ],
  "current_bottleneck": {
    "capability": "Software/backend engineering",
    "reason": "Needs focus on database layer resilience"
  },
  "recurring_patterns": [],
  "successful_interventions": [],
  "failed_interventions": [],
  "recommended_experiments": [],
  "strategic_observations": []
}
\`\`\`\n`;

  return {
    markdown,
    promptVersionId: promptVersion?.id || "",
    schemaVersion: promptVersion?.schemaVersion || "1.0.0",
    data: {
      periodStart: req.periodStart,
      periodEnd: req.periodEnd,
      entriesCount: entries.length,
      experimentsCount: experiments.length,
      decisionsCount: decisions.length,
      learningRecordsCount: learningRecords.length,
    },
  };
}
