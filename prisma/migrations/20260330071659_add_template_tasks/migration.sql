-- CreateTable
CREATE TABLE "template_tasks" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "depth" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "template_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "template_tasks_templateId_parentId_sortOrder_idx" ON "template_tasks"("templateId", "parentId", "sortOrder");

-- AddForeignKey
ALTER TABLE "template_tasks" ADD CONSTRAINT "template_tasks_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workflow_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tasks" ADD CONSTRAINT "template_tasks_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "template_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
