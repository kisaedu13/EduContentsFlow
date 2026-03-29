import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { WorkflowEditor } from "@/components/templates/workflow-editor";

export default async function NewTemplatePage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "ADMIN") redirect("/dashboard");

  return (
    <>
      <Header title="새 템플릿 만들기" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <WorkflowEditor />
        </div>
      </main>
    </>
  );
}
