import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import AppSidebar from "./AppSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="flex h-full">
        <aside className="hidden h-screen w-72 shrink-0 border-r bg-white lg:block">
          <AppSidebar />
        </aside>

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-white/95 px-4 backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>

                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <AppSidebar />
                </SheetContent>
              </Sheet>

              <div>
                <p className="text-base font-semibold text-slate-900">EZPark Admin</p>
                <p className="text-xs text-slate-500">Dashboard</p>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}