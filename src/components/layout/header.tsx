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
        <nav className="flex items-center gap-1.5">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-4 text-muted-foreground/50" />}
              {i < breadcrumb.length - 1 ? (
                <span className="text-muted-foreground">{item.label}</span>
              ) : (
                <span className="font-medium">{item.label}</span>
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
