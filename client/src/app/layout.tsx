import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AuthInitializer from "@/components/providers/AuthInitializer";
import SessionManager from "@/components/providers/SessionManager";
import { AuthModal } from "@/components/pages/auth/AuthModal";
import { Toaster } from "sonner";
import Background from "@/components/pages/home/Background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ SEO & Social Media Metadata
export const metadata: Metadata = {
  // Basic Metadata
  title: {
    default: "PartyGo - Your Campus Nightlife Guide",
    template: "%s | PartyGo",
  },
  description:
    "Discover the best student parties, bar deals, and events happening around campus. Stop searching, start partying with PartyGo.",
  keywords: [
    "student events",
    "campus parties",
    "college nightlife",
    "bar deals",
    "clubs near me",
  ],

  // Open Graph (for Facebook, LinkedIn, etc.)
  openGraph: {
    title: "PartyGo - Your Campus Nightlife Guide",
    description:
      "Discover the best student parties, bar deals, and events happening around campus.",
    url: "https://your-production-url.com", // Replace with your actual production URL
    siteName: "PartyGo",
    images: [
      {
        url: "https://res.cloudinary.com/djtww0vax/image/upload/v1756551535/party_ssbqhi.png",
        width: 1200,
        height: 630,
        alt: "A vibrant party scene representing PartyGo events",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "PartyGo - Your Campus Nightlife Guide",
    description:
      "Discover the best student parties, bar deals, and events happening around campus.",
    images: [
      "https://res.cloudinary.com/djtww0vax/image/upload/v1756551535/party_ssbqhi.png",
    ],
  },

  // Icons and Manifest
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthInitializer>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Background />
              <Toaster position="top-center" />
              <AuthModal />
              <SessionManager />
              {children}
            </ThemeProvider>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
