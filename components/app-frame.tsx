"use client";

import { ReactNode } from "react";
import Sidebar from "@/app/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-70 [background:radial-gradient(56rem_56rem_at_0%_0%,rgba(204,132,86,0.18),transparent),radial-gradient(42rem_32rem_at_100%_10%,rgba(120,148,134,0.14),transparent)] dark:opacity-35" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(66,49,33,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(66,49,33,0.06)_1px,transparent_1px)] [background-size:30px_30px] dark:opacity-20" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[120rem] flex-1 gap-6 px-4 py-10 sm:px-6 lg:px-10">
          <aside className="hidden w-64 flex-none rounded-[30px] border border-border/70 bg-background/85 p-6 shadow-[0_24px_60px_-52px_rgba(59,41,27,0.45)] backdrop-blur-sm lg:block">
            <Sidebar />
          </aside>
          <main className="flex-1 rounded-[30px] border border-border/70 bg-background/90 p-6 shadow-[0_24px_60px_-52px_rgba(59,41,27,0.45)] backdrop-blur-sm">
            <div className="mb-6 lg:hidden">
              <Sidebar />
            </div>
            <div className="w-full min-w-0">{children}</div>
          </main>
        </div>
        <footer className="border-t border-border/60 bg-background/70 py-6 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-[120rem] flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">image-tool</span>
              <span>纯前端离线可用</span>
              <span>© HSn</span>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a
                href="https://github.com/HSn0918/image-tool"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
