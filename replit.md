# Medical Report Analysis System

## Overview

An AI-powered web application that helps patients understand their medical reports. Users upload PDFs or images of medical reports, and the system uses OpenAI GPT to extract information, explain results in plain language, highlight abnormal values, and provide basic health insights.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations (no API key needed)
- **File uploads**: multer (in-memory, base64 stored in DB)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Frontend (`artifacts/medical-report-analyzer/`)
- React + Vite + Tailwind CSS + shadcn/ui
- Two pages: `/` (Dashboard with upload) and `/reports/:id` (Report detail)
- Polls for analysis completion with `refetchInterval` while status is "analyzing"

### Backend (`artifacts/api-server/`)
- Express 5 API server
- Routes: GET /api/reports, POST /api/reports (multipart upload), GET /api/reports/:id, DELETE /api/reports/:id, GET /api/reports/stats/summary
- Analysis runs asynchronously after upload via `setImmediate`

### AI Analysis (`artifacts/api-server/src/lib/analyzeReport.ts`)
- Uses OpenAI GPT-5.2 with vision for image files
- Extracts lab values, report type, patient name, report date
- Generates simplified explanations and health insights
- Categorizes values as: normal, high, low, critical

### Database (`lib/db/src/schema/reports.ts`)
- `reports` table: stores file metadata, base64 content, analysis results, lab values (JSONB)

## API Endpoints

- `GET /api/reports` — list all reports
- `POST /api/reports` — upload a medical report (multipart/form-data, field: "file")
- `GET /api/reports/:id` — get a single report
- `DELETE /api/reports/:id` — delete a report
- `GET /api/reports/stats/summary` — summary stats (totals, recent reports)
