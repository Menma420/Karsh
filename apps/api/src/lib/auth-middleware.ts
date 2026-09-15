import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "personal-capability-os-secret-key-change-in-prod";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function generateSessionToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "30d" });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      },
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "INVALID_SESSION",
        message: "Invalid or expired session",
      },
    });
  }
}
