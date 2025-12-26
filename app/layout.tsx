import "./globals.css";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

import Providers from "./providers";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

export const metadata = {
  title: "image-tool",
  description: "图片裁剪分片与等比例缩放，纯前端本地处理",
  icons: {
    icon: "/icon.svg", // Reference to the SVG icon in the public directory
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          notoSans.variable,
          notoSerif.variable,
        )}
      >
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
