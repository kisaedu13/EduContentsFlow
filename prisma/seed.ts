import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 기본 워크플로우 템플릿: 안전보건교육 콘텐츠
  const existing = await prisma.workflowTemplate.findFirst({
    where: { name: "안전보건교육 콘텐츠" },
  });

  if (existing) {
    console.log("시드 데이터가 이미 존재합니다.");
    return;
  }

  await prisma.workflowTemplate.create({
    data: {
      name: "안전보건교육 콘텐츠",
      description: "PT 원고 + 영상 제작 표준 워크플로우",
      tracks: {
        create: [
          {
            name: "PT",
            sortOrder: 0,
            phases: {
              create: [
                { name: "초안 작성", sortOrder: 0 },
                { name: "검토", sortOrder: 1 },
                { name: "수정본 제출", sortOrder: 2 },
              ],
            },
          },
          {
            name: "영상",
            sortOrder: 1,
            phases: {
              create: [
                { name: "제작중", sortOrder: 0 },
                { name: "제작본 제출", sortOrder: 1 },
                { name: "수정중", sortOrder: 2 },
                { name: "수정본 제출", sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("기본 템플릿 시드 완료: 안전보건교육 콘텐츠");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
