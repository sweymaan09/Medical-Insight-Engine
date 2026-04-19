import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labValueSchema = z.object({
  name: z.string(),
  value: z.string(),
  unit: z.string(),
  referenceRange: z.string(),
  status: z.enum(["normal", "high", "low", "critical"]),
  explanation: z.string(),
});

export type LabValue = z.infer<typeof labValueSchema>;

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileData: text("file_data"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  reportType: text("report_type"),
  patientName: text("patient_name"),
  reportDate: text("report_date"),
  summary: text("summary"),
  simplifiedExplanation: text("simplified_explanation"),
  healthInsights: text("health_insights"),
  labValues: jsonb("lab_values"),
  abnormalCount: integer("abnormal_count"),
  criticalCount: integer("critical_count"),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  uploadedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
