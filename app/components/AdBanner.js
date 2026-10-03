'use client';

import { useEffect } from 'react';

export default function AdBanner({ dataAdSlot, dataAdFormat = 'auto', fullWidthResponsive = 'true' }) {
  useEffect(() => {
    try {
      // تفعيل إعلانات أدسينس تلقائياً عند تحميل المكون
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense Error:', err);
    }
  }, []);

  return (
    <div className="w-full my-6 flex justify-center items-center overflow-hidden">
      {/* حاوية زجاجية شيك تحافظ على تصميم الموقع */}
      <div className="w-full max-w-lg bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg text-center relative min-h-[90px] flex items-center justify-center">
        {/* كلمة إعلان خفيفة باللون الرمادي */}
        <span className="absolute top-1 right-3 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
          إعلان - Advertisement
        </span>

        {/* كود Google AdSense */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-5651770638848657" // 👈 استبدل ده برقم معرّف الناشر بتاعك في أدسينس
          data-ad-slot={dataAdSlot}
          data-ad-format={dataAdFormat}
          data-full-width-responsive={fullWidthResponsive}
        ></ins>
      </div>
    </div>
  );
}