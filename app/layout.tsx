import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "الشركة الوطنية للتأمين - فرع بيتا",
  description: "فرع بيتا - صرح الشهيد، نقدم أفضل خدمات التأمين الشامل والمركبات",
  icons: {
    icon: [
      { url: '/images.jpeg' },
      { url: '/images.jpeg', sizes: '32x32', type: 'image/jpeg' },
    ],
    apple: { url: '/images.jpeg' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
