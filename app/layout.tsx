import type { Metadata } from "metadata"; // أو استيرادها بشكل صحيح حسب إصدار Next لديك
import "./globals.css";

export const metadata = {
  title: "الشركة الوطنية للتأمين - فرع بيتا",
  description: "فرع بيتا - صرح الشهيد، نقدم أفضل خدمات التأمين الشامل والمركبات",
  icons: {
    icon: "/images.jpeg", // ضع مسار أيقونة اللوجو الخاص بك هنا
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
