-- AlterTable
ALTER TABLE "FoodSuggestion" ADD COLUMN     "cookingNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ingredients" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "instructions" JSONB NOT NULL DEFAULT '[]';
