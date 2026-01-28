-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_mobile_idx" ON "Lead"("mobile");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_productSlug_city_idx" ON "Lead"("productSlug", "city");

-- CreateIndex
CREATE INDEX "Lead_mobile_productSlug_createdAt_idx" ON "Lead"("mobile", "productSlug", "createdAt" DESC);
