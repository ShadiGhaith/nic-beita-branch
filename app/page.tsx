'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// تهيئة Firebase بأمان لتجنب أي تضارب في المسارات
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

const LOGO_URL = "/images.jpeg";
const WHATSAPP_NUMBER = "970592017101";
const LOCAL_CALL_NUMBER = "0592017101";
const BRANCH_LOCATION = "جنوب نابلس - بيتا - شارع صرح الشهيد";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Beita,+Palestine";

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
    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs md:text-sm text-slate-600 leading-relaxed text-right">
      <p className="whitespace-pre-line">{isExpanded ? text : previewText}</p>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-emerald-600 hover:text-emerald-800 font-bold text-xs inline-flex items-center gap-1 transition-colors mt-1 focus:outline-none"
        >
          {isExpanded ? '▲ إخفاء التفاصيل' : '▼ عرض كافة التفاصيل'}
        </button>
      )}
    </div>
  );
}

export default function NICPalestineLanding() {
  const [settings, setSettings] = useState<SiteSettings>({
    branch_name: 'فرع بيتا',
    manager_name: 'غيث فايز أحمد',
    ticker_text: 'خصومات على كافة وثائق التأمين تصل حتى 10%',
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

  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Calculator States
  const [calcCategory, setCalcCategory] = useState('private'); // private, commercial
  const [calcEngineCC, setCalcEngineCC] = useState('1500'); // up to 1000, 1500, 2000, over2000
  const [calcCommercialType, setCalcCommercialType] = useState('1'); // 1 ton, 1.6 ton, 4 ton, over 4 ton, dump
  const [calcCarValue, setCalcCarValue] = useState<number | ''>(''); // Comprehensive insurance car value
  const [includeComprehensive, setIncludeComprehensive] = useState(true); // Toggle comprehensive insurance
  const [includeSettlers, setIncludeSettlers] = useState(true); // Toggle settlers insurance

  useEffect(() => {
    fetchData();

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);

    // التحقق المسبق من حالة الإذن
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }

    return () => clearInterval(timer);
  }, []);

  // دالة تفعيل الإشعارات السحابية الحقيقية عبر فايربيس وحفظ الـ Token في Supabase
  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم الإشعارات.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (!messaging) {
          alert('خدمة الإشعارات غير متوفرة حالياً.');
          return;
        }

        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (currentToken) {
          console.log("FCM Token:", currentToken);
          
          // حفظ الـ Token في جدول push_subscriptions على Supabase (تصحيح الـ onConflict لنص مفرد)
          const { error } = await supabase
            .from("push_subscriptions")
            .upsert([{ token: currentToken }], { onConflict: "token" });
if (error) {
  console.error("Error saving token to Supabase:", error.message || JSON.stringify(error));
  alert("فشل حفظ الرمز: " + (error.message || "خطأ غير معروف"));
} else {
            setNotificationsEnabled(true);
            alert("تم تفعيل إشعارات الجوال السحابية بنجاح!");
          }
        } else {
          console.log("No registration token available.");
        }
      } else {
        setNotificationsEnabled(false);
        alert('تم رفض إذن الإشعارات.');
      }
    } catch (error) {
      console.error("An error occurred while retrieving token. ", error);
    }
  };

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
      setCallbackError('الرجاء إدخال الاسم ورقم الهاتف بشكل صحيح.');
      setCallbackSuccess(false);
      return;
    }

    setCallbackError('');

    try {
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
      setCallbackError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.');
    }
  };

  const getCompulsoryPrice = () => {
    if (calcCategory === 'private') {
      switch (calcEngineCC) {
        case '1000': return 995;
        case '1500': return 1095;
        case '2000': return 1405;
        case 'over2000': return 1755;
        default: return 1095;
      }
    } else {
      switch (calcCommercialType) {
        case '1': return 1665;
        case '1.6': return 2115;
        case '4': return 2965;
        case 'over4': return 2955;
        case 'dump': return 2785;
        default: return 1665;
      }
    }
  };

  const getComprehensivePrice = () => {
    if (!includeComprehensive || calcCarValue === '') return 0;
    if (calcCarValue <= 50000) return 1000;
    if (calcCarValue <= 200000) return Math.round(calcCarValue * 0.0175);
    return Math.round(calcCarValue * 0.02);
  };

  const getSettlersPrice = () => {
    return includeSettlers ? 500 : 0;
  };

  const compulsoryPrice = getCompulsoryPrice();
  const comprehensivePrice = getComprehensivePrice();
  const settlersPrice = getSettlersPrice();
  const totalPrice = compulsoryPrice + comprehensivePrice + settlersPrice;

  const getCalcDetailsText = () => {
    const catText = calcCategory === 'private' ? 'خصوصي' : 'تجاري';
    let parts = [`إلزامي (${catText})`];
    if (includeComprehensive) {
      const valText = calcCarValue === '' ? '0' : calcCarValue.toLocaleString();
      parts.push(`شامل (قيمة المركبة: ${valText} ₪)`);
    }
    if (includeSettlers) parts.push('تأمين مستوطنين (ثابت 500 ₪)');
    return parts.join(' + ');
  };

  const calcWhatsappMessage = encodeURIComponent(`مرحباً ${settings.branch_name}، أود طلب عرض سعر مفصل بناءً على الحاسبة:\n- التغطيات المطلوبة: ${getCalcDetailsText()}\n- الإجمالي المقدر: ${totalPrice} شيكل`);
  const calcWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${calcWhatsappMessage}`;

  const getWorkingStatus = () => {
    if (settings.working_status_mode === 'open') {
      return { 
        isOpen: true, 
        text: "مفتوح الآن", 
        message: "أهلاً بك! نحن نستقبل العملاء حالياً لخدمتكم وإصدار وثائق التأمين.", 
        hoursNote: "ساعات الدوام الرسمي: 09:00 صباحاً – 04:00 عصراً.", 
        color: "bg-emerald-500", 
        textColor: "text-emerald-400" 
      };
    }
    if (settings.working_status_mode === 'closed') {
      return { 
        isOpen: false, 
        text: "مغلق الآن", 
        message: "انتهى دوام اليوم الرسمي. نسعد بخدمتكم غداً بدءاً من الساعة 09:00 صباحاً.", 
        hoursNote: "ساعات الدوام الرسمي: 09:00 صباحاً – 04:00 عصراً.", 
        color: "bg-rose-500", 
        textColor: "text-rose-400" 
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
        message: "أهلاً بك! المكتب يستقبل العملاء حالياً لخدمتكم وإصدار وثائق التأمين.", 
        hoursNote: "ساعات الدوام الرسمي: 09:00 صباحاً – 04:00 عصراً.", 
        color: "bg-emerald-500", 
        textColor: "text-emerald-400" 
      };
    }

    let closedReason = "انتهى دوام اليوم الرسمي. نسعد بخدمتكم غداً بدءاً من الساعة 09:00 صباحاً.";
    if (!isWorkingDay) {
      closedReason = "اليوم عطلة نهاية الأسبوع (الجمعة والسبت). نسعد بخدمتكم يوم الأحد القادم الساعة 09:00 صباحاً.";
    } else if (hours < 9) {
      closedReason = "المكتب مغلق حالياً. يفتح أبوابه اليوم الساعة 09:00 صباحاً.";
    }

    return { 
      isOpen: false, 
      text: "مغلق الآن", 
      message: closedReason, 
      hoursNote: "ساعات الدوام الرسمي: 09:00 صباحاً – 04:00 عصراً.", 
      color: "bg-rose-500", 
      textColor: "text-rose-400" 
    };
  };

  const status = getWorkingStatus();
  const emergencyMessage = encodeURIComponent(`🚨 طوارئ / حادث فوري:\nمرحباً ${settings.branch_name}، أتعرض حالياً لحادث أو حالة طارئة وأحتاج للمساعدة الفورية بخصوص وثيقة التأمين.`);
  const emergencyWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${emergencyMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth pb-20 md:pb-0 text-right" dir="rtl">

      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full shadow-md bg-white">
        {settings.ticker_enabled && settings.ticker_text && (
          <div className="bg-red-600 text-white flex items-center h-8 sm:h-10 px-3 border-b border-red-700 shadow-sm relative overflow-hidden">
            <span className="bg-white text-red-700 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shrink-0 z-20 flex items-center gap-1 shadow ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              تحديثات
            </span>
            <div className="flex-1 overflow-hidden relative">
              <div className="whitespace-nowrap animate-marquee font-bold text-xs text-white inline-block">
                {settings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp; {settings.ticker_text}
              </div>
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
              .animate-marquee { display: inline-block; animation: marquee 25s linear infinite; }
            `}</style>
          </div>
        )}

        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 flex justify-between items-center gap-1">
            
            <div className="flex items-center gap-1.5 shrink-0">
              <a href="/admin" title="لوحة التحكم">
                <img src={LOGO_URL} alt="شركة الوطنية للتأمين" className="h-8 sm:h-10 md:h-12 w-auto object-contain rounded-md hover:opacity-80 transition-opacity cursor-pointer" />
              </a>
              <div className="border-r-2 border-emerald-600 pr-1.5 my-0.5">
                <h1 className="font-extrabold text-slate-900 text-xs sm:text-base leading-tight">شركة الوطنية للتأمين</h1>
                <p className="text-[10px] sm:text-xs text-emerald-700 font-bold">{settings.branch_name || 'فرع بيتا'}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
              <a href="#calculator" className="hover:text-emerald-700 transition-colors">حاسبة الأقساط</a>
              <a href="#services" className="hover:text-emerald-700 transition-colors">خدمات التأمين</a>
              <a href="#about" className="hover:text-emerald-700 transition-colors">من نحن</a>
              <a href="#contact" className="hover:text-emerald-700 transition-colors">اتصل بنا وساعات الدوام</a>
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={handleNotificationToggle}
                className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-sm flex items-center gap-1 ${
                  notificationsEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
                title={notificationsEnabled ? 'الإشعارات مفعلة' : 'تفعيل الإشعارات والتنبيهات'}
              >
                <span>{notificationsEnabled ? '🔔' : '🔕'}</span>
                <span className="hidden xl:inline">{notificationsEnabled ? 'الإشعارات مفعلة' : 'تفعيل التنبيهات'}</span>
              </button>

              <a href={emergencyWhatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-black p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 animate-pulse" title="طوارئ">
                <span>🚨</span> <span className="hidden lg:inline">طوارئ</span>
              </a>

              <div className={`flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm`}>
                <span className={`w-2 h-2 rounded-full ${status.color} ${status.isOpen ? 'animate-ping' : ''}`}></span>
                <span className="text-white">{status.text}</span>
              </div>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs md:text-sm font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow flex items-center gap-1">
                <span>💬</span> <span className="hidden xs:inline">تواصل معنا</span>
              </a>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-xl transition-colors text-base" aria-label="قائمة التنقل">
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-inner">
              <div className={`flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 py-1.5 rounded-lg text-xs font-bold mb-2`}>
                <span className={`w-2 h-2 rounded-full ${status.color} ${status.isOpen ? 'animate-ping' : ''}`}></span>
                <span className="text-slate-800">{status.text} ({status.message})</span>
              </div>
              <button
                onClick={handleNotificationToggle}
                className="w-full text-right py-2 px-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <span>{notificationsEnabled ? '🔔' : '🔕'}</span>
                <span>{notificationsEnabled ? 'إشعارات العروض مفعلة' : 'تفعيل إشعارات العروض والخصومات'}</span>
              </button>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">حاسبة الأقساط</a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">خدمات التأمين</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">من نحن</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">اتصل بنا وساعات الدوام</a>
            </div>
          )}
        </header>
      </div>

      <div className="pt-24 sm:pt-28"></div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-20 px-4 text-center relative shadow-lg overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-extrabold px-4 py-1.5 rounded-full text-xs shadow-sm backdrop-blur-sm">
            ☂️ أعلى درجات الأمان والحماية لرأس مالك وعائلتك
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-snug">
            شركة التأمين الوطنية - {settings.branch_name}
          </h2>
          <p className="text-emerald-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            نقدم أوسع نطاق تغطيات تأمينية في فلسطين للسيارات، الصحي، الشامل، والممتلكات مع خدمة عملاء استثنائية.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a href={emergencyWhatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-rose-600/90 hover:bg-rose-700 text-white border border-rose-500/50 px-5 py-3 rounded-2xl text-xs md:text-sm font-black shadow-lg backdrop-blur-md transition-all animate-bounce">
              <span>🚨</span>
              <span>هل تعرضت لحادث سير؟ اضغط هنا للتبليغ الفوري</span>
            </a>
          </div>
          {settings.manager_name && (
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-emerald-600/40 px-5 py-2.5 rounded-2xl text-xs text-emerald-200 font-semibold shadow-md backdrop-blur-md">
                <span>👔</span>
                <span>إدارة الفرع: <strong className="text-white">{settings.manager_name}</strong></span>
                <span dir="ltr" className="bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 font-mono text-[11px] border border-emerald-800">+{WHATSAPP_NUMBER}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Integrated Calculator Section */}
      <section id="calculator" className="bg-emerald-900 text-white py-16 px-4 sm:px-6 scroll-mt-32">
        <div className="max-w-4xl mx-auto bg-slate-900 border border-emerald-700/50 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-emerald-400 font-bold text-xs bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-md">أداة تفاعلية</span>
            <h2 className="text-2xl md:text-3xl font-black text-white">حاسبة الأقساط الشاملة ومتعددة الخيارات</h2>
            <p className="text-slate-400 text-xs md:text-sm">قم باختيار التغطيات التي ترغب بها (الإلزامي، التأمين الشامل، وتأمين المستوطنين) لمعرفة التكلفة المفصلة بالكامل.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-emerald-300">تصنيف المركبة (للإلزامي)</label>
              <select
                value={calcCategory}
                onChange={(e) => setCalcCategory(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="private">خصوصي (حسب سعة المحرك CC)</option>
                <option value="commercial">تجاري (حسب الحمولة أو النوع)</option>
              </select>
            </div>

            {calcCategory === 'private' ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-300">سعة المحرك (CC)</label>
                <select
                  value={calcEngineCC}
                  onChange={(e) => setCalcEngineCC(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="1000">لغاية 1,000 سي سي (995 شيكل)</option>
                  <option value="1500">من 1,001 إلى 1,500 سي سي (1,095 شيكل)</option>
                  <option value="2000">من 1,501 إلى 2,000 سي سي (1,405 شيكل)</option>
                  <option value="over2000">أكثر من 2,000 سي سي (1,755 شيكل)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-300">حمولة أو نوع المركبة التجارية</label>
                <select
                  value={calcCommercialType}
                  onChange={(e) => setCalcCommercialType(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="1">لغاية 1 طن (1,665 شيكل)</option>
                  <option value="1.6">أكثر من 1 طن ولغاية 1.6 طن (2,115 شيكل)</option>
                  <option value="4">أكثر من 1.6 - 4 طن (2,965 شيكل)</option>
                  <option value="over4">أكثر من 4 طن (2,955 شيكل)</option>
                  <option value="dump">قلاب (2,785 شيكل)</option>
                </select>
              </div>
            )}

          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">الإضافات والتغطيات الاختيارية:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3.5 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={includeComprehensive}
                  onChange={(e) => setIncludeComprehensive(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">إضافة التأمين الشامل</span>
                  <span className="text-slate-400">بناءً على قيمة السيارة (أقل من 50 ألف = 1000 شيكل)</span>
                </div>
              </label>

              <label className="flex items-center gap-3.5 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSettlers}
                  onChange={(e) => setIncludeSettlers(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">إضافة تأمين المستوطنين</span>
                  <span className="text-slate-400">مبلغ تغطية ثابت بقيمة 500 شيكل فقط</span>
                </div>
              </label>
            </div>
          </div>

          {includeComprehensive && (
            <div className="space-y-3 bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-700">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-emerald-300">قيمة السيارة الفعلية بالشيكل (للتأمين الشامل):</span>
                <span className="text-white font-mono bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800" dir="ltr">
                  {calcCarValue === '' ? '0' : calcCarValue.toLocaleString()} شيكل
                </span>
              </div>
              
              <div className="space-y-1 pt-1">
                <label className="block text-[11px] font-bold text-emerald-400">أدخل قيمة السيارة بالأرقام:</label>
                <input
                  type="number"
                  value={calcCarValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCalcCarValue(val === '' ? '' : Number(val));
                  }}
                  placeholder="أدخل قيمة السيارة (مثال: 60000)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-emerald-700/60 text-white text-xs md:text-sm font-mono focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              <input
                type="range"
                min="20000"
                max="300000"
                step="5000"
                value={calcCarValue === '' ? 20000 : calcCarValue}
                onChange={(e) => setCalcCarValue(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer pt-2"
              />
              <p className="text-[11px] text-slate-400">
                * السيارات أقل من 50 ألف = 1,000 شيكل | بين 50 ألف إلى 200 ألف = 1.75% | أكثر من 200 ألف = 2%.
              </p>
            </div>
          )}

          <div className="bg-emerald-950/90 border border-emerald-600/60 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center border-b border-emerald-900 pb-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">التأمين الإلزامي</span>
                <strong className="text-white font-mono text-sm" dir="ltr">{compulsoryPrice.toLocaleString()} شيكل</strong>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">التأمين الشامل</span>
                <strong className="text-white font-mono text-sm" dir="ltr">{comprehensivePrice.toLocaleString()} شيكل</strong>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">تأمين المستوطنين (ثابت)</span>
                <strong className="text-white font-mono text-sm" dir="ltr">{settlersPrice.toLocaleString()} شيكل</strong>
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs text-emerald-300 font-bold block">المبلغ الإجمالي للتغطيات المحددة:</span>
              <div className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono" dir="ltr">
                {totalPrice.toLocaleString()} <span className="text-emerald-400 text-lg">شيكل</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <a href={calcWhatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm rounded-2xl transition-all shadow-lg">
              <span>💬</span> اعتماد التغطيات وطلب عرض السعر عبر الواتساب
            </a>
          </div>

        </div>
      </section>

      {/* Insurance Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-32">
        <div className="text-center mb-12">
          <span className="text-emerald-800 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-md">برامج التأمين</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">خدماتنا التأمينية المتميزة</h2>
          <div className="w-16 h-1 bg-emerald-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">جاري تحميل الخدمات...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">لا توجد خدمات مضافة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const waMessage = encodeURIComponent(`مرحباً ${settings.branch_name}، أود الحصول على استشارة والاستفسار بخصوص خدمة: (${service.title})`);
              const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

              return (
                <div key={service.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div className="h-52 w-full bg-slate-100 relative overflow-hidden">
                    {service.image_url ? (
                      <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 text-2xl font-black">NIC</div>
                    )}
                    <div className="absolute top-3 right-3 bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">تغطية معتمدة</div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">{service.title}</h3>
                      <ExpandableDescription text={service.description} />
                    </div>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center py-3.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                      <span>💬</span> طلب استشارة عبر الواتساب
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">من نحن</span>
            <h2 className="text-3xl font-black text-slate-900 leading-snug">خبرة مستمرة وثقة في تقديم أفضل الخدمات التأمينية</h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              تسعى شركة التأمين الوطنية لتوفير بيئة آمنة للمواطنين والمؤسسات في فلسطين عبر حزمة متكاملة من الحلول التأمينية المصممة بدقة لتلبية الاحتياجات مع سرعة في تسوية المطالبات.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1" dir="ltr">+25</div>
              <div className="text-xs font-bold text-slate-600">عقود من الخبرة</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1" dir="ltr">100%</div>
              <div className="text-xs font-bold text-slate-600">التزام بالمطالبات</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1" dir="ltr">24/7</div>
              <div className="text-xs font-bold text-slate-600">دعم الطوارئ والحوادث</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">#1</div>
              <div className="text-xs font-bold text-slate-600">في سرعة الاستجابة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-slate-900 text-white py-16 px-4 sm:px-6 scroll-mt-32">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-emerald-400 font-bold text-xs bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-md">قنوات الاتصال وأوقات العمل</span>
            <h2 className="text-2xl md:text-4xl font-black">اتصل بنا وساعات الدوام الرسمي</h2>
            <p className="text-slate-400 text-xs md:text-sm">
              نسعد بزيارتكم في {BRANCH_LOCATION}، أو متابعة حالة الدوام المباشرة والتواصل عبر القنوات المتاحة.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1: Status & Working Hours */}
            <div className="space-y-6">
              
              {/* Real-time Status Card */}
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-3xl text-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">حالة المكتب المباشرة:</span>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-slate-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${status.color} ${status.isOpen ? 'animate-ping' : ''}`}></span>
                    <span className={`text-xs font-black ${status.textColor}`}>{status.text}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-700">
                  {status.message}
                </p>
                <p className="text-[11px] text-emerald-400/90 font-bold font-mono">
                  {status.hoursNote}
                </p>
                {currentTime && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 text-center flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">التوقيت المحلي:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 tracking-wider shadow-inner" dir="ltr">{currentTime}</span>
                  </div>
                )}
              </div>

              {/* Working Hours & Manager Card */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl space-y-5">
                <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                  <span>📅</span> ساعات الدوام الرسمي
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/60">
                    <span className="text-slate-300 font-bold">الأحد - الخميس:</span>
                    <span className="font-mono text-emerald-400 font-bold" dir="ltr">09:00 AM – 04:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-300 font-bold">الجمعة والسبت:</span>
                    <span className="font-mono text-rose-400 font-bold">مغلق (عطلة رسمية)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 space-y-2">
                  <span className="text-[11px] text-slate-400 block font-bold">إدارة الفرع:</span>
                  <div className="text-base font-black text-white">{settings.manager_name}</div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`مرحباً مدير الفرع ${settings.manager_name}، أود التواصل معك بخصوص...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2"
                  >
                    <span>💬</span> مراسلة مدير الفرع (<span dir="ltr">{LOCAL_CALL_NUMBER}</span>)
                  </a>
                </div>
              </div>

            </div>

            {/* Column 2: Direct Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white mb-2">الأرقام المباشرة والمواقع</h3>

              <a href={`tel:${LOCAL_CALL_NUMBER}`} className="flex items-center gap-3.5 bg-slate-800 border border-slate-700 p-4 rounded-2xl hover:border-emerald-500 transition-colors">
                <span className="text-xl">📞</span>
                <div className="flex-1">
                  <span className="block text-[11px] text-slate-400 font-bold">الهاتف المباشر</span>
                  <span dir="ltr" className="text-white font-mono text-sm font-black">{LOCAL_CALL_NUMBER}</span>
                </div>
                <span className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm">اتصال</span>
              </a>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 bg-slate-800 border border-slate-700 p-4 rounded-2xl hover:border-emerald-500 transition-colors">
                <span className="text-xl">💬</span>
                <div className="flex-1">
                  <span className="block text-[11px] text-slate-400 font-bold">مراسلة عبر الواتساب</span>
                  <span dir="ltr" className="text-white font-mono text-sm font-black">+{WHATSAPP_NUMBER}</span>
                </div>
                <span className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm">دردشة</span>
              </a>

              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 bg-slate-800 border border-slate-700 p-4 rounded-2xl hover:border-emerald-500 transition-colors">
                <span className="text-xl">📍</span>
                <div className="flex-1">
                  <span className="block text-[11px] text-slate-400 font-bold">موقع الفرع على الخريطة</span>
                  <span className="text-white text-xs font-bold">{BRANCH_LOCATION}</span>
                </div>
                <span className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm">الخريطة</span>
              </a>
            </div>

            {/* Column 3: Instant Callback Form */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">طلب معاودة الاتصال</h3>
                <p className="text-slate-400 text-xs">أدخل اسمك ورقم هاتفك وسنقوم بالاتصال بك في أقرب وقت.</p>
              </div>

              <form onSubmit={handleCallbackSubmit} className="space-y-3.5">
                {callbackSuccess && (
                  <div className="bg-emerald-900/60 border border-emerald-600 text-emerald-200 p-3 rounded-xl text-xs font-bold text-center">
                    تم إرسال طلبك بنجاح! سنتواصل معك قريباً.
                  </div>
                )}

                {callbackError && (
                  <div className="bg-rose-900/60 border border-rose-600 text-rose-200 p-3 rounded-xl text-xs font-bold text-center">
                    {callbackError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">الاسم الكامل</label>
                  <input
                    type="text"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    placeholder="أدخل اسمك هنا"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">رقم الهاتف / الجوال</label>
                  <input
                    type="tel"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    placeholder="0592017101"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md mt-2"
                >
                  إرسال طلب الاتصال
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="الشعار" className="h-6 w-auto object-contain rounded" />
            <span className="font-bold text-white">شركة التأمين الوطنية - {settings.branch_name}</span>
          </div>
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} | صمم لخدمة عملاء فرع بيتا
          </div>
        </div>
      </footer>

    </div>
  );
}
