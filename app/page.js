'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [giftType, setGiftType] = useState('romantic');
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [password, setPassword] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [promiseMessage, setPromiseMessage] = useState('');
  const [enablePhotos, setEnablePhotos] = useState(false);
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  // دالة لضغط الصور لتكون بحجم صغير وتتحفظ في الفايربيز بسرعة وبدون مشاكل
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; // أقصى عرض للصورة
          const scaleFactor = MAX_WIDTH / img.width;
          
          if (scaleFactor < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleFactor;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // ضغط الصورة بجودة 0.6
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const compressedData = await compressImage(file);
      setPhotos((prev) => [...prev, { fileData: compressedData, caption: '' }]);
    }
  };

  const handleCaptionChange = (index, value) => {
    const newPhotos = [...photos];
    if (newPhotos[index]) {
      newPhotos[index].caption = value;
      setPhotos(newPhotos);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const giftId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    const giftData = {
      type: giftType,
      sender: sender || 'غير محدد',
      receiver: receiver || 'شخص عزيز',
      password: password || '1234',
      musicUrl,
      promiseMessage,
      enablePhotos,
      photos: enablePhotos ? photos : [],
      createdAt: new Date().toISOString()
    };

    try {
      if (db) {
        await addDoc(collection(db, "gifts"), { ...giftData, customId: giftId });
      }
    } catch (err) {
      console.error("Firebase error:", err);
    }

    const link = `${window.location.origin}/gift/${giftId}`;
    setGeneratedLink(link);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#090714] text-white p-4 flex flex-col items-center justify-center dir-rtl">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(255,46,147,0.15)] space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2E93] to-[#8A2BE2]">
            LoveLink 🧩
          </h1>
          <p className="text-xs text-gray-400">اصنع بطاقة سحرية بكلمة سر خاصة جداً 🔒</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex gap-2 p-1 bg-[#120F24] rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setGiftType('romantic')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${giftType === 'romantic' ? 'bg-gradient-to-r from-[#FF2E93] to-[#FF4D6D] text-white' : 'text-gray-400'}`}
            >
              ❤ هدية رومانسية
            </button>
            <button
              type="button"
              onClick={() => setGiftType('birthday')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${giftType === 'birthday' ? 'bg-gradient-to-r from-[#8A2BE2] to-[#A100FF] text-white' : 'text-gray-400'}`}
            >
              🎂 عيد ميلاد
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 font-bold mb-1">اسم الشخص</label>
              <input
                type="text"
                required
                placeholder="مثلاً: امي"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#120F24] border border-white/10 text-xs text-white outline-none focus:border-[#FF2E93]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 font-bold mb-1">اسمك</label>
              <input
                type="text"
                required
                placeholder="مثلاً: محمد"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#120F24] border border-white/10 text-xs text-white outline-none focus:border-[#FF2E93]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-bold mb-1">🔐 كلمة السر للهدية</label>
            <input
              type="text"
              required
              placeholder="اكتب باسورد الهدية..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#120F24] border border-white/10 text-xs text-white outline-none focus:border-[#FF2E93]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-300 font-bold">📷 إضافة ألبوم صور وخواطر</label>
              <input
                type="checkbox"
                checked={enablePhotos}
                onChange={(e) => setEnablePhotos(e.target.checked)}
                className="w-4 h-4 accent-[#FF2E93]"
              />
            </div>

            {enablePhotos && (
              <div className="space-y-3 p-3 bg-[#120F24] rounded-2xl border border-white/10">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FF2E93] file:text-white hover:file:opacity-80"
                />

                {photos.map((photo, index) => (
                  <div key={index} className="space-y-1">
                    <img src={photo.fileData} alt="preview" className="w-full h-32 object-cover rounded-xl" />
                    <input
                      type="text"
                      placeholder="اكتب خاطرة أو وصف لـ الصورة..."
                      value={photo.caption}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-bold mb-1">🎵 رابط الأغنية</label>
            <input
              type="text"
              placeholder="ضع رابط الموسيقى..."
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#120F24] border border-white/10 text-xs text-white outline-none focus:border-[#FF2E93]"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-bold mb-1">🤝❤️ رسالة الوعد أو الخاتمة</label>
            <textarea
              rows="3"
              placeholder="اكتب الوعد..."
              value={promiseMessage}
              onChange={(e) => setPromiseMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#120F24] border border-white/10 text-xs text-white outline-none focus:border-[#FF2E93]"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#FF2E93] via-[#FF4D6D] to-[#8A2BE2] hover:opacity-90 rounded-2xl font-black text-sm shadow-[0_0_25px_rgba(255,46,147,0.4)] transition-all"
          >
            {loading ? 'جاري التجهيز... 🚀' : 'إنهاء وإنشاء الرابط ✨'}
          </button>
        </form>

        {generatedLink && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
            <p className="text-xs text-emerald-400 font-bold">تم إنشاء الهدية بنجاح! 🎉</p>
            <input
              type="text"
              readOnly
              value={generatedLink}
              className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-center text-gray-200 select-all"
            />
            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400"
            >
              نسخ الرابط 📋
            </button>
          </div>
        )}

      </div>
    </main>
  );
}