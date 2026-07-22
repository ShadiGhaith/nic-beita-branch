'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  ticker_text: string;
  ticker_enabled: boolean;
  working_status_mode: string; // 'auto' | 'open' | 'closed'
}

export default function NICPalestineLanding() {
  const [settings, setSettings] = useState<SiteSettings>({
    branch_name: 'فرع بيتا',
    manager_name: 'غيث فايز أحمد',
    ticker_text: 'خصومات على كافة التأمينات تصل الى 10%',
    ticker_enabled: true,
    working_status_mode: 'auto',
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    fetchData();

    // تحديث الساعة المباشرة في كرت الدوام
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const { data: settingsData } = await supabase.from('site_settings').select('*').single();
      if (settingsData) setSettings(settingsData);

      const { data: servicesData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (servicesData) setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 دالة احتساب حالة الدوام التشغيلية
  const getWorkingStatus = () => {
    // 1. التحكم اليدوي من لوحة التحكم
    if (settings.working_status_mode === 'open') {
      return {
        isOpen: true,
        text: "مفتوح الآن",
        message: "أهلاً بك! نستقبل المراجعين حالياً لخدمتكم وإصدار وثائق التأمين.",
        color: "bg-emerald-500",
        textColor: "text-emerald-700",
        bgLight: "bg-emerald-50"
      };
    }
    if (settings.working_status_mode === 'closed') {
      return {
        isOpen: false,
        text: "مغلق حالياً",
        message: "المكتب مغلق حالياً. نسعد بخدمتكم خلال أوقات العمل الرسمية.",
        color: "bg-rose-500",
        textColor: "text-rose-700",
        bgLight: "bg-rose-50"
      };
    }

    // 2. التحكم التلقائي بناءً على الوقت الحالي (الأحد - الخميس: 9:00 ص إلى 4:00 م)
    const now = new Date();
    const day = now.getDay(); // 0 = الأحد, ..., 4 = الخميس, 5 = الجمعة, 6 = السبت
    const hours = now.getHours();

    const isWorkingDay = day >= 0 && day <= 4;
    const isWorkingHours = hours >= 9 && hours < 16;

    if (isWorkingDay && isWorkingHours) {
      return {
        isOpen: true,
        text: "مفتوح الآن",
        message: "أهلاً بك! يستقبل المكتب المراجعين حالياً لخدمتكم وإصدار وثائق التأمين.",
        color: "bg-emerald-500",
        textColor: "text-emerald-700",
        bgLight: "bg-emerald-50"
      };
    }

    let closedReason = "انتهى دوام اليوم الرسمي. نسعد بخدمتكم غداً بدءاً من الساعة 9:00 صباحاً.";
    if (!isWorkingDay) {
      closedReason = "اليوم عطلة أسبوعية للمكتب. نسعد بخدمتكم يوم الأحد القادم الساعة 9:00 صباحاً.";
    } else if (hours < 9) {
      closedReason = "المكتب مغلق حالياً. يفتح المكتب أبوابه اليوم الساعة 9:00 صباحاً.";
    }

    return {
      isOpen: false,
      text: "مغلق حالياً",
      message: closedReason,
      color: "bg-rose-500",
      textColor: "text-rose-700",
      bgLight: "bg-rose-50"
    };
  };

  const status = getWorkingStatus();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth" dir="rtl">
      
      {/* 1. الشريط المتحرك العاجل */}
      {settings.ticker_enabled && settings.ticker_text && (
        <div className="bg-red-600 text-white flex items-center h-10 px-4 overflow-hidden border-b border-red-700 shadow-sm">
          <span className="bg-white text-red-700 text-xs font-black px-3 py-1 rounded-md shrink-0 z-10 flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            تحديثات
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full mr-3">
            <div className="inline-block animate-marquee font-bold text-xs md:text-sm text-white">
              {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}
            </div>
          </div>
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              display: inline-block;
              animation: marquee 22s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
        </div>
      )}

      {/* 2. الهيدر العلوي مع شارة حالة الدوام (بدون إنجازاتنا) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <a href="/admin" title="لوحة التحكم">
              <img 
                src={LOGO_URL} 
                alt="شركة التأمين الوطنية" 
                className="h-10 md:h-12 w-auto object-contain rounded-md hover:opacity-80 transition-opacity cursor-pointer"
              />
            </a>
            <div className="border-r-2 border-emerald-600 pr-3 my-1">
              <h1 className="font-extrabold text-slate-900 text-base md:text-lg leading-tight">
                الشركة الوطنية للتأمين
              </h1>
              <p className="text-xs text-emerald-700 font-bold">
                {settings.branch_name || 'فرع بيتا'}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#about" className="hover:text-emerald-700 transition-colors">عن الشركة</a>
            <a href="#services" className="hover:text-emerald-700 transition-colors">خدماتنا التأمينية</a>
            <a href="#contact" className="hover:text-emerald-700 transition-colors">تواصل معنا</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* شارة حالة الدوام المباشرة بالهيدر */}
            <div className={`hidden sm:flex items-center gap-2 ${status.bgLight} border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm`}>
              <span className={`w-2.5 h-2.5 rounded-full ${status.color} ${status.isOpen ? 'animate-ping' : ''}`}></span>
              <span className={status.textColor}>{status.text}</span>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow hover:shadow-md flex items-center gap-2"
            >
              <span>💬</span> اتصل بنا الآن
            </a>
          </div>

        </div>
      </header>

      {/* 3. القسم الرئيسي (Hero) */}
      <section className="bg-emerald-800 text-white py-20 px-4 text-center relative shadow-inner">
        <div className="max-w-4xl mx-auto space-y-5">
          <span className="inline-block bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-extrabold px-4 py-1.5 rounded-full text-xs shadow-sm">
            ☂️ الأمان والحماية الفائقة لرأس مالك وعائلتك
          </span>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-snug">
            الشركة الوطنية للتأمين - {settings.branch_name}
          </h2>
          
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            نوفر أوسع نطاق تغطية تأمينية في فلسطين للمركبات، التأمين الصحي، الشامل والممتلكات مع خدمة عملاء ممتازة.
          </p>
          
          {settings.manager_name && (
            <div className="pt-2">
              <span className="inline-block bg-emerald-950/60 border border-emerald-600/50 px-5 py-2 rounded-full text-xs text-emerald-200 font-semibold shadow">
                👔 تحت إدارة المدير: <strong className="text-white">{settings.manager_name}</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 4. قسم خدماتنا التأمينية (مع حل مشكلة scroll-mt-28) */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-28">
        <div className="text-center mb-12">
          <span className="text-emerald-800 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-md">
            برامج التأمين
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            خدماتنا التأمينية المتميزة
          </h2>
          <div className="w-16 h-1 bg-emerald-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">جاري تحميل الخدمات...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
            لا توجد خدمات مضافة حالياً. يمكنك إضافتها من لوحة التحكم.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const waMessage = encodeURIComponent(`مرحباً ${settings.branch_name}، أرغب بالحصول على استشارة واستفسار حول خدمة: (${service.title})`);
              const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

              return (
                <div 
                  key={service.id} 
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
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

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span>💬</span> طلب استشارة عبر الواتساب
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. قسم عن الشركة (مع حل مشكلة scroll-mt-28) */}
      <section id="about" className="bg-white border-y border-slate-200 py-16 px-6 scroll-mt-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
              عن الشركة
            </span>
            <h2 className="text-3xl font-black text-slate-900 leading-snug">
              خبرة وثقة متواصلة في تقديم أجود الخدمات التأمينية
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              تسعى الشركة الوطنية للتأمين لتوفير بيئة آمنة للمواطنين والمؤسسات في فلسطين من خلال حزمة شاملة من الحلول التأمينية الشاملة والمصممة لتلبي الاحتياجات بكل دقة وسرعة في تسوية التعويضات.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">+25</div>
              <div className="text-xs font-bold text-slate-600">عقود من الخبرة</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">100%</div>
              <div className="text-xs font-bold text-slate-600">التزام بالتعويضات</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">24/7</div>
              <div className="text-xs font-bold text-slate-600">دعم متواصل</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">+10k</div>
              <div className="text-xs font-bold text-slate-600">عميل ومؤمّن</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. قسم تواصل معنا وقسم ساعات العمل المتكامل */}
      <section id="contact" className="bg-slate-100 py-16 px-6 border-t border-slate-200 scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-emerald-800 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-md">
              نحن هنا لخدمتك
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              تواصل مع {settings.branch_name}
            </h2>
            <p className="text-slate-600 text-sm mt-1">يسعدنا استقبال استفساراتك وزيارتك في مقر الفرع</p>
            <div className="w-16 h-1 bg-emerald-600 mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                📍
              </div>
              <h3 className="font-bold text-slate-900 mb-1">موقع الفرع</h3>
              <p className="text-xs text-slate-600 font-semibold">{BRANCH_LOCATION}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                📞
              </div>
              <h3 className="font-bold text-slate-900 mb-1">الاتصال والمحادثة</h3>
              <p className="text-xs text-slate-600 mb-3">{WHATSAPP_NUMBER}</p>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg border border-emerald-200 transition-all shadow-sm"
              >
                محادثة واتساب مباشرة
              </a>
            </div>

            {/* 🟢 كرت ساعات العمل وحالة الدوام التفاعلي الكامل */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ⏰
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">حالة الدوام</h3>
                </div>
                {currentTime && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                    {currentTime}
                  </span>
                )}
              </div>

              <div className="text-center space-y-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black ${status.textColor} ${status.bgLight} px-3 py-1 rounded-full border border-slate-200`}>
                  <span className={`w-2 h-2 rounded-full ${status.color} ${status.isOpen ? 'animate-ping' : ''}`}></span>
                  {status.text}
                </span>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {status.message}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>أيام العمل:</span>
                  <strong className="text-slate-800">الأحد - الخميس (9:00 ص - 4:00 م)</strong>
                </div>
                <div className="flex justify-between">
                  <span>العطلة الأسبوعية:</span>
                  <strong className="text-slate-800">الجمعة والسبت</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. الفووتر */}
      <footer className="bg-emerald-950 text-emerald-100/80 py-12 px-6 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm">
          <div>
            <h3 className="text-white font-bold text-base mb-3">الشركة الوطنية للتأمين</h3>
            <p className="text-xs leading-relaxed text-emerald-200/70">
              {settings.branch_name} - تقديم كافة خدمات التأمين العام، التأمين الشامل، والمعدات بأعلى معايير الجودة والتسهيلات.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-3">روابط سريعة</h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-emerald-400 transition-colors">الخدمات التأمينية</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">عن الشركة</a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition-colors">تواصل معنا</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-3">إدارة الفرع</h3>
            <p className="text-xs text-emerald-200/70">الموقع: {BRANCH_LOCATION}</p>
            <p className="text-xs text-emerald-200/70 mt-1">إدارة الفرع: {settings.manager_name}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-emerald-900/60 text-center text-xs text-emerald-300/50">
          جميع الحقوق محفوظة © {new Date().getFullYear()} - الشركة الوطنية للتأمين (NIC)
        </div>
      </footer>

    </div>
  );
}