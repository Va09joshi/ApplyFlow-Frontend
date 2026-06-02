import type { Metadata } from "next";
import { Lexend_Deca, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleProvider } from "@/providers/google-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const lexend = Lexend_Deca({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://applyflow.live"),
  title: "ApplyFlow AI - Clean, Good, and Make More Automation",
  description: "Automate your job applications, email generation, and ATS analysis with a clean and good platform to make more progress.",
  keywords: ["clean", "good", "make more", "job application", "automation", "AI", "ApplyFlow"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${lexend.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </GoogleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
