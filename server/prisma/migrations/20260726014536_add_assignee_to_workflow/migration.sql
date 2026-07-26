-- AlterTable
ALTER TABLE "WorkflowRequest" ADD COLUMN     "assignedToId" TEXT;

-- AddForeignKey
ALTER TABLE "WorkflowRequest" ADD CONSTRAINT "WorkflowRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
