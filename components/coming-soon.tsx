import Link from "next/link";
import Image from "next/image";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: string;
}

export function ComingSoon({ 
  title, 
  description = "הדף בבנייה ויהיה זמין בקרוב",
  icon = "🚧"
}: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8">
          <Image 
            src="/logo.png" 
            alt="חינוך פלוס" 
            width={150} 
            height={60}
            className="object-contain mx-auto"
          />
        </Link>
        
        {/* Icon */}
        <div className="text-6xl mb-6">{icon}</div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        
        {/* Description */}
        <p className="text-gray-600 mb-8">{description}</p>
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          בקרוב
        </div>
        
        {/* Back button */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
