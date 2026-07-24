import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "الشركة الوطنية للتأمين - فرع بيتا",
  description: "موقع خدمات التأمين",
  manifest: "/manifest.json",
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#047857" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
