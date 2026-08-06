// src/app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "../../config";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
  description: siteConfig.brand.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
