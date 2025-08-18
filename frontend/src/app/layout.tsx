import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Waste Reduction Platform",
  description: "Use blockchain to reduce food waste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}