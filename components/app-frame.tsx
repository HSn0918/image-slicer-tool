"use client";

import { ReactNode } from "react";
import Sidebar from "@/app/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f6f1e9] text-foreground dark:bg-[#0b0d12]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(60rem_60rem_at_0%_0%,rgba(244,114,94,0.18),transparent),radial-gradient(50rem_40rem_at_100%_0%,rgba(56,189,248,0.16),transparent)] dark:opacity-40" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-20" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[120rem] flex-1 gap-6 px-4 py-10 sm:px-6 lg:px-10">
          <aside className="hidden w-64 flex-none rounded-[28px] border border-border/70 bg-background/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm lg:block">
            <Sidebar />
          </aside>
          <main className="flex-1 rounded-[28px] border border-border/70 bg-background/85 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm">
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
