import { Router, Response } from "express";
import argon2 from "argon2";
import { RegisterSchema, LoginSchema } from "@personal-capability-os/shared-types";
import { prisma } from "../../db/client";
import { generateSessionToken, requireAuth, AuthenticatedRequest } from "../../lib/auth-middleware";

export const authRouter = Router();

// POST /auth/register (Single-user app rule: 403 if user already registered)
authRouter.post("/register", async (req, res, next) => {
  try {
    const existingCount = await prisma.user.count();
    if (existingCount > 0) {
      return res.status(403).json({
        error: {
          code: "REGISTRATION_DISABLED",
          message: "Single-user application already has a registered account.",
        },
      });
    }

    const body = RegisterSchema.parse(req.body);
    const passwordHash = await argon2.hash(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        settings: {
          create: {
            backfillDays: 7,
            timezone: "Asia/Kolkata",
          },
        },
      },
      include: {
        settings: true,
      },
    });

    const token = generateSessionToken(user.id, user.email);

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { settings: true },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const validPassword = await argon2.verify(user.passwordHash, body.password);
    if (!validPassword) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const token = generateSessionToken(user.id, user.email);

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
authRouter.post("/logout", (req, res) => {
  res.clearCookie("session_token");
  return res.json({ message: "Logged out successfully" });
});

// GET /auth/me
authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { settings: true },
    });

    if (!user) {
      return res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    next(err);
  }
});
