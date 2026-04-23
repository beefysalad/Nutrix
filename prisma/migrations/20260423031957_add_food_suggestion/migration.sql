-- CreateTable
CREATE TABLE "FoodSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DECIMAL(6,2) NOT NULL,
    "carbs" DECIMAL(6,2) NOT NULL,
    "fat" DECIMAL(6,2) NOT NULL,
    "tags" JSONB NOT NULL,
    "reasoning" TEXT NOT NULL,
    "prepTime" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "goalMode" TEXT,
    "recentFoods" JSONB NOT NULL,
    "generatedForMealType" TEXT,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodSuggestion_userId_style_createdAt_idx" ON "FoodSuggestion"("userId", "style", "createdAt");

-- CreateIndex
CREATE INDEX "FoodSuggestion_userId_generationId_idx" ON "FoodSuggestion"("userId", "generationId");

-- CreateIndex
CREATE INDEX "FoodSuggestion_userId_isSaved_idx" ON "FoodSuggestion"("userId", "isSaved");

-- AddForeignKey
ALTER TABLE "FoodSuggestion" ADD CONSTRAINT "FoodSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
