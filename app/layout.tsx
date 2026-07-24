import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشركة الوطنية للتأمين - فرع بيتا',
  description: 'موقع خدمات التأمين',
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
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-slate-50 text-slate-800 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}