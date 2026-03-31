export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-primary p-10 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur-sm">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">EduContentsFlow</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            교육 콘텐츠 제작<br />
            프로젝트 관리 시스템
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            대한산업안전협회 안전보건교육본부의<br />
            교육 콘텐츠 제작 업무를 체계적으로 관리합니다.
          </p>
          <div className="flex gap-6 text-xs text-primary-foreground/50">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-foreground/80">Flow</div>
              <div>업무 흐름 관리</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-foreground/80">Gantt</div>
              <div>일정 시각화</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-foreground/80">Team</div>
              <div>팀 협업</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/40">
          &copy; 대한산업안전협회 안전보건교육본부
        </p>
      </div>

      {/* Form Area */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        {children}
      </div>
    </div>
  );
}
