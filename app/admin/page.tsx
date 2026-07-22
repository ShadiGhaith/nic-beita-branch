'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "A1234567"; 

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [branchName, setBranchName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [tickerText, setTickerText] = useState('');
  const [tickerEnabled, setTickerEnabled] = useState(true);
  
  // 🟢 إضافة حالة الدوام (auto = تلقائي حسب الوقت، open = مفتوح دائماً، closed = مغلق دائماً)
  const [workingStatusMode, setWorkingStatusMode] = useState('auto');

  const [services, setServices] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('nic_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('nic_admin_auth', 'true');
      setLoginError('');
      fetchAdminData();
    } else {
      setLoginError('اسم المستخدم أو كلمة السر غير صحيحة!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nic_admin_auth');
  };

  const fetchAdminData = async () => {
    const { data: settings } = await supabase.from('site_settings').select('*').single();
    if (settings) {
      setBranchName(settings.branch_name || '');
      setManagerName(settings.manager_name || '');
      setTickerText(settings.ticker_text || '');
      setTickerEnabled(settings.ticker_enabled ?? true);
      setWorkingStatusMode(settings.working_status_mode || 'auto');
    }

    const { data: servicesData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (servicesData) setServices(servicesData);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      branch_name: branchName,
      manager_name: managerName,
      ticker_text: tickerText,
      ticker_enabled: tickerEnabled,
      working_status_mode: workingStatusMode,
    });
    setSavingSettings(false);
    if (!error) alert('تم حفظ الإعدادات بنجاح!');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingService(true);
    const { error } = await supabase.from('services').insert([{
      title,
      description,
      image_url: imageUrl
    }]);
    setAddingService(false);
    if (!error) {
      setTitle('');
      setDescription('');
      setImageUrl('');
      fetchAdminData();
      alert('تمت إضافة الخدمة بنجاح!');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذه الخدمة؟')) {
      await supabase.from('services').delete().eq('id', id);
      fetchAdminData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black">
              🔒
            </div>
            <h2 className="text-2xl font-black text-slate-900">تسجيل الدخول للوحة التحكم</h2>
            <p className="text-xs text-slate-500 mt-1">الشركة الوطنية للتأمين</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">كلمة السر</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow"
            >
              دخول اللوحة
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/" className="text-xs text-slate-500 hover:text-emerald-600 font-bold transition-colors">
              ← العودة للموقع الرئيسي
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* هيدر اللوحة */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">لوحة إدارة الفرع</h1>
            <p className="text-xs text-emerald-700 font-bold mt-1">الشركة الوطنية للتأمين</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200">
              عرض الموقع 🌐
            </a>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-200"
            >
              تسجيل الخروج 🚪
            </button>
          </div>
        </div>

        {/* إعدادات الفرع والشريط */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-2">إعدادات الفرع والدوام</h2>
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">اسم الفرع</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="فرع بيتا"
                className="w-full p-2.5 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">اسم مدير الفرع</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="غيث فايز أحمد"
                className="w-full p-2.5 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* التحكم بحالة الدوام */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">🟢 التحكم بحالة الدوام الظاهرة على الموقع</label>
              <select
                value={workingStatusMode}
                onChange={(e) => setWorkingStatusMode(e.target.value)}
                className="w-full p-2.5 border border-slate-300 text-slate-900 font-bold rounded-xl text-sm outline-none focus:border-emerald-500 bg-white"
              >
                <option value="auto">⏰ تلقائي (حسب الوقت الحالي والساعات المحددة: الأحد - الخميس 9ص-4م)</option>
                <option value="open">✅ إجبار الحالة: "مفتوح الآن" (مثلاً أيام العمل الإضافي)</option>
                <option value="closed">❌ إجبار الحالة: "مغلق حالياً" (مثلاً العطل الرسمية والإجازات)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">نص الشريط المتحرك العاجل</label>
              <input
                type="text"
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="خصومات على كافة التأمينات تصل الى 10%"
                className="w-full p-2.5 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ticker_check"
                checked={tickerEnabled}
                onChange={(e) => setTickerEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="ticker_check" className="text-xs font-bold text-slate-800 cursor-pointer">تفعيل الشريط العاجل</label>
            </div>
            <div className="md:col-span-2 text-left">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                {savingSettings ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>

        {/* إضافة برنامج تأميني جديد */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-2">إضافة برنامج تأميني جديد</h2>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">عنوان الخدمة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: تأمين الشامل للمركبات"
                  className="w-full p-2.5 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">رابط صورة الخدمة (Image URL)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2.5 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">وصف الخدمة</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل التغطية والتأمينات..."
                className="w-full p-2.5 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={addingService}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              {addingService ? 'جاري الإضافة...' : 'إضافة الخدمة'}
            </button>
          </form>
        </div>

        {/* قائمة الخدمات الحالية */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-2">الخدمات المضافة حالياً</h2>
          {services.length === 0 ? (
            <p className="text-xs text-slate-500">لا توجد خدمات مضافة حتى الآن.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-xl flex gap-3 items-center justify-between bg-slate-50">
                  <div className="flex gap-3 items-center">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteService(item.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}