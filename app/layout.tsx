import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "High School Football League (HSFL)",
    template: "%s | High School Football League"
  },
  description: "Official website of the High School Football League (HSFL). Follow teams, track player stats, view standings, and stay up to date with every game.",
  keywords: [
    "High School Football League",
    "HSFL",
    "High School Football",
    "Football League",
    "Football Stats",
    "Football Teams",
    "Football Players",
    "Football Rankings",
    "Football Standings"
  ],
  authors: [{ name: "High School Football League" }],
  creator: "High School Football League",
  publisher: "High School Football League",
  openGraph: {
    title: "High School Football League (HSFL)",
    description: "Official website of the High School Football League. Follow teams, track player stats, and stay up to date with every game.",
    siteName: 'High School Football League',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "High School Football League (HSFL)",
    description: "Official website of the High School Football League",
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
  verification: {
    // Add your Google Search Console verification code here when you get it
    // google: 'your-verification-code',
  },
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'High School Football League',
    alternateName: 'HSFL',
    description: 'The premier high school football league featuring competitive gameplay, player stats, teams, and live games.',
    sport: 'Football',
    sameAs: [
      // Add your social media links here when available
      // 'https://twitter.com/EBA',
      // 'https://discord.gg/yourserver',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
