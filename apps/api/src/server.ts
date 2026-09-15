import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./lib/errors";
import { authRouter } from "./modules/auth/auth.routes";
import { settingsRouter } from "./modules/settings/settings.routes";
import { entriesRouter } from "./modules/entries/entries.routes";
import { experimentsRouter } from "./modules/experiments/experiments.routes";
import { decisionsRouter } from "./modules/decisions/decisions.routes";
import { learningRecordsRouter } from "./modules/learning-records/learning-records.routes";
import { reviewsRouter } from "./modules/reviews/reviews.routes";
import { capabilitiesRouter } from "./modules/capabilities/capabilities.routes";
import { aiRouter } from "./modules/ai/ai.routes";
import { searchRouter } from "./modules/search/search.routes";
import { exportRouter } from "./modules/export/export.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

// Rate limiter on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many login attempts, please try again later." } },
});

// Routes
app.use("/auth", authLimiter, authRouter);
app.use("/settings", settingsRouter);
app.use("/reflection-entries", entriesRouter);
app.use("/experiments", experimentsRouter);
app.use("/decisions", decisionsRouter);
app.use("/learning-records", learningRecordsRouter);
app.use("/reviews", reviewsRouter);
app.use("/capabilities", capabilitiesRouter);
app.use("/ai", aiRouter);
app.use("/search", searchRouter);
app.use("/export", exportRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Personal Capability OS API listening on port ${PORT}`);
  });
}

export default app;
