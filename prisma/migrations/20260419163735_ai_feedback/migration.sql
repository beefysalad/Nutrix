-- CreateEnum
CREATE TYPE "AiMealFeedback" AS ENUM ('accurate', 'inaccurate');

-- AlterTable
ALTER TABLE "MealEntry" ADD COLUMN     "aiFeedback" "AiMealFeedback";
