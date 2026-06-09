import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Sowmyakka - Authentic Artisan Crafts",
  description: "Discover beautiful handcrafted artisan products including paintings, pottery, home decor, textiles, and jewelry from talented artisans.",
  keywords: ["artisan", "handcrafted", "paintings", "pottery", "home decor", "textiles", "jewelry"],
  authors: [{ name: "Sowmyakka" }],
  creator: "Sowmyakka",
  publisher: "Sowmyakka",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sowmyakka.com",
    title: "Sowmyakka - Authentic Artisan Crafts",
    description: "Discover beautiful handcrafted artisan products from talented artisans.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sowmyakka Artisan Crafts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sowmyakka - Authentic Artisan Crafts",
    description: "Discover beautiful handcrafted artisan products from talented artisans.",
    images: ["/twitter-image.jpg"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#009688" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-foreground">{children}</body>
    </html>
  );
}
