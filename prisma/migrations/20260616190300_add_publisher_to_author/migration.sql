-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "publisherId" INTEGER;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
