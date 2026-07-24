'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = "/images.jpeg";
const WHATSAPP_NUMBER = "970592017101";
const BRANCH_LOCATION = "جنوب نابلس - بيتا - صرح الشهيد";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/3oQ8G5nU9vT2QGfP8";

interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order?: number;
}

interface SiteSettings {
  branch_name: string;
  manager_name: string;
  ticker_text: string;
  ticker_enabled: boolean;
  working_status_mode: string;
}

function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const lines = text.split('\n').filter(p => p.trim().length > 0);
  const previewText = lines[0] || '';
  const hasMore = lines.length > 1 || text.length > 90;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs md:text-sm text-slate-600 leading-relaxed">
      <p className="whitespace-pre-line">{isExpanded ? text : previewText}</p>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-emerald-600 hover:text-emerald-800 font-bold text-xs inline-flex items-center gap-1 transition-colors mt-1 focus:outline-none"
        >
          {isExpanded ? '▲ إخفاء التفاصيل' : '▼ عرض التفاصيل الكاملة'}
        </button>
      )}
    </div>
  );
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackError, setCallbackError] = useState('');

  useEffect(() => {
    fetchData();

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

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (servicesData) setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone || callbackPhone.trim().length < 7) {
      setCallbackError('الرجاء إدخال الاسم ورقم هاتف صحيح');
      setCallbackSuccess(false);
      return;
    }

    setCallbackError('');

    try {
      // إدخال البيانات مباشرة إلى جدول call_requests في Supabase
      const { error } = await supabase.from('call_requests').insert([
        {
          name: callbackName.trim(),
          phone: callbackPhone.trim(),
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setCallbackSuccess(true);
      setCallbackName('');
      setCallbackPhone('');

      setTimeout(() => setCallbackSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving call request:', err);
      setCallbackError('حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.');
    }
  };

  const getWorkingStatus = () => {
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

    const now = new Date();
    const day = now.getDay();
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
  const emergencyMessage = encodeURIComponent(`🚨 طوارئ / حادث فوري:\nمرحباً ${settings.branch_name}، أواجه حادثاً أو طارئاً حالياً وأحتاج إلى المساعدة الفورية بخصوص وثيقة التأمين الخاصة بي.`);
  const emergencyWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${emergencyMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth" dir="rtl">

      {/* الهيدر وشريط التحديثات */}
      <div className="sticky top-0 z-50 w-full shadow-md bg-white">

        {settings.ticker_enabled && settings.ticker_text && (
          <div className="bg-red-600 text-white flex items-center h-10 px-4 border-b border-red-700 shadow-sm relative">
            <span className="bg-white text-red-700 text-xs font-black px-2.5 py-1 rounded-md shrink-0 z-20 flex items-center gap-1 shadow ml-3">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              تحديثات
            </span>
            <div className="flex-1 overflow-hidden relative">
              <div className="whitespace-nowrap animate-marquee font-bold text-xs md:text-sm text-white inline-block">
                {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}
              </div>
            </div>
            <style jsx>{`
              @keyframes marquee {
            50% { transform: translateX(-50%); }
                100% { transform: translateX(100%); }
              }
              .animate-marquee {
                display: inline-block;
                animation: marquee 15s linear infinite;
              }
            `}</style>
          </div>
        )}

        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-2">

            <div className="flex items-center gap-2 shrink-0">
              <a href="/admin" title="لوحة التحكم">
                <img 
                  src={LOGO_URL} 
                  alt="شركة التأمين الوطنية" 
                  className="h-8 sm:h-10 md:h-12 w-auto object-contain rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
              <div className="border-r-2 border-emerald-600 pr-2 my-1">
                <h1 className="font-extrabold text-slate-900 text-xs sm:text-base md:text-lg leading-tight">
                  الشركة الوطنية للتأمين
                </h1>
                <p className="text-[10px] sm:text-xs text-emerald-700 font-bold">
                  {settings.branch_name || 'فرع بيتا'}
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
              <a href="#about" className="hover:text-emerald-700 transition-colors">عن الشركة</a>
              <a href="#services" className="hover:text-emerald-700 transition-colors">خدماتنا التأمينية</a>
              <a href="#testimonials" className="hover:text-emerald-700 transition-colors">آراء العملاء</a>
              <a href="#contact" className="hover:text-emerald-700 transition-colors">تواصل معنا</a>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <a
                href={emergencyWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-black px-2.5 sm:px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1 animate-pulse"
                title="تبليغ فوري عن حادث أو طارئ"
              >
                <span>🚨</span> <span className="hidden sm:inline">حالة طوارئ</span>
              </a>

              <div className={`hidden lg:flex items-center gap-1.5 ${status.bgLight} border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm`}>
                <span className={`w-2 h-2 rounded-full ${status.color} ${status.isOpen ? 'animate-ping' : ''}`}></span>
                <span className={status.textColor}>{status.text}</span>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs md:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1 sm:gap-2"
              >
                <span>💬</span> <span>اتصل بنا</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-xl transition-colors text-lg"
                aria-label="قائمة التنقل"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>

          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-inner">
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                عن الشركة
              </a>
              <a 
                href="#services" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                خدماتنا التأمينية
              </a>
              <a 
                href="#testimonials" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                آراء العملاء
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                تواصل معنا
              </a>
            </div>
          )}
        </header>

      </div>

      {/* قسم الـ Hero */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-20 px-4 text-center relative shadow-lg overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-extrabold px-4 py-1.5 rounded-full text-xs shadow-sm backdrop-blur-sm">
            ☂️ الأمان والحماية الفائقة لرأس مالك وعائلتك
          </span>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-snug">
            الشركة الوطنية للتأمين - {settings.branch_name}
          </h2>

          <p className="text-emerald-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            نوفر أوسع نطاق تغطية تأمينية في فلسطين للمركبات، التأمين الصحي، الشامل والممتلكات مع خدمة عملاء ممتازة.
          </p>

          <div className="pt-2">
            <a
              href={emergencyWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-rose-600/90 hover:bg-rose-700 text-white border border-rose-500/50 px-5 py-3 rounded-2xl text-xs md:text-sm font-black shadow-lg backdrop-blur-md transition-all animate-bounce"
            >
              <span>🚨</span>
              <span>هل تعرضت لحادث سير أو طارئ؟ اضغط هنا للتبليغ الفوري</span>
            </a>
          </div>

          {settings.manager_name && (
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-emerald-600/40 px-5 py-2.5 rounded-2xl text-xs text-emerald-200 font-semibold shadow-md backdrop-blur-md">
                <span>👔</span>
                <span>تحت إدارة المدير: <strong className="text-white">{settings.manager_name}</strong></span>
                <span dir="ltr" className="bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 font-mono text-[11px] border border-emerald-800">
                  {WHATSAPP_NUMBER}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* قسم خدماتنا التأمينية */}
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
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
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
                    <div className="absolute top-3 right-3 bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      تغطية معتمدة
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {service.title}
                      </h3>

                      <ExpandableDescription text={service.description} />
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
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

      {/* قسم عن الشركة */}
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

      {/* قسم آراء ومراجعات العملاء */}
      <section id="testimonials" className="bg-emerald-950 text-white py-16 px-6 scroll-mt-28">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center">
            <span className="text-emerald-400 font-bold text-xs bg-emerald-900/60 border border-emerald-700 px-3 py-1 rounded-md">
              ثقة المراجعين
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              ماذا يقول عملاؤنا عن فرع بيتا؟
            </h2>
            <p className="text-emerald-200/70 text-sm mt-1">نفتخر بخدمة أهلنا ومراجعينا ونحرص دوماً على تقديم أفضل تجربة</p>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-slate-900 border border-emerald-900/80 p-6 rounded-3xl relative shadow-lg flex flex-col justify-between space-y-4">
              <div className="text-emerald-400 text-lg flex gap-1">⭐⭐⭐⭐⭐</div>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                &ldquo;خدمة ممتازة جداً وسرعة عالية في إنجاز تأمين المركبة. التعامل راقي ومهني من قبل إدارة الفرع، شكراً لجهودكم.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-sm">
                  أ.م
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">أحمد مصطفى</h4>
                  <span className="text-[10px] text-emerald-400">مؤمّن مركبات</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-900/80 p-6 rounded-3xl relative shadow-lg flex flex-col justify-between space-y-4">
              <div className="text-emerald-400 text-lg flex gap-1">⭐⭐⭐⭐⭐</div>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                &ldquo;أفضل فرع تأمين تعاملت معه، التزام تام بالمواعيد وسهولة في إصدار الوثائق مع تسهيلات ممتازة. أنصح بالتعامل معهم بشدة.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-sm">
                  م.ش
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">محمد شرف</h4>
                  <span className="text-[10px] text-emerald-400">تأمين شامل</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-900/80 p-6 rounded-3xl relative shadow-lg flex flex-col justify-between space-y-4">
              <div className="text-emerald-400 text-lg flex gap-1">⭐⭐⭐⭐⭐</div>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                &ldquo;سرعة استجابة فائقة حتى في حالات الاستفسارات عبر الواتساب. شكراً للأستاذ غيث على حسن الاستقبال والتعاون الدائم.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-sm">
                  ر.د
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">رائد دويكات</h4>
                  <span className="text-[10px] text-emerald-400">عميل ومراجع للفرع</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* قسم تواصل معنا */}
      <section id="contact" className="bg-slate-100 py-16 px-6 border-t border-slate-200 scroll-mt-28">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center">
            <span className="text-emerald-800 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-md">
              نحن هنا لخدمتك
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              تواصل مع {settings.branch_name}
            </h2>
            <p className="text-slate-600 text-sm mt-1">يسعدنا استقبال استفساراتك وزيارتك في مقر الفرع أو تقديم الطوارئ</p>
            <div className="w-16 h-1 bg-emerald-600 mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

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
                  <strong className="text-slate-800">الأحد - الخميس (9ص - 4م)</strong>
                </div>
                <div className="flex justify-between">
                  <span>العطلة:</span>
                  <strong className="text-slate-800">الجمعة والسبت</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  📞
                </div>
                <h3 className="font-bold text-slate-900 mb-1">المحادثة العامة</h3>
                <p className="text-xs text-slate-600 mb-3" dir="ltr">{WHATSAPP_NUMBER}</p>
              </div>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg border border-emerald-200 transition-all shadow-sm mt-2"
              >
                محادثة واتساب
              </a>
            </div>

            <div className="bg-rose-50/70 p-6 rounded-2xl border border-rose-200 text-center shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg">
                عاجل
              </div>
              <div>
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-pulse">
                  🚨
                </div>
                <h3 className="font-bold text-rose-950 mb-1">طوارئ الحوادث</h3>
                <p className="text-xs text-rose-800/80 mb-3">تبليغ فوري وعاجل عند وقوع حادث سير أو طارئ</p>
              </div>
              <a 
                href={emergencyWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-black text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition-all shadow-sm mt-2"
              >
                ⚠️ تبليغ فوري الآن
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  📍
                </div>
                <h3 className="font-bold text-slate-900 mb-1">موقع الفرع</h3>
                <p className="text-xs text-slate-600 font-semibold mb-3">{BRANCH_LOCATION}</p>
              </div>
              <a 
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg border border-emerald-200 transition-all shadow-sm mt-2"
              >
                🗺️ خرائط جوجل
              </a>
            </div>

          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-800">
            <div className="space-y-2 text-center md:text-right">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                خدمة معاودة الاتصال
              </span>
              <h3 className="text-xl md:text-2xl font-black">هل ترغب أن نتصل بك؟</h3>
              <p className="text-emerald-200 text-xs md:text-sm">أدخل اسمك ورقم هاتفك وسيقوم فريقنا بالتواصل معك في أقرب وقت.</p>
            </div>

            <form onSubmit={handleCallbackSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="space-y-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="اسمك الكريم"
                  value={callbackName}
                  onChange={(e) => setCallbackName(e.target.value)}
                  className="w-full sm:w-48 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2 w-full sm:w-auto">
                <input
                  type="tel"
                  placeholder="رقم الهاتف (مثال: 059xxxxxxx)"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  className="w-full sm:w-56 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-md shrink-0"
              >
                ارسل الطلب
              </button>
            </form>
          </div>

          {callbackError && (
            <div className="text-center text-rose-400 text-xs font-bold bg-rose-950/50 p-3 rounded-xl border border-rose-900">
              {callbackError}
            </div>
          )}

          {callbackSuccess && (
            <div className="text-center text-emerald-400 text-xs font-bold bg-emerald-950/50 p-3 rounded-xl border border-rose-900">
              تم إرسال طلبك بنجاح! سيتواصل معك فريق الفرع قريباً.
            </div>
          )}

        </div>
      </section>

      {/* الفوتر */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-6 text-center border-t border-slate-900 text-xs space-y-4">
        <div className="flex flex-wrap justify-center items-center gap-6 font-semibold">
          <a href="#about" className="hover:text-white transition-colors">عن الشركة</a>
          <a href="#services" className="hover:text-white transition-colors">خدماتنا</a>
          <a href="#testimonials" className="hover:text-white transition-colors">آراء العملاء</a>
          <a href="#contact" className="hover:text-white transition-colors">تواصل معنا</a>
          <a href="/admin" className="hover:text-white transition-colors">لوحة التحكم</a>
        </div>
        <p className="text-slate-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} الشركة الوطنية للتأمين - {settings.branch_name}
        </p>
      </footer>

    </div>
  );
}
