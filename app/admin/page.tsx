'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Service {
  id?: string;
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

export default function AdminPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    branch_name: '',
    manager_name: '',
    working_status_mode: 'auto',
    ticker_text: '',
    ticker_enabled: true,
  });

  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<Service>({ title: '', description: '', image_url: '' });
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    // جلب الإعدادات
    const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (settingsData) setSettings(settingsData);

    // جلب الخدمات
    fetchServices();
  };

  const fetchServices = async () => {
    const { data: servicesData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (servicesData) setServices(servicesData);
  };

  // 1. حفظ إعدادات الموقع
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        ...settings,
      });

    setSavingSettings(false);
    if (error) {
      alert('حدث خطأ في حفظ الإعدادات: ' + error.message);
    } else {
      alert('✅ تم حفظ إعدادات الفرع بنجاح!');
    }
  };

  // 2. إضافة خدمة جديدة
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingService(true);

    const { error } = await supabase.from('services').insert([newService]);

    setAddingService(false);
    if (error) {
      alert('خطأ في إضافة الخدمة: ' + error.message);
    } else {
      alert('✅ تم إضافة الخدمة بنجاح!');
      setNewService({ title: '', description: '', image_url: '' });
      fetchServices();
    }
  };

  // 3. تعديل خدمة قائمة
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.id) return;

    const { error } = await supabase
      .from('services')
      .update({
        title: editingService.title,
        description: editingService.description,
        image_url: editingService.image_url,
      })
      .eq('id', editingService.id);

    if (error) {
      alert('خطأ أثناء التعديل: ' + error.message);
    } else {
      alert('✅ تم تعديل الخدمة بنجاح!');
      setEditingService(null);
      fetchServices();
    }
  };

  // 4. حذف خدمة
  const handleDeleteService = async (id?: string) => {
    if (!id || !confirm('هل أنت تأكد من حذف هذه الخدمة؟')) return;
    await supabase.from('services').delete().eq('id', id);
    fetchServices();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* العنونة */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900">لوحة تحكم الأدمن</h1>
            <p className="text-xs text-slate-500">إدارة إعدادات فرع بيتا والخدمات التأمينية</p>
          </div>
          <a href="/" target="_blank" className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100">
            معاينة الموقع ↗
          </a>
        </div>

        {/* قسم 1: إعدادات الفرع */}
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 border-b pb-3">⚙️ إعدادات الفرع وحالة الدوام</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفرع</label>
              <input
                type="text"
                value={settings.branch_name}
                onChange={(e) => setSettings({ ...settings, branch_name: e.target.value })}
                className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدير / الإدارة</label>
              <input
                type="text"
                value={settings.manager_name}
                onChange={(e) => setSettings({ ...settings, manager_name: e.target.value })}
                className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">حالة العمل والدوام</label>
            <select
              value={settings.working_status_mode}
              onChange={(e) => setSettings({ ...settings, working_status_mode: e.target.value })}
              className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="auto">تلقائي (حسب أوقات العمل والجمعة/السبت عطلة)</option>
              <option value="open">مفتوح الآن (إجبارياً)</option>
              <option value="closed">مغلق حالياً (إجبارياً)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">الشريط الإخباري المتحرك</label>
            <input
              type="text"
              value={settings.ticker_text}
              onChange={(e) => setSettings({ ...settings, ticker_text: e.target.value })}
              className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.ticker_enabled}
                onChange={(e) => setSettings({ ...settings, ticker_enabled: e.target.checked })}
                className="rounded text-emerald-600"
              />
              تفعيل الشريط المتحرك في أعلى الصفحة
            </label>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-800 transition-all shadow"
          >
            {savingSettings ? 'جاري الحفظ...' : 'حفظ إعدادات الفرع'}
          </button>
        </form>

        {/* قسم 2: إضافة خدمة جديدة */}
        <form onSubmit={handleAddService} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 border-b pb-3">➕ إضافة خدمة جديدة</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الخدمة</label>
            <input
              type="text"
              required
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              placeholder="مثال: تأمين المركبات الشامل"
              className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رابط الصورة (اختياري)</label>
            <input
              type="text"
              value={newService.image_url}
              onChange={(e) => setNewService({ ...newService, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الخدمة</label>
            <textarea
              required
              rows={3}
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="اكتب تفاصيل الخدمة. يمكنك الفصل بين النقاط بنقطة (.) ليظهر كل سطر على شكل نقطة منظمة..."
              className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={addingService}
            className="w-full bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-700 transition-all shadow"
          >
            {addingService ? 'جاري الإضافة...' : 'إضافة الخدمة'}
          </button>
        </form>

        {/* قسم 3: الخدمات المضافة وحذفها وتعديلها */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 border-b pb-3">📋 الخدمات المضافة حالياً ({services.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  {service.image_url && (
                    <img src={service.image_url} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{service.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{service.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingService(service)}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg border border-blue-200 transition-all"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg border border-rose-200 transition-all"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* نافذة التعديل (Modal) */}
      {editingService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">تعديل الخدمة</h3>
              <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-600 text-base">✕</button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الخدمة</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط الصورة</label>
                <input
                  type="text"
                  value={editingService.image_url || ''}
                  onChange={(e) => setEditingService({ ...editingService, image_url: e.target.value })}
                  className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف وتفاصيل الخدمة</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  rows={4}
                  className="w-full text-xs p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow">
                  حفظ التعديلات
                </button>
                <button type="button" onClick={() => setEditingService(null)} className="bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-200">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
