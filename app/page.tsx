import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="חינוך פלוס" 
                width={140} 
                height={50}
                className="object-contain"
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-emerald-700 transition-colors">התוכניות שלנו</a>
              <a href="#about" className="text-gray-600 hover:text-emerald-700 transition-colors">אודות</a>
              <a href="#contact" className="text-gray-600 hover:text-emerald-700 transition-colors">צור קשר</a>
              <Link 
                href="/auth/login"
                className="bg-emerald-700 text-white px-6 py-2.5 rounded-full font-medium hover:bg-emerald-800 transition-all hover:shadow-lg"
              >
                כניסה לאזור אישי
              </Link>
            </div>
            {/* Mobile menu button */}
            <Link 
              href="/auth/login"
              className="md:hidden bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              כניסה
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                מובילים בחינוך
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                מביאים את{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-700 to-orange-500">
                  העתיד
                </span>
                <br />לכיתה
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                שיעורי אנגלית, מדריכים מקצועיים ותוכניות חדשניות לבתי ספר בכל הארץ. 
                בשיתוף פעולה עם גפן.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/auth/login"
                  className="bg-gradient-to-l from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  כניסה לאזור אישי
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <a 
                  href="#contact"
                  className="border-2 border-emerald-700 text-emerald-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 hover:text-white transition-all duration-300"
                >
                  צרו קשר
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 shadow-xl">
                <Image 
                  src="/logo.png" 
                  alt="חינוך פלוס" 
                  width={350} 
                  height={150}
                  className="w-full object-contain"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-3 -right-3 bg-white rounded-xl p-3 shadow-lg animate-bounce">
                <span className="text-2xl">📚</span>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white rounded-xl p-3 shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-emerald-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-5xl font-bold">50+</div>
              <div className="text-emerald-200 text-lg">בתי ספר</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold">100+</div>
              <div className="text-emerald-200 text-lg">מדריכים מקצועיים</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold">10,000+</div>
              <div className="text-emerald-200 text-lg">תלמידים</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm tracking-wider">התוכניות שלנו</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">פתרונות חינוכיים מתקדמים</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              מגוון תוכניות המותאמות לצרכי בית הספר והתלמידים
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* English */}
            <Link href="/programs/english" className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2 block">
              <div className="relative">
                <span className="absolute -top-2 left-0 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  פעיל
                </span>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🇬🇧
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">אנגלית</h3>
              <p className="text-gray-600 leading-relaxed">
                שיעורי אנגלית מותאמים אישית עם מדריכים מנוסים, בשיטות הוראה מתקדמות המשלבות טכנולוגיה וחוויה.
              </p>
            </Link>

            {/* AI */}
            <Link href="/programs/ai" className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2 block">
              <div className="relative">
                <span className="absolute -top-2 left-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                  בקרוב
                </span>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🤖
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">תוכנית AI</h3>
              <p className="text-gray-600 leading-relaxed">
                הכרות עם עולם הבינה המלאכותית - כלים, חשיבה ביקורתית ויישומים מעשיים לתלמידים בעידן החדש.
              </p>
            </Link>

            {/* Physics */}
            <Link href="/programs/physics" className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2 block">
              <div className="relative">
                <span className="absolute -top-2 left-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                  בקרוב
                </span>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  ⚛️
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">פיזיקה</h3>
              <p className="text-gray-600 leading-relaxed">
                תוכנית פיזיקה חווייתית עם ניסויים מעשיים והבנה עמוקה של העולם סביבנו בדרך מהנה ומעשירה.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm tracking-wider">היתרונות שלנו</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">למה לבחור בחינוך פלוס?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "👨‍🏫", title: "מדריכים מקצועיים", desc: "צוות מדריכים מוסמך ומנוסה עם תשוקה אמיתית להוראה" },
              { icon: "🎯", title: "תוכניות מותאמות", desc: "התאמה אישית לצרכי בית הספר והתלמידים" },
              { icon: "💻", title: "טכנולוגיה מתקדמת", desc: "שילוב כלים דיגיטליים ומערכות מעקב מתקדמות" },
              { icon: "🤝", title: "ליווי צמוד", desc: "תמיכה שוטפת לצוותי ההוראה ולבתי הספר" },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex gap-4 items-start hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-l from-emerald-700 to-emerald-900">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">מוכנים להביא חינוך איכותי לבית הספר שלכם?</h2>
          <p className="text-xl text-emerald-100 mb-8">הצטרפו למאות בתי הספר שכבר נהנים מהתוכניות שלנו</p>
          <a 
            href="#contact"
            className="inline-block bg-white text-emerald-800 px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all hover:shadow-xl"
          >
            דברו איתנו
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="text-orange-500 font-semibold text-sm tracking-wider">צור קשר</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">נשמח לשמוע מכם</h2>
              <p className="text-gray-600 text-lg mb-8">
                נשמח להתאים עבורכם את התוכנית המושלמת לבית הספר
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">📧</div>
                  <span className="text-gray-700">info@edu-plus.co.il</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">📞</div>
                  <span className="text-gray-700">03-1234567</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">📍</div>
                  <span className="text-gray-700">ישראל</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">שם מלא</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">אימייל</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">שם בית הספר</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">הודעה</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-l from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                >
                  שליחה
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <Image 
                src="/logo.png" 
                alt="חינוך פלוס" 
                width={140} 
                height={50}
                className="object-contain brightness-0 invert mb-4"
              />
              <p className="text-gray-400">פתרונות חכמים בחינוך - מביאים את העתיד לכיתה</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">קישורים מהירים</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">התוכניות שלנו</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">אודות</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">צור קשר</a></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">כניסה לאזור אישי</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">מידע נוסף</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">תנאי שימוש</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">מדיניות פרטיות</Link></li>
                <li><Link href="/accessibility" className="hover:text-white transition-colors">הצהרת נגישות</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            © 2025 חינוך פלוס. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}