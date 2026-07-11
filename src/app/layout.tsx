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
  description: "Automate your job search with ApplyFlow. Audit ATS resume keywords, generate bespoke cold emails, and land interviews on autopilot.",
  keywords: ["AI job application", "ATS resume scanner", "cold email automation", "job search automation", "AI recruiting", "resume optimizer", "ATS friendly resume", "cover letter generator"],
  authors: [{ name: "ApplyFlow Team", url: "https://applyflow.live" }],
  creator: "ApplyFlow",
  publisher: "ApplyFlow Inc.",
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
    description: "Automate your job search with ApplyFlow. Audit ATS resume keywords and generate cold emails instantly.",
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
    description: "Land interviews on autopilot with our AI-powered ATS auditor and cold email engine.",
    images: ["/hero-bg.png"],
    creator: "@applyflow",
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
          "name": "Do I need to know how to code?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No! Our visual builder and AI generator let you build workflows with plain text."
          }
        },
        {
          "@type": "Question",
          "name": "What email providers do you support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We natively support Gmail, Outlook, and custom IMAP/SMTP domains for seamless sending."
          }
        },
        {
          "@type": "Question",
          "name": "How many workflows can I build?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Free users can build 1 active workflow, while Pro users have unlimited workflows and advanced AI generation capabilities."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data secure?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. We use enterprise-grade encryption and never sell your data to third parties. Your email credentials are fully encrypted."
          }
        }
      ]
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Login",
      "url": "https://applyflow.live/login"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Sign Up",
      "url": "https://applyflow.live/signup"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Privacy Policy",
      "url": "https://applyflow.live/privacy"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Terms of Service",
      "url": "https://applyflow.live/terms"
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
