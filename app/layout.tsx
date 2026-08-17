import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeBootstrapScript } from "@/components/theme/theme-provider";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { MobileHeader } from "@/components/nav/mobile-header";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calcflow.app"),
  title: {
    default: "CalcFlow — Every calculation. One simple app.",
    template: "%s · CalcFlow",
  },
  description:
    "CalcFlow is a fast, installable calculator super-app: mortgage, loan, BMI, percentage, scientific, and more - all free, no login, works offline.",
  applicationName: "CalcFlow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalcFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c14" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <div className="flex min-h-dvh w-full">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileHeader />
              <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5 pb-24 md:pb-10 md:px-8 md:py-8">
                {children}
              </main>
            </div>
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
