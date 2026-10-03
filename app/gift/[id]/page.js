'use client';

import { useState, useEffect, use } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import AdBanner from '../../../components/AdBanner'; // 👈 استدعاء مكون الإعلانات

export default function GiftPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const giftId = params.id;

  const [gift, setGift] = useState(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [unlockedPhotos, setUnlockedPhotos] = useState({});
  const [floatingHearts, setFloatingHearts] = useState([]);

  useEffect(() => {
    async function fetchGift() {
      try {
        if (!db) return;
        const q = query(collection(db, "gifts"), where("customId", "==", giftId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            setGift(doc.data());
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching gift:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (giftId) {
      fetchGift();
    }
  }, [giftId]);

  // فحص نوع المناسبة بدقة سواء حفظتها بـ occasion أو type أو giftType
  const occasionType = (gift?.occasion || gift?.type || gift?.giftType || '').toLowerCase();
  const isBirthday = occasionType.includes('birthday') || occasionType.includes('عيد') || occasionType.includes('ميلاد');

  const handleGlobalClick = (e) => {
    const newIcon = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      symbol: isBirthday ? ['🎉', '🎈', '🎁', '✨'][Math.floor(Math.random() * 4)] : '💖'
    };
    setFloatingHearts((prev) => [...prev.slice(-15), newIcon]);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (gift && gift.password === enteredPassword) {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('كلمة السر غير صحيحة، حاول مرة أخرى! ❌');
    }
  };

  const togglePhoto = (index) => {
    setUnlockedPhotos((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // دالة تحويل روابط يوتيوب وساوند كلاود لـ Embed قابل للتشغيل المباشر
  const renderAudioPlayer = (url) => {
    if (!url) return null;

    // 1. رابط YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
      }

      if (videoId) {
        return (
          <div className="w-full overflow-hidden rounded-2xl shadow-lg border border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1`}
              title="YouTube Audio"
              className="w-full h-44 sm:h-48"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }

    // 2. رابط SoundCloud
    if (url.includes('soundcloud.com')) {
      const encodedUrl = encodeURIComponent(url);
      return (
        <div className="w-full overflow-hidden rounded-2xl shadow-lg border border-white/10">
          <iframe
            width="100%"
            height="150"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff2e93&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
          ></iframe>
        </div>
      );
    }

    // 3. رابط صوتي مباشر MP3 / M4A
    return (
      <audio controls autoPlay src={url} className="w-full h-10 rounded-xl accent-[#FF2E93]" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050e] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-[#FF2E93] border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse text-sm font-bold text-[#FF2E93]">جاري تجهيز المفاجأة... 🎁✨</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#07050e] text-white flex flex-col items-center justify-center p-4 dir-rtl text-center">
        <div className="p-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 space-y-4 max-w-sm">
          <div className="text-6xl animate-bounce">💔</div>
          <h1 className="text-xl font-black text-red-400">الهدية غير موجودة!</h1>
          <p className="text-xs text-gray-400">تأكد من صحة الرابط أو اطلب الرابط المظبوط مرة أخرى.</p>
        </div>
      </div>
    );
  }

  // 🎆 جرافيك خلفية عيد الميلاد (مفرقعات وشرائط ملونة)
  const BirthdayBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#090514] via-[#150a21] to-[#090514]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-r from-[#FF007A]/20 via-[#7000FF]/25 to-[#00F0FF]/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path d="M 100,-100 Q 250,300 50,600 T 200,1100" fill="none" stroke="#FF2E93" strokeWidth="18" strokeLinecap="round" className="animate-neon-slow" style={{ filter: 'drop-shadow(0 0 15px #FF2E93)' }} />
        <path d="M 850,-100 Q 700,400 900,700 T 800,1100" fill="none" stroke="#00F0FF" strokeWidth="16" strokeLinecap="round" className="animate-neon-slow" style={{ filter: 'drop-shadow(0 0 15px #00F0FF)' }} />
        <path d="M 500,-100 Q 300,200 600,600 T 450,1100" fill="none" stroke="#FFB703" strokeWidth="12" strokeLinecap="round" className="animate-neon-slow" style={{ filter: 'drop-shadow(0 0 12px #FFB703)' }} />
      </svg>

      <div className="absolute inset-0">
        <div className="absolute top-[-5%] left-[10%] w-4 h-8 bg-[#FF2E93] rounded-sm rotate-45 animate-confetti-slow shadow-[0_0_10px_#FF2E93]"></div>
        <div className="absolute top-[-5%] left-[25%] w-6 h-6 bg-[#00F0FF] rotate-12 animate-confetti-fast shadow-[0_0_10px_#00F0FF]"></div>
        <div className="absolute top-[-5%] left-[45%] w-3 h-7 bg-[#FFB703] -rotate-45 animate-confetti-slow shadow-[0_0_10px_#FFB703]"></div>
        <div className="absolute top-[-5%] left-[65%] w-5 h-5 bg-[#7000FF] rotate-90 animate-confetti-fast shadow-[0_0_10px_#7000FF]"></div>
        <div className="absolute top-[-5%] left-[85%] w-4 h-8 bg-[#00FF87] -rotate-12 animate-confetti-slow shadow-[0_0_10px_#00FF87]"></div>
      </div>

      <div className="absolute top-[10%] left-[8%] text-4xl animate-mini-heart-1">🎈</div>
      <div className="absolute top-[15%] right-[10%] text-3xl animate-mini-heart-2">🎉</div>
      <div className="absolute bottom-[15%] left-[10%] text-4xl animate-mini-heart-3">🎂</div>
      <div className="absolute bottom-[20%] right-[8%] text-3xl animate-mini-heart-1">✨</div>
    </div>
  );

  // 💖 جرافيك خلفية الحب والقلوب النيون
  const LoveBackground = () => (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 bg-[#07050e]">
      <div className="w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] relative animate-neon-slow transition-all duration-1000">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2E93" />
              <stop offset="50%" stopColor="#FF4D6D" />
              <stop offset="100%" stopColor="#8A2BE2" />
            </linearGradient>
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#7000FF" />
            </linearGradient>
          </defs>

          <path d="M250,430 C250,430 60,300 60,170 C60,100 115,50 185,50 C225,50 245,75 250,85 C255,75 275,50 315,50 C385,50 440,100 440,170 C440,300 250,430 250,430 Z" fill="none" stroke="url(#neonGradient)" strokeWidth="12" strokeLinecap="round" />
          <path d="M330,80 C375,80 410,115 410,165" fill="none" stroke="#FFB703" strokeWidth="6" strokeLinecap="round" />
          <path d="M170,375 C120,335 90,270 90,200" fill="none" stroke="#FFB703" strokeWidth="6" strokeLinecap="round" />

          <text x="250" y="215" textAnchor="middle" fill="none" stroke="url(#textGradient)" strokeWidth="4" className="text-5xl font-black tracking-widest uppercase font-sans" style={{ filter: "drop-shadow(0 0 12px #00F0FF)" }}>LOVE</text>
          <text x="250" y="275" textAnchor="middle" fill="none" stroke="url(#textGradient)" strokeWidth="4" className="text-5xl font-black tracking-widest uppercase font-sans" style={{ filter: "drop-shadow(0 0 12px #00F0FF)" }}>YOU</text>
        </svg>
      </div>

      <div className="absolute top-[12%] left-[10%] sm:left-[20%] text-3xl animate-mini-heart-1">💖</div>
      <div className="absolute top-[20%] right-[12%] sm:right-[22%] text-2xl animate-mini-heart-2">✨</div>
      <div className="absolute bottom-[18%] left-[12%] sm:left-[22%] text-3xl animate-mini-heart-3">💕</div>
      <div className="absolute bottom-[12%] right-[10%] sm:right-[20%] text-2xl animate-mini-heart-1">🌸</div>
    </div>
  );

  return (
    <main 
      onClick={handleGlobalClick}
      className="min-h-screen text-white p-4 sm:p-6 flex flex-col items-center dir-rtl relative overflow-hidden select-none"
    >
      {/* اختيار الخلفية تلقائياً حسب نوع الهدية */}
      {isBirthday ? <BirthdayBackground /> : <LoveBackground />}

      {/* الرموز المتطايرة التفاعلية عند النقر */}
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          style={{ left: h.x - 12, top: h.y - 12 }}
          className="fixed pointer-events-none text-2xl animate-bounce z-50 transition-all duration-700 opacity-90"
        >
          {h.symbol}
        </span>
      ))}

      {!isUnlocked ? (
        /* شاشة القفل وإدخال كلمة السر */
        <div className="w-full max-w-md bg-black/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/15 shadow-[0_0_80px_rgba(255,46,147,0.25)] text-center space-y-6 relative z-10 my-auto">
          <div className="space-y-3">
            <div className="inline-block p-5 bg-gradient-to-tr from-[#FF2E93] to-[#8A2BE2] rounded-full shadow-lg animate-bounce">
              <span className="text-5xl">{isBirthday ? '🎂' : '🎁'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2E93] via-[#FF85A1] to-[#8A2BE2]">
              {isBirthday ? 'مفاجأة عيد الميلاد! 🎉' : 'وصلتك مفاجأة خاصة! ✨'}
            </h1>
            <p className="text-xs text-gray-300 font-medium">أدخلي كلمة السر السحرية لفتح الهدية 🔒</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              required
              placeholder="اكتب كلمة السر هنا..."
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black/60 border border-white/20 text-center text-white text-base tracking-widest outline-none focus:border-[#FF2E93] focus:ring-2 focus:ring-[#FF2E93]/50 transition-all placeholder:tracking-normal placeholder:text-xs"
            />

            {errorMsg && <p className="text-xs text-red-400 font-bold animate-pulse">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#FF2E93] via-[#FF4D6D] to-[#8A2BE2] hover:scale-105 active:scale-95 rounded-2xl font-black text-sm text-white shadow-[0_0_30px_rgba(255,46,147,0.5)] transition-all flex items-center justify-center gap-2"
            >
              <span>افتح المفاجأة</span>
              <span>✨</span>
            </button>
          </form>

          {/* 🎯 إعلان في شاشة القفل */}
          <AdBanner dataAdSlot="1947414515" />
        </div>
      ) : (
        /* شاشة عرض الهدية الفعالة */
        <div className="w-full max-w-lg space-y-8 relative z-10 my-auto py-8">
          {/* كارت الإهداء */}
          <div className="bg-black/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-[0_0_60px_rgba(255,46,147,0.25)] text-center space-y-3">
            <div className="text-5xl animate-pulse">{isBirthday ? '🥳' : '💌'}</div>
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">
                {isBirthday ? 'تهنئة خاصة من' : 'رسالة حب خاصة من'}
              </span>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2E93] to-[#FF85A1]">
                {gift?.sender}
              </h2>
              <p className="text-xs text-gray-300">
                إلى: <span className="text-[#FF85A1] font-bold text-base">{gift?.receiver}</span> {isBirthday ? '🎈' : '❤️'}
              </p>
            </div>
          </div>

          {/* 🎯 إعلان تحت كارت التهنئة */}
          <AdBanner dataAdSlot="1234567890" />

          {/* مشغل الأغنية الشامل (YouTube / SoundCloud / Direct MP3) */}
          {gift?.musicUrl && (
            <div className="bg-black/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 shadow-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-[#FF2E93] to-[#8A2BE2] rounded-2xl flex items-center justify-center text-xl shadow-md animate-spin-slow">
                  🎶
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs font-bold text-white">الموسيقى المخصصة 🎧</p>
                  <p className="text-[10px] text-gray-300">استمتعي بالاستماع أثناء تصفح الهدية...</p>
                </div>
              </div>

              {renderAudioPlayer(gift.musicUrl)}
            </div>
          )}

          {/* الرسالة / الخاطرة */}
          {gift?.promiseMessage && (
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/15 text-center relative shadow-inner">
              <p className="text-sm sm:text-base leading-relaxed text-pink-100 font-medium py-2">
                "{gift.promiseMessage}"
              </p>
            </div>
          )}

          {/* 🎯 إعلان قبل ألبوم الصور */}
          <AdBanner dataAdSlot="1947414515" />

          {/* ألبوم الصور التفاعلي */}
          {gift?.enablePhotos && gift?.photos?.length > 0 && (
            <div className="space-y-6 pt-2">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2E93] to-[#8A2BE2]">
                  📸 صندوق الذكريات المغلف
                </h3>
                <p className="text-[11px] text-gray-400">اضغطي على كل هدية لاكتشاف الصورة والسر خلفها ✨</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {gift.photos.map((photo, index) => {
                  const isOpened = unlockedPhotos[index];

                  return (
                    <div key={index} className="relative group">
                      {!isOpened ? (
                        <button
                          onClick={() => togglePhoto(index)}
                          className="w-full h-64 sm:h-72 bg-gradient-to-br from-[#FF2E93]/20 via-[#07050e]/80 to-[#8A2BE2]/20 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-[#FF2E93]/50 flex flex-col items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
                        >
                          <div className="w-16 h-16 bg-gradient-to-tr from-[#FF2E93] to-[#8A2BE2] rounded-full flex items-center justify-center text-3xl shadow-lg animate-bounce">
                            🎁
                          </div>
                          <span className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-full border border-white/20">
                            اضغطي لفتح المفاجأة رقم ({index + 1}) ✨
                          </span>
                        </button>
                      ) : (
                        <div className="bg-black/50 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/20 shadow-2xl space-y-3 animate-fade-in">
                          <div className="overflow-hidden rounded-2xl relative">
                            <img
                              src={photo.fileData}
                              alt={`Memory ${index}`}
                              className="w-full h-64 sm:h-72 object-cover rounded-2xl shadow-md"
                            />
                          </div>
                          {photo.caption && (
                            <div className="p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                              <p className="text-xs sm:text-sm text-pink-100 font-medium leading-relaxed">
                                ✨ {photo.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center pt-6 space-y-1">
            <p className="text-[11px] text-gray-400">صُنعت بحب بواسطة LoveLink 💖</p>
          </div>
        </div>
      )}
    </main>
  );
}