'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = "/images.jpeg";
const WHATSAPP_NUMBER = "970592017101";
const BRANCH_LOCATION = "جنوب نابلس - بيتا - صرح الشهيد";

interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

interface SiteSettings {
  branch_name: string;
  manager_name: string;
  working_status_mode: string;
  ticker_text: string;
  ticker_enabled: boolean;
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    branch_name: 'شركة التأمين الوطنية - فرع بيتا',
    manager_name: 'إدارة الفرع',
    working_status_mode: 'auto',
    ticker_text: 'أهلاً بكم في شركة التأمين الوطنية - فرع بيتا',
    ticker_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // جلب الخدمات
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (servicesData) setServices(servicesData);

    // جلب الإعدادات
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsData) {
      setSettings(settingsData);
    }
    setLoading(false);
  };

  // حساب حالة الدوام بناءً على الخيار المحدد
  const getWorkingStatus = () => {
    if (settings.working_status_mode === 'open') return { isOpen: true, text: 'مفتوح الآن' };
    if (settings.working_status_mode === 'closed') return { isOpen: false, text: 'مغلق حالياً' };

    // الوضع الأوتوماتيكي
    const now = new Date();
    const day = now.getDay(); // 0: Sunday, 6: Saturday
    const hours = now.getHours();

    // العطلة الجمعة (5) والسبت (6) أو خارج الأوقات من 8 صباحاً إلى 3 مساءً
    if (day === 5 || day === 6 || hours < 8 || hours >= 15) {
      return { isOpen: false, text: 'مغلق حالياً' };
    }
    return { isOpen: true, text: 'مفتوح الآن' };
  };

  const status = getWorkingStatus();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16" dir="rtl">
      
      {/* الشريط المتحرك (Ticker) */}
      {settings.ticker_enabled && settings.ticker_text && (
        <div className="bg-emerald-900 text-white text-xs md:text-sm font-medium py-2 px-4 overflow-hidden shadow-inner">
          <div className="whitespace-nowrap animate-marquee flex items-center justify-around">
            <span>📢 {settings.ticker_text}</span>
          </div>
        </div>
      )}

      {/* الهيدر الرئيسي */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="NIC Logo" className="h-12 w-auto object-contain rounded-lg" />
            <div>
              <h1 className="font-black text-base md:text-lg text-slate-900 leading-tight">
                {settings.branch_name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">إدارة: {settings.manager_name}</p>
            </div>
          </div>

          {/* شارة حالة العمل */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              status.isOpen ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              {status.text}
            </span>
          </div>
        </div>
      </header>

      {/* القسم الرئيسي / الهيرو */}
      <section className="bg-gradient-to-b from-emerald-900 to-slate-900 text-white py-14 px-4 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full inline-block">
            برامج التأمين المتميزة
          </span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            خدماتنا التأمينية المتميزة
          </h2>
          <p className="text-slate-300 text-sm md:text-base font-normal max-w-xl mx-auto">
            نوفر لكم أفضل التغطيات التأمينية الشاملة بأعلى معايير الجودة والسرعة في الخدمة.
          </p>
          <div className="pt-2 text-xs text-slate-400 font-medium">
            📍 {BRANCH_LOCATION}
          </div>
        </div>
      </section>

      {/* قسم كروت الخدمات */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm font-bold">جاري تحميل الخدمات...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-medium">لا توجد خدمات مضافة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              // تقسيم النص للنقاط منظم
              const descriptionPoints = service.description
                ? service.description.split(/(?<=[.:!؟])\s+/).filter(p => p.trim().length > 0)
                : [];

              return (
                <div 
                  key={service.id} 
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* الصورة */}
                  <div className="h-52 w-full bg-slate-100 relative overflow-hidden">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 text-2xl font-black">
                        NIC
                      </div>
                    )}
                  </div>

                  {/* التفاصيل المنسقة */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {service.title}
                      </h3>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {descriptionPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600 leading-relaxed">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* زر التواصل */}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`مرحباً، أستفسر عن: ${service.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>💬</span> طلب استشارة أو استفسار
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* الفوتر */}
      <footer className="max-w-6xl mx-auto px-4 pt-8 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
        <p>© {new Date().getFullYear()} {settings.branch_name}. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
