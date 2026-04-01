import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title?: string;
  breadcrumb?: BreadcrumbItem[];
}

export function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav className="flex items-center gap-2 text-base">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground/50">›</span>}
              {i < breadcrumb.length - 1 ? (
                <span className="text-muted-foreground/60">{item.label}</span>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : (
        title && <h1 className="font-medium">{title}</h1>
      )}
    </header>
  );
}
