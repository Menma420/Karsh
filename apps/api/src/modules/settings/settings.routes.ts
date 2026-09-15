import { Router, Response } from "express";
import { UpdateSettingsSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const settingsRouter = Router();

settingsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.userId! },
    });

    if (!settings) {
      return res.status(404).json({ error: { code: "SETTINGS_NOT_FOUND", message: "User settings not found" } });
    }

    return res.json({ settings });
  } catch (err) {
    next(err);
  }
});

settingsRouter.patch("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const body = UpdateSettingsSchema.parse(req.body);

    const updated = await prisma.userSettings.update({
      where: { userId: req.userId! },
      data: body,
    });

    return res.json({ settings: updated });
  } catch (err) {
    next(err);
  }
});
