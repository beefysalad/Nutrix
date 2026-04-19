-- CreateTable
CREATE TABLE "PendingLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingLink_token_key" ON "PendingLink"("token");

-- CreateIndex
CREATE INDEX "PendingLink_userId_provider_idx" ON "PendingLink"("userId", "provider");

-- CreateIndex
CREATE INDEX "PendingLink_provider_expiresAt_idx" ON "PendingLink"("provider", "expiresAt");

-- AddForeignKey
ALTER TABLE "PendingLink" ADD CONSTRAINT "PendingLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
