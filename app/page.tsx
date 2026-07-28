'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

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
          const { error } = await supabase
            .from("push_subscriptions")
            .upsert([{ token: currentToken }], { onConflict: "token" });

          if (error) {
            alert("فشل حفظ الرمز: " + (error.message || "خطأ غير معروف"));
          } else {
            setNotificationsEnabled(true);
            alert("تم تفعيل إشعارات الجوال السحابية بنجاح!");
          }
        }
      } else {
        setNotificationsEnabled(false);
        alert('تم رفض إذن الإشعارات.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      const { data: settingsData } = await supabase.from('site_settings').select('*').single();
      if (settingsData) setSettings(settingsData);

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (servicesData) setServices(servicesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const emergencyMessage = encodeURIComponent(`🚨 طوارئ / حادث فوري:\nمرحباً ${settings.branch_name}، أتعرض حالياً لحادث وأحتاج للمساعدة الفورية.`);
  const emergencyWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${emergencyMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth pb-20 md:pb-0 text-right" dir="rtl">
      <div className="fixed top-0 left-0 right-0 z-50 w-full shadow-md bg-white">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 flex justify-between items-center gap-1">
            
            <div className="flex items-center gap-1.5 shrink-0">
              <a href="/admin" title="لوحة التحكم">
                <img src={LOGO_URL} alt="شركة الوطنية للتأمين" className="h-8 sm:h-10 md:h-12 w-auto object-contain rounded-md hover:opacity-80 transition-opacity cursor-pointer" />
              </a>
              <div className="border-r-2 border-emerald-600 pr-1.5 my-0.5">
                <h1 className="font-extrabold text-slate-900 text-xs sm:text-base leading-tight">شركة التأمين الوطنية</h1>
                <p className="text-[10px] sm:text-xs text-emerald-700 font-bold">{settings.branch_name || 'فرع بيتا'}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
              <a href="#calculator" className="hover:text-emerald-700 transition-colors">حاسبة التأمين</a>
              <a href="#services" className="hover:text-emerald-700 transition-colors">خدمات التأمين</a>
              <a href="#about" className="hover:text-emerald-700 transition-colors">من نحن</a>
              <a href="#contact" className="hover:text-emerald-700 transition-colors">تواصل معنا</a>
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={handleNotificationToggle}
                className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-sm flex items-center gap-1 ${
                  notificationsEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{notificationsEnabled ? '🔔' : '🔕'}</span>
                <span className="hidden xl:inline">{notificationsEnabled ? 'الإشعارات مفعلة' : 'تفعيل التنبيهات'}</span>
              </button>

              <a href={emergencyWhatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-black p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 animate-pulse">
                <span>🚨</span> <span className="hidden lg:inline">طوارئ</span>
              </a>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs md:text-sm font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow flex items-center gap-1">
                <span>💬</span> <span className="hidden xs:inline">تواصل معنا</span>
              </a>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-xl transition-colors text-base">
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
