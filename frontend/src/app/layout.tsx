import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeySalad ® Tasha",
  description: "AI-powered food analysis and waste reduction platform. Connect your wallet, analyze food with AI, and earn tokens for sustainable choices.",
  keywords: "food analysis, AI, sustainability, blockchain, tokens, food waste reduction",
  authors: [{ name: "HeySalad" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "HeySalad ® Tasha",
    description: "AI-powered food analysis and waste reduction platform",
    type: "website",
    siteName: "HeySalad ® Tasha"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
