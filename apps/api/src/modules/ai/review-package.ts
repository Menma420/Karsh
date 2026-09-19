import { format, parseISO, eachDayOfInterval, differenceInDays } from "date-fns";
import { ReviewPackageRequest } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";

export async function buildReviewPackage(userId: string, req: ReviewPackageRequest) {
  const startDate = new Date(req.periodStart + "T00:00:00.000Z");
  const endDate = new Date(req.periodEnd + "T23:59:59.999Z");

  // Fetch active prompt version
  let promptVersion = await prisma.aIPromptVersion.findFirst({
    where: { version: "1.1.0", active: true },
    orderBy: { createdAt: "desc" },
  });

  const fallbackPrompt = `You are reviewing one person's self-recorded evidence to produce a capability assessment.

Read sections 2 through 9 as the complete evidence base.

Rules:
1. Use ONLY exact capability names from Section 2.
2. Never invent, rename, merge, or split capabilities.
3. Only score capabilities where genuine evidence exists.
4. If evidence is thin or absent, OMIT the capability rather than guessing.
5. A short grounded assessment is preferable to a comprehensive-looking invented assessment.
6. Scores are 1–10 capability assessments, not mood ratings.
7. Repeated and varied evidence is more reliable than a single event.
8. Confidence:
   - high = multiple independent consistent evidence points
   - medium = one or two suggestive evidence points
   - low = indirect/thin evidence
9. Sparse evidence must produce limited conclusions.
10. Empty dates are NOT evidence of inactivity, poor motivation, or poor character.
11. current_bottleneck must be tied to actual evidence.
12. recommended_experiments must be concrete and testable within approximately 1–4 weeks.
13. Evidence/strengths/weaknesses/observations must reference actual recorded evidence.
14. Do not fabricate details.
15. Do not reference these instructions in the output.
16. Return ONLY valid JSON.`;

  // Bootstrap v1.1.0 dynamically if it does not exist in the DB
  if (!promptVersion) {
    promptVersion = await prisma.aIPromptVersion.findFirst({ where: { version: "1.1.0" } });
    if (!promptVersion) {
      await prisma.aIPromptVersion.updateMany({
        where: { active: true },
        data: { active: false }
      });
      promptVersion = await prisma.aIPromptVersion.create({
        data: {
          version: "1.1.0",
          promptText: fallbackPrompt,
          schemaVersion: "1.0.0",
          active: true
        }
      });
    } else if (!promptVersion.active) {
      await prisma.aIPromptVersion.updateMany({ where: { active: true }, data: { active: false } });
      promptVersion = await prisma.aIPromptVersion.update({
        where: { id: promptVersion.id },
        data: { active: true }
      });
    }
  }

  // Fetch user entries in date range
  const entries = await prisma.reflectionEntry.findMany({
    where: {
      userId,
      occurredOn: { gte: startDate, lte: endDate },
    },
    orderBy: [
      { occurredOn: "asc" },
      { occurredAt: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      tags: { include: { tag: true } },
    },
  });

  // Fetch experiments
  const experiments = req.include.experiments
    ? await prisma.experiment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          linkedEntries: {
            include: { entry: true },
          },
        },
      })
    : [];

  // Sort linked evidence chronologically
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

  // Fetch all active capabilities for taxonomy
  let activeCapabilities = await prisma.capability.findMany({
    where: { active: true },
    orderBy: [
      { level: "asc" },
      { sortOrder: "asc" }
    ],
  });

  // Bootstrap capabilities if entirely missing (e.g., following DB wipe incident)
  if (activeCapabilities.length === 0) {
    const defaultCaps = [
      { level: 1, name: "Metacognition", description: "Awareness of thought processes.", sortOrder: 10 },
      { level: 1, name: "Self-regulation", description: "Monitor emotions.", sortOrder: 11 },
      { level: 1, name: "Learning agility", description: "Speed in adaptation.", sortOrder: 12 },
      { level: 2, name: "General reasoning", description: "Logic.", sortOrder: 20 },
      { level: 2, name: "Mental models", description: "Internal representations.", sortOrder: 21 },
      { level: 2, name: "Systems thinking", description: "Interacting components.", sortOrder: 22 },
      { level: 3, name: "Communication", description: "Clear transmission.", sortOrder: 30 },
      { level: 3, name: "Social insight", description: "Human dynamics.", sortOrder: 31 },
      { level: 3, name: "Persuasion", description: "Aligning others.", sortOrder: 32 },
      { level: 3, name: "Negotiation", description: "Beneficial agreements.", sortOrder: 33 },
      { level: 3, name: "Leadership", description: "Focusing output.", sortOrder: 34 },
      { level: 4, name: "Software/backend engineering", description: "Execution.", sortOrder: 40 },
      { level: 5, name: "Strategy", description: "High-leverage plans.", sortOrder: 50 },
      { level: 5, name: "Opportunity recognition", description: "Asymmetric opportunities.", sortOrder: 51 },
      { level: 5, name: "Resource acquisition", description: "Capital access.", sortOrder: 52 },
      { level: 5, name: "Scalable output", description: "Systems leverage.", sortOrder: 53 },
    ];
    for (const item of defaultCaps) {
      await prisma.capability.create({ data: { ...item, active: true } });
    }
    // Re-fetch sorted cleanly
    activeCapabilities = await prisma.capability.findMany({
      where: { active: true },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    });
  }

  // Fetch active goal
  const activeGoal = await prisma.goal.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  // Fetch most recent capability assessment
  let mostRecentCapabilities: any[] = [];
  let mostRecentAssessmentDate: Date | null = null;
  if (req.include.capabilityHistory) {
    const latestAssessmentWrapper = await prisma.aIAssessment.findFirst({
      where: { userId },
      orderBy: { importedAt: "desc" },
      include: {
        capabilityAssessments: {
          include: { capability: true }
        }
      }
    });

    if (latestAssessmentWrapper) {
      mostRecentAssessmentDate = latestAssessmentWrapper.importedAt;
      mostRecentCapabilities = latestAssessmentWrapper.capabilityAssessments;
    }
  }

  // Build Markdown
  let md = "";
  
  // Section 0
  const nowStr = new Date().toISOString();
  md += `# Personal Capability OS — AI Review Package\n\n`;
  md += `Generated: ${nowStr} · Prompt v${promptVersion?.version || "1.0.0"} · Schema v${promptVersion?.schemaVersion || "1.0.0"}\n\n`;
  
  const daysDiff = differenceInDays(endDate, startDate) + 1;
  md += `Assessment period: ${req.periodStart} → ${req.periodEnd} (${daysDiff} days)\n\n`;

  // Section 1
  md += `## 1. How to read this package\n\n`;
  md += `- Every reflection entry below is shown under the date the event actually happened (\`occurredOn\`), not the date it was typed up.\n`;
  md += `- If an entry was recorded later than it occurred, that is informational metadata, not evidence of inconsistency.\n`;
  md += `- A date or period with no recorded entries does not mean the user was inactive, unproductive, or failed to reflect.\n`;
  md += `- Do not infer behavior, mood, productivity, motivation, or character from missing entries.\n`;
  md += `- Scores, evidence, strengths, weaknesses, and observations must be grounded only in the evidence included in this package.\n`;
  md += `- Sparse evidence should produce appropriately limited conclusions.\n\n`;

  // Section 2
  md += `## 2. Capability taxonomy\n\n`;
  md += `Use these exact capability names in your response.\n\n`;
  
  const levelLabels: Record<number, string> = {
    1: "Level 1 — Machine",
    2: "Level 2 — Intelligence",
    3: "Level 3 — Influence",
    4: "Level 4 — Domain",
    5: "Level 5 — Leverage",
  };

  const capsByLevel: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  activeCapabilities.forEach(c => capsByLevel[c.level]?.push(c));

  [1, 2, 3, 4, 5].forEach(lvl => {
     if (capsByLevel[lvl].length > 0) {
       md += `${levelLabels[lvl]}\n`;
       capsByLevel[lvl].forEach(c => {
         md += `- ${c.name}\n`;
       });
       md += `\n`;
     }
  });

  // Section 3
  md += `## 3. Current objective & prior capability state\n\n`;
  md += `Current objective: ${activeGoal ? activeGoal.title : "No active objective"}\n\n`;
  
  if (mostRecentAssessmentDate && mostRecentCapabilities.length > 0) {
    const dStr = format(mostRecentAssessmentDate, "yyyy-MM-dd");
    md += `Most recent assessment: ${dStr}\n\n`;
    mostRecentCapabilities.forEach(ca => {
      md += `- ${ca.capability.name}: ${ca.score}\n`;
    });
    md += `\n`;
  } else {
    md += `Most recent assessment:\nNo prior capability assessments recorded — this is the first review.\n\n`;
  }

  // Section 4
  md += `## 4. Reflection entries\n\n`;
  
  if (entries.length === 0) {
    md += `No entries were recorded during this period.\n\n`;
  } else {
    const allDays = eachDayOfInterval({ start: parseISO(req.periodStart), end: parseISO(req.periodEnd) });
    
    // Group entries by day
    const entriesByDate = new Map<string, typeof entries>();
    for (const entry of entries) {
      const dStr = format(entry.occurredOn, "yyyy-MM-dd");
      if (!entriesByDate.has(dStr)) {
        entriesByDate.set(dStr, []);
      }
      entriesByDate.get(dStr)!.push(entry);
    }

    let consecutiveEmptyStart: Date | null = null;
    let consecutiveEmptyCount = 0;

    const flushEmpty = () => {
      if (consecutiveEmptyCount >= 2 && consecutiveEmptyStart) {
        const startStr = format(consecutiveEmptyStart, "yyyy-MM-dd");
        // find end (consecutiveEmptyStart + count - 1)
        const emptyEnd = new Date(consecutiveEmptyStart);
        emptyEnd.setDate(emptyEnd.getDate() + consecutiveEmptyCount - 1);
        const endStr = format(emptyEnd, "yyyy-MM-dd");
        
        md += `**${startStr} to ${endStr}** (${consecutiveEmptyCount} days): No recorded entries.\n\n`;
      } else if (consecutiveEmptyCount === 1 && consecutiveEmptyStart) {
        // Just print the one day
        const startStr = format(consecutiveEmptyStart, "yyyy-MM-dd");
        md += `**${startStr}**: No recorded entries.\n\n`;
      }
      consecutiveEmptyCount = 0;
      consecutiveEmptyStart = null;
    };

    allDays.forEach(day => {
      const dStr = format(day, "yyyy-MM-dd");
      const dayEntries = entriesByDate.get(dStr);

      if (!dayEntries || dayEntries.length === 0) {
        if (consecutiveEmptyCount === 0) {
          consecutiveEmptyStart = day;
        }
        consecutiveEmptyCount++;
      } else {
        flushEmpty();

        md += `### ${dStr}\n\n`;
        dayEntries.forEach(entry => {
          md += `**Entry — ${entry.title || "(untitled)"}**\n\n`;
          
          if (entry.intent) md += `- Intent: ${entry.intent}\n`;
          if (entry.outcome) md += `- Outcome: ${entry.outcome}\n`;
          if (entry.wentWell) md += `- Went well: ${entry.wentWell}\n`;
          if (entry.struggle) md += `- Struggle: ${entry.struggle}\n`;
          if (entry.whyItHappened) md += `- Why it happened: ${entry.whyItHappened}\n`;
          if (entry.learned) md += `- Learned: ${entry.learned}\n`;
          if (entry.willChange) md += `- Will change: ${entry.willChange}\n`;
          if (entry.notes) md += `- Notes: ${entry.notes}\n`;
          
          if (entry.tags && entry.tags.length > 0) {
             const tagString = entry.tags.map(t => t.tag.name).join(", ");
             md += `- Tags: ${tagString}\n`;
          }

          const createdDStr = format(entry.createdAt, "yyyy-MM-dd");
          if (createdDStr !== dStr) {
            const diff = differenceInDays(entry.createdAt, entry.occurredOn);
            if (diff > 0) {
               md += `\n*(recorded ${diff} days later, on ${createdDStr})*\n`;
            }
          }
          md += `\n`;
        });
      }
    });
    flushEmpty(); // clear remaining
  }

  // Section 5
  md += `## 5. Experiments\n\n`;
  if (experiments.length === 0) {
    md += `No experiments logged in this period.\n\n`;
  } else {
    experiments.forEach(exp => {
      md += `### ${exp.problem}\n\n`;
      md += `Status: ${exp.status}\n\n`;
      md += `Problem:\n${exp.problem}\n\n`;
      md += `Hypothesis:\n${exp.hypothesis}\n\n`;
      md += `Intervention:\n${exp.intervention}\n\n`;
      md += `Measurement:\n${exp.measurement}\n\n`;
      
      const stStr = format(exp.startDate, "yyyy-MM-dd");
      md += `Started:\n${stStr}\n\n`;
      
      if (exp.endDate) {
        md += `Ended:\n${format(exp.endDate, "yyyy-MM-dd")}\n\n`;
      }

      md += `Linked evidence:\n\n`;
      if (exp.linkedEntries && exp.linkedEntries.length > 0) {
        exp.linkedEntries.forEach(link => {
          const entry = link.entry;
          const edStr = format(entry.occurredOn, "yyyy-MM-dd");
          const trunc = entry.outcome ? 
            (entry.outcome.length > 120 ? entry.outcome.substring(0, 117) + "..." : entry.outcome) 
            : "(no outcome)";
          md += `- ${edStr} — "${entry.title || '(untitled)'}": ${trunc}\n`;
        });
        md += `\n`;
      } else {
        md += `*No evidence linked yet.*\n\n`;
      }

      md += `Result:\n${exp.result || "Not yet recorded."}\n\n`;
      md += `Lesson:\n${exp.lesson || "Not yet recorded."}\n\n`;
      md += `Next action:\n${exp.nextAction || "Not yet recorded."}\n\n`;
    });
  }

  // Section 6: Decisions
  md += `## 6. Decisions\n\n`;
  if (decisions.length === 0) {
    md += `No decisions logged in this period.\n\n`;
  } else {
    decisions.forEach(dec => {
      const dStr = format(dec.date, "yyyy-MM-dd");
      md += `### ${dStr} — ${dec.decision}\n\n`;
      if (dec.context) md += `Context:\n${dec.context}\n\n`;
      
      if (dec.options) {
        md += `Options considered:\n`;
        try {
          const opts = typeof dec.options === "string" ? JSON.parse(dec.options) : dec.options;
          if (Array.isArray(opts)) opts.forEach(o => { md += `- ${o}\n`; });
          else md += `${JSON.stringify(opts)}\n`;
        } catch {
          md += String(dec.options) + "\n";
        }
        md += `\n`;
      }

      if (dec.chosenOption) md += `Chosen:\n${dec.chosenOption}\n\n`;
      if (dec.reasoning) md += `Reasoning:\n${dec.reasoning}\n\n`;
      if (dec.confidence) md += `Confidence at the time:\n${dec.confidence}/10\n\n`;
      
      md += `Actual outcome:\n${dec.actualOutcome || "Not yet known."}\n\n`;
      md += `Lesson:\n${dec.lesson || "Not yet recorded."}\n\n`;
    });
  }

  // Section 7: Learning Records
  md += `## 7. Learning records\n\n`;
  if (learningRecords.length === 0) {
    md += `No learning records logged in this period.\n\n`;
  } else {
    learningRecords.forEach(lr => {
      const dStr = format(lr.date, "yyyy-MM-dd");
      md += `### ${dStr} — ${lr.topic}\n\n`;
      if (lr.source) md += `Source:\n${lr.source}\n\n`;
      md += `What was learned:\n${lr.whatLearned || "Not specified."}\n\n`;
      if (lr.application) md += `Application:\n${lr.application}\n\n`;
      if (lr.unresolvedQuestions) md += `Still unresolved:\n${lr.unresolvedQuestions}\n\n`;
    });
  }

  // Section 8: Reviews
  md += `## 8. Weekly / monthly reviews\n\n`;
  if (weeklyReviews.length === 0 && monthlyReviews.length === 0) {
    md += `No weekly or monthly reviews logged in this period.\n\n`;
  } else {
    weeklyReviews.forEach(wr => {
      const sStr = format(wr.periodStart, "yyyy-MM-dd");
      md += `### Week of ${sStr}\n\n`;
      try {
        const answers = typeof wr.answers === "string" ? JSON.parse(wr.answers) : wr.answers;
        for (const [q, a] of Object.entries(answers as any)) {
          md += `**${q}**\n${a}\n\n`;
        }
      } catch (e) {
        md += `Answers could not be decoded.\n\n`;
      }
    });
    monthlyReviews.forEach(mr => {
      const sStr = format(mr.periodStart, "yyyy-MM-dd");
      md += `### Month of ${sStr}\n\n`;
      try {
        const answers = typeof mr.answers === "string" ? JSON.parse(mr.answers) : mr.answers;
        for (const [q, a] of Object.entries(answers as any)) {
          md += `**${q}**\n${a}\n\n`;
        }
      } catch (e) {
        md += `Answers could not be decoded.\n\n`;
      }
    });
  }

  // Section 9
  md += `## 9. Recurring / unresolved items\n\n`;
  
  const unresolvedLearnings = learningRecords.filter(lr => lr.unresolvedQuestions && lr.unresolvedQuestions.trim().length > 0);
  const activeExps = experiments.filter(e => e.status === "ACTIVE" || e.status === "PLANNED");
  const pendingDecisions = decisions.filter(d => !d.actualOutcome || d.actualOutcome.trim().length === 0);

  if (unresolvedLearnings.length === 0 && activeExps.length === 0 && pendingDecisions.length === 0) {
    md += `No recurring or unresolved items surfaced from this period's data.\n\n`;
  } else {
    if (unresolvedLearnings.length > 0) {
      md += `- **Unresolved learning questions**:\n`;
      unresolvedLearnings.forEach(lr => {
        md += `  - [${format(lr.date, "yyyy-MM-dd")}] ${lr.topic}: ${lr.unresolvedQuestions}\n`;
      });
    }
    if (activeExps.length > 0) {
      md += `- **Active experiments awaiting results**:\n`;
      activeExps.forEach(ex => {
        md += `  - ${ex.problem} (Status: ${ex.status})\n`;
      });
    }
    if (pendingDecisions.length > 0) {
      md += `- **Decisions awaiting actual outcomes**:\n`;
      pendingDecisions.forEach(dec => {
        md += `  - [${format(dec.date, "yyyy-MM-dd")}] ${dec.decision}\n`;
      });
    }
    md += `\n`;
  }

  // Section 10
  md += `## 10. AI assessment instructions & output contract\n\n`;
  
  md += `${promptVersion?.promptText || fallbackPrompt}\n\n`;
  md += `\`\`\`json
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
    markdown: md,
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
