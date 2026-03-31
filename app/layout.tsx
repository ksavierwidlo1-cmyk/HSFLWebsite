import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Elite Basketball Association (EBA) - Practical Basketball League",
    template: "%s | Elite Basketball Association"
  },
  description: "Official website of the Elite Basketball Association (EBA) - The premier Practical Basketball league on Roblox. Join the most competitive basketball community with live games, player stats, teams, and rankings.",
  keywords: [
    "Elite Basketball Association",
    "EBA",
    "Practical Basketball",
    "Roblox Basketball",
    "Basketball League",
    "EBA League",
    "Basketball Association",
    "Roblox Basketball League",
    "Practical Basketball League",
    "Competitive Basketball",
    "Basketball Stats",
    "Basketball Teams",
    "Basketball Players",
    "Live Basketball Games"
  ],
  authors: [{ name: "Elite Basketball Association" }],
  creator: "Elite Basketball Association",
  publisher: "Elite Basketball Association",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  metadataBase: new URL('https://ebassociation.com'),
  alternates: {
    canonical: 'https://ebassociation.com',
  },
  openGraph: {
    title: "Elite Basketball Association (EBA) - Practical Basketball League",
    description: "Official website of the Elite Basketball Association (EBA) - The premier Practical Basketball league on Roblox. Join the most competitive basketball community.",
    url: 'https://ebassociation.com',
    siteName: 'Elite Basketball Association',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'EBA - Elite Basketball Association Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Elite Basketball Association (EBA) - Practical Basketball",
    description: "Official website of the Elite Basketball Association - Premier Practical Basketball league on Roblox",
    images: ['/logo.png'],
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
    name: 'Elite Basketball Association',
    alternateName: 'EBA',
    url: 'https://ebassociation.com',
    logo: 'https://ebassociation.com/logo.png',
    description: 'The premier Practical Basketball league on Roblox featuring competitive gameplay, player stats, teams, and live games.',
    sport: 'Basketball',
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
