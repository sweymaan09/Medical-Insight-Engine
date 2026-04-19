import { Router, type IRouter } from "express";
import multer from "multer";
import { db, reportsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { analyzeReport } from "../lib/analyzeReport";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are accepted"));
    }
  },
});

router.get("/reports/stats/summary", async (req, res): Promise<void> => {
  const allReports = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.uploadedAt));

  const totalReports = allReports.length;
  const reportsWithAbnormal = allReports.filter(
    (r) => (r.abnormalCount ?? 0) > 0
  ).length;
  const reportsWithCritical = allReports.filter(
    (r) => (r.criticalCount ?? 0) > 0
  ).length;
  const recentReports = allReports.slice(0, 5).map((r) => ({
    ...r,
    fileData: undefined,
    labValues: r.labValues,
  }));

  res.json({
    totalReports,
    reportsWithAbnormal,
    reportsWithCritical,
    recentReports,
  });
});

router.get("/reports", async (req, res): Promise<void> => {
  const reports = await db
    .select({
      id: reportsTable.id,
      fileName: reportsTable.fileName,
      fileType: reportsTable.fileType,
      uploadedAt: reportsTable.uploadedAt,
      status: reportsTable.status,
      reportType: reportsTable.reportType,
      patientName: reportsTable.patientName,
      reportDate: reportsTable.reportDate,
      summary: reportsTable.summary,
      simplifiedExplanation: reportsTable.simplifiedExplanation,
      healthInsights: reportsTable.healthInsights,
      labValues: reportsTable.labValues,
      abnormalCount: reportsTable.abnormalCount,
      criticalCount: reportsTable.criticalCount,
    })
    .from(reportsTable)
    .orderBy(desc(reportsTable.uploadedAt));

  res.json(reports);
});

router.post("/reports", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { originalname, mimetype, buffer } = req.file;
  const base64Content = buffer.toString("base64");

  const [report] = await db
    .insert(reportsTable)
    .values({
      fileName: originalname,
      fileType: mimetype,
      fileData: base64Content,
      status: "analyzing",
    })
    .returning();

  res.status(201).json({
    id: report.id,
    fileName: report.fileName,
    fileType: report.fileType,
    uploadedAt: report.uploadedAt,
    status: report.status,
    reportType: null,
    patientName: null,
    reportDate: null,
    summary: null,
    simplifiedExplanation: null,
    healthInsights: null,
    labValues: null,
    abnormalCount: null,
    criticalCount: null,
  });

  setImmediate(async () => {
    try {
      const analysis = await analyzeReport(base64Content, mimetype, originalname);
      await db
        .update(reportsTable)
        .set({
          status: "done",
          reportType: analysis.reportType,
          patientName: analysis.patientName,
          reportDate: analysis.reportDate,
          summary: analysis.summary,
          simplifiedExplanation: analysis.simplifiedExplanation,
          healthInsights: analysis.healthInsights,
          labValues: analysis.labValues,
          abnormalCount: analysis.abnormalCount,
          criticalCount: analysis.criticalCount,
        })
        .where(eq(reportsTable.id, report.id));
      logger.info({ reportId: report.id }, "Report analysis complete");
    } catch (err) {
      logger.error({ err, reportId: report.id }, "Report analysis failed");
      await db
        .update(reportsTable)
        .set({ status: "error" })
        .where(eq(reportsTable.id, report.id));
    }
  });
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  const [report] = await db
    .select({
      id: reportsTable.id,
      fileName: reportsTable.fileName,
      fileType: reportsTable.fileType,
      uploadedAt: reportsTable.uploadedAt,
      status: reportsTable.status,
      reportType: reportsTable.reportType,
      patientName: reportsTable.patientName,
      reportDate: reportsTable.reportDate,
      summary: reportsTable.summary,
      simplifiedExplanation: reportsTable.simplifiedExplanation,
      healthInsights: reportsTable.healthInsights,
      labValues: reportsTable.labValues,
      abnormalCount: reportsTable.abnormalCount,
      criticalCount: reportsTable.criticalCount,
    })
    .from(reportsTable)
    .where(eq(reportsTable.id, id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(report);
});

router.delete("/reports/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  const [deleted] = await db
    .delete(reportsTable)
    .where(eq(reportsTable.id, id))
    .returning({ id: reportsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
