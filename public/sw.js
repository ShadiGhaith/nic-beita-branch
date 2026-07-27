self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : { title: 'تنبيه جديد', body: 'لديك إشعار من فرع التأمين' };
  
  const options = {
    body: data.body,
    icon: '/icon.png', // ضع صورة شعار الفرع هنا إن وجدت
    badge: '/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});