<<<<<<< HEAD
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشركة الوطنية للتأمين - فرع بيتا',
  description: 'موقع خدمات التأمين',
=======
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "الشركة الوطنية للتأمين - فرع بيتا",
  description: "فرع بيتا - صرح الشهيد، نقدم أفضل خدمات التأمين الشامل والمركبات",
  icons: {
    icon: "/images.jpeg",
  },
>>>>>>> 57c2c69f93915a4d8c24b19fb393d5bce9f6cb3b
};
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#047857" />
</head>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
<<<<<<< HEAD
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-slate-50 text-slate-800 font-sans antialiased">
=======
      <body className="font-sans bg-slate-50 text-slate-800">
>>>>>>> 57c2c69f93915a4d8c24b19fb393d5bce9f6cb3b
        {children}
      </body>
    </html>
  );
}