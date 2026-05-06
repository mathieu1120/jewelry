import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const geist = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "The Shop",
  description: "Handmade jewelry & art",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
