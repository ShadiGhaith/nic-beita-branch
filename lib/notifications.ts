// lib/notifications.ts
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase"; // تأكد من استيراد عميل Supabase الخاص بك

// واجهة بيانات الإشعار
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
}

/**
 * طلب إذن المستخدم لتفعيل الإشعارات وحفظ الرمز (Token) في Supabase
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !messaging) {
      console.warn("إشعارات المتصفح غير مدعومة أو أن الكود يعمل على السيرفر.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("تم رفض إذن الإشعارات من قبل المستخدم.");
      return null;
    }

    // استبدل المفتاح أدناه بمفتاح الـ VAPID الخاص بك من لوحة تحكم Firebase
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    const currentToken = await getToken(messaging, { vapidKey });

    if (currentToken) {
      console.log("تم الحصول على رمز الإشعارات بنجاح:", currentToken);
      
      // حفظ الرمز في قاعدة بيانات Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({ token: currentToken }, { onConflict: 'token' });

      if (error) {
        console.error("حدث خطأ أثناء حفظ الرمز في Supabase:", error.message);
      }

      return currentToken;
    } else {
      console.warn("لم يتم العثور على رمز إشعارات، يرجى منح الصلاحية مجدداً.");
      return null;
    }
  } catch (error) {
    console.error("حدث خطأ أثناء طلب إذن الإشعارات:", error);
    return null;
  }
}