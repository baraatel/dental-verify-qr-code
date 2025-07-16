
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">نظام التحقق من تراخيص العيادات</h3>
            <p className="text-gray-300 text-sm">
              نظام متطور للتحقق السريع والآمن من تراخيص عيادات الأسنان في الأردن
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">الميزات</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• مسح رمز QR السريع</li>
              <li>• التحقق اليدوي من الترخيص</li>
              <li>• رفع ملفات Excel</li>
              <li>• إدارة شاملة للعيادات</li>
              <li>• تتبع عمليات التحقق</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات التطوير</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>تطوير: د. بارا صادق</p>
              <p>رئيس لجنة تكنولوجيا المعلومات</p>
              <p>نقابة أطباء الأسنان الأردنية</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm mb-2">
            جميع الحقوق محفوظة © {new Date().getFullYear()} نقابة أطباء الأسنان الأردنية
          </p>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
            Built with ❤️ by Dr. Bara Sadeq
            <br />
            President of JDA IT Committee
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
