"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskTable } from "@/components/tasks/task-table";
import { AnnouncementBoard } from "@/components/announcements/announcement-board";
import { ClipboardList, Calendar, Megaphone } from "lucide-react";

interface RawTask {
  id: string;
  parentId: string | null;
  name: string;
  status: string;
  assigneeId: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  depth: number;
  sortOrder: number;
  assignee: { name: string } | null;
}

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: string;
}

interface Profile {
  id: string;
  name: string;
}

interface ProjectTabsProps {
  projectId: string;
  tasks: RawTask[];
  announcements: AnnouncementData[];
  profiles: Profile[];
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
  ganttChart: React.ReactNode;
}

export function ProjectTabs({
  projectId,
  tasks,
  announcements,
  profiles,
  currentUserId,
  currentUserName,
  isAdmin,
  ganttChart,
}: ProjectTabsProps) {
  return (
    <Tabs defaultValue="tasks">
      <TabsList variant="line">
        <TabsTrigger value="tasks">
          <ClipboardList className="size-4" />
          업무
        </TabsTrigger>
        <TabsTrigger value="schedule">
          <Calendar className="size-4" />
          일정
        </TabsTrigger>
        <TabsTrigger value="announcements">
          <Megaphone className="size-4" />
          알림방
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tasks">
        <TaskTable projectId={projectId} tasks={tasks} profiles={profiles} />
      </TabsContent>

      <TabsContent value="schedule">
        {ganttChart}
      </TabsContent>

      <TabsContent value="announcements">
        <AnnouncementBoard
          projectId={projectId}
          announcements={announcements}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isAdmin={isAdmin}
        />
      </TabsContent>
    </Tabs>
  );
}
