"use client";

import Link from "next/link";
import { ArrowRight, Crop, Eraser, Film, Maximize2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const highlights = [
  {
    label: "Local Only",
    value: "100% 本地处理",
    note: "无需上传，离线可用",
  },
  {
    label: "Batch Export",
    value: "ZIP 一键导出",
    note: "自动重命名与打包",
  },
  {
    label: "Smart Grid",
    value: "网格切片",
    note: "支持自定义行列",
  },
  {
    label: "AI Repair",
    value: "修复与擦除",
    note: "LaMa 本地推理",
  },
];

const tools = [
  {
    href: "/slicer",
    title: "图片裁剪分片",
    description: "网格切片序列，导出高清 ZIP 包。",
    detail: "拖拽 / 点击 / 粘贴 输入",
    kicker: "GRID CUT",
    tag: "Slice",
    icon: Crop,
    iconBox:
      "border-amber-200/70 bg-amber-200/40 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    glow:
      "from-amber-200/35 via-transparent to-transparent dark:from-amber-500/20",
    border:
      "hover:border-amber-300/70 dark:hover:border-amber-500/40",
    tagStyle:
      "border-amber-200/70 text-amber-700 dark:border-amber-500/30 dark:text-amber-200",
  },
  {
    href: "/scaler",
    title: "等比例缩放器",
    description: "长边缩放与批量导出，自动重命名。",
    detail: "批量拖拽 / 粘贴 / ZIP 打包",
    kicker: "RATIO SCALE",
    tag: "Batch",
    icon: Maximize2,
    iconBox:
      "border-emerald-200/70 bg-emerald-200/40 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
    glow:
      "from-emerald-200/35 via-transparent to-transparent dark:from-emerald-500/20",
    border:
      "hover:border-emerald-300/70 dark:hover:border-emerald-500/40",
    tagStyle:
      "border-emerald-200/70 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-200",
  },
  {
    href: "/gif-maker",
    title: "序列帧 GIF 生成",
    description: "按网格拆分精灵图，设置帧率后一键导出 GIF。",
    detail: "默认 6×4，可自定义行列与间隔",
    kicker: "FRAME TO GIF",
    tag: "Animate",
    icon: Film,
    iconBox:
      "border-sky-200/70 bg-sky-200/40 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200",
    glow: "from-sky-200/35 via-transparent to-transparent dark:from-sky-500/20",
    border: "hover:border-sky-300/70 dark:hover:border-sky-500/40",
    tagStyle:
      "border-sky-200/70 text-sky-700 dark:border-sky-500/30 dark:text-sky-200",
  },
  {
    href: "/watermark-remover",
    title: "Gemini 去水印",
    description: "使用 LaMa 模型移除 Gemini 水印。",
    detail: "本地推理 / 支持手动模型加载",
    kicker: "AI ERASE",
    tag: "Repair",
    icon: Eraser,
    iconBox:
      "border-rose-200/70 bg-rose-200/40 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
    glow:
      "from-rose-200/35 via-transparent to-transparent dark:from-rose-500/20",
    border: "hover:border-rose-300/70 dark:hover:border-rose-500/40",
    tagStyle:
      "border-rose-200/70 text-rose-700 dark:border-rose-500/30 dark:text-rose-200",
  },
];

const steps = [
  {
    title: "导入素材",
    description: "拖拽 / 粘贴 / 点击，立即进入处理流。",
  },
  {
    title: "批量处理",
    description: "裁剪、缩放、合成，参数可复用。",
  },
  {
    title: "导出交付",
    description: "ZIP 打包并自动命名，保持清晰结构。",
  },
];

export default function Home() {
  return (
    <main className="space-y-12">
      <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-background/85 p-8 shadow-[0_24px_70px_-55px_rgba(59,41,27,0.45)] backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(56rem_44rem_at_0%_0%,rgba(208,162,119,0.2),transparent),radial-gradient(40rem_32rem_at_100%_20%,rgba(130,158,142,0.16),transparent)] dark:opacity-35" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(66,49,33,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(66,49,33,0.06)_1px,transparent_1px)] [background-size:30px_30px] dark:opacity-15" />
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <Badge
                variant="secondary"
                className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
              >
                Offline First
              </Badge>
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
                Local Render
              </span>
            </div>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">
              图像处理工作台
              <span className="mt-2 block text-lg font-medium text-muted-foreground md:text-xl">
                一站式本地工具箱，专注高效率产出。
              </span>
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              所有图像处理在浏览器内完成，不经服务器。适合素材拆分、批量
              缩放、序列帧合成与水印修复等工作流。
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {["拖拽 / 粘贴 / 点击", "ZIP 批量导出", "自动重命名"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/60 bg-background/70 px-3 py-1"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border/70 bg-background/85 p-4 shadow-[0_18px_40px_-32px_rgba(59,41,27,0.4)] backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-3"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 font-display text-2xl">{item.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div
                  className={cn(
                    "relative h-full overflow-hidden rounded-3xl border border-border/70 bg-background/85 p-6 shadow-[0_24px_60px_-50px_rgba(59,41,27,0.42)] backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1",
                    tool.border,
                    "animate-in fade-in-0 slide-in-from-bottom-4",
                  )}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                      "bg-[radial-gradient(50%_50%_at_20%_0%,var(--tw-gradient-from),transparent)]",
                      tool.glow,
                    )}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <div
                      className={cn(
                        "rounded-2xl border px-3 py-2",
                        tool.iconBox,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {tool.kicker}
                    </span>
                  </div>
                  <div className="relative z-10 mt-5 space-y-2">
                    <h3 className="font-display text-2xl">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                  <div className="relative z-10 mt-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tool.detail}</span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
                        tool.tagStyle,
                      )}
                    >
                      {tool.tag}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
