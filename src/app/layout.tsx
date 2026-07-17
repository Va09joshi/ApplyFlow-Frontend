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
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://applyflow.live"),
  title: {
    default: "ApplyFlow | AI Job Application & Resume Automation",
    template: "%s | ApplyFlow",
  },
  description: "Automate your job search with ApplyFlow. Audit ATS resume keywords, generate bespoke cold emails, and land interviews on autopilot. Created by Vaibhav Joshi.",
  keywords: ["AI job application", "ATS resume scanner", "cold email automation", "job search automation", "AI recruiting", "resume optimizer", "ATS friendly resume", "cover letter generator", "Vaibhav Joshi"],
  authors: [{ name: "Vaibhav Joshi", url: "https://vaibhavjoshi.com" }],
  creator: "Vaibhav Joshi",
  publisher: "Vaibhav Joshi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "ApplyFlow | AI Job Application & Resume Automation",
    description: "Automate your job search with ApplyFlow. Audit ATS resume keywords and generate cold emails instantly. Created by Vaibhav Joshi.",
    url: "https://applyflow.live",
    siteName: "ApplyFlow",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "ApplyFlow AI Dashboard",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyFlow | AI Job Search Automation",
    description: "Land interviews on autopilot with our AI-powered ATS auditor and cold email engine. Built by Vaibhav Joshi.",
    images: ["/hero-bg.png"],
    creator: "@vaibhavjoshi",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "ApplyFlow AI",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "author": {
        "@type": "Person",
        "name": "Vaibhav Joshi"
      },
      "creator": {
        "@type": "Person",
        "name": "Vaibhav Joshi"
      },
      "description": "AI-powered job search automation platform created by Vaibhav Joshi.",
      "offers": {
        "@type": "Offer",
        "url": "https://applyflow.live",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      }
    },
    {
      "@type": "Organization",
      "name": "ApplyFlow",
      "url": "https://applyflow.live",
      "logo": "https://applyflow.live/icon.svg",
      "founder": {
        "@type": "Person",
        "name": "Vaibhav Joshi"
      }
    },
    {
      "@type": "Person",
      "name": "Vaibhav Joshi",
      "jobTitle": "Software Engineer & Founder",
      "worksFor": {
        "@type": "Organization",
        "name": "ApplyFlow"
      }
    },
    {
      "@type": "WebSite",
      "name": "ApplyFlow",
      "url": "https://applyflow.live",
      "author": {
        "@type": "Person",
        "name": "Vaibhav Joshi"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
