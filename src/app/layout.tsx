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
  title: "ApplyFlow | AI Job Application & Resume Automation",
  description: "Automate your job search with ApplyFlow. Audit ATS resume keywords, generate bespoke cold emails, and land interviews on autopilot.",
  keywords: ["AI job application", "ATS resume scanner", "cold email automation", "job search automation", "AI recruiting", "resume optimizer"],
  openGraph: {
    title: "ApplyFlow | AI Job Application & Resume Automation",
    description: "Automate your job search with ApplyFlow. Audit ATS resume keywords and generate cold emails instantly.",
    url: "https://applyflow.live",
    siteName: "ApplyFlow",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyFlow | AI Job Search Automation",
    description: "Land interviews on autopilot with our AI-powered ATS auditor and cold email engine.",
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
      "offers": {
        "@type": "Offer",
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
      "sameAs": [
        "https://twitter.com/applyflow",
        "https://linkedin.com/company/applyflow"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://applyflow.live"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does ApplyFlow bypass ATS scanners?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ApplyFlow uses natural language processing to extract missing structural keywords from job descriptions and seamlessly integrates them into your resume, increasing your ATS match score by up to 40%."
          }
        },
        {
          "@type": "Question",
          "name": "Can ApplyFlow generate cold emails automatically?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, our AI drafter creates hyper-personalized outreach emails based on your background and the specific job requirements."
          }
        }
      ]
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
