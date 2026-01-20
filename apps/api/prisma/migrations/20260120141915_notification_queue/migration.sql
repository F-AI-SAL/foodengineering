-- CreateEnum
CREATE TYPE "NotificationJobStatus" AS ENUM ('queued', 'processing', 'sent', 'failed');

-- CreateTable
CREATE TABLE "NotificationJob" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" "NotificationJobStatus" NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationJob_status_scheduledAt_idx" ON "NotificationJob"("status", "scheduledAt");
