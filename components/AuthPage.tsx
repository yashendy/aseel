import React, { useState } from 'react';
import { HERO_IMAGE_BASE64, LOGO_IMAGE_BASE64 } from '../constants';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => boolean;
  onRegister: (email: string, pass: string, name: string, inviteCode?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('');

  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(loginEmail, loginPass);
    if (!success) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPass) {
        setError('يرجى ملء جميع الحقول المطلوبة.');
        return;
    }
    onRegister(regEmail, regPass, regName, regInviteCode);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'login':
        return (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-slate-800">تسجيل الدخول</h2>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">البريد الإلكتروني</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-3 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">كلمة المرور</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full p-3 border rounded-md" required />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition">دخول</button>
          </form>
        );
      case 'register':
        return (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-slate-800">إنشاء حساب جديد</h2>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">الاسم الكامل</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full p-3 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">البريد الإلكتروني</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full p-3 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">كلمة المرور</label>
              <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} className="w-full p-3 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">كود الدعوة (اختياري)</label>
              <input type="text" value={regInviteCode} onChange={e => setRegInviteCode(e.target.value)} placeholder="للطبيب أو ولي الأمر" className="w-full p-3 border rounded-md" />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition">إنشاء حساب</button>
          </form>
        );
      case 'forgot':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">نسيت كلمة المرور؟</h2>
            <p className="text-slate-600">يرجى التواصل مع الدعم الفني لاستعادة حسابك.</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl flex overflow-hidden">
        {/* Left Side (Form) */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <img src={LOGO_IMAGE_BASE64} alt="شعار" className="h-16 mb-8" />
            <div className="mb-8 border-b">
              <nav className="flex -mb-px">
                <button onClick={() => {setActiveTab('login'); setError('')}} className={`px-4 py-3 font-semibold border-b-2 ${activeTab === 'login' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}>تسجيل الدخول</button>
                <button onClick={() => {setActiveTab('register'); setError('')}} className={`px-4 py-3 font-semibold border-b-2 ${activeTab === 'register' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}>إنشاء حساب</button>
                <button onClick={() => {setActiveTab('forgot'); setError('')}} className={`px-4 py-3 font-semibold border-b-2 ${activeTab === 'forgot' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}>نسيت كلمة المرور</button>
              </nav>
            </div>
            {renderTabContent()}
          </div>
          <div className="text-center text-xs text-slate-400 mt-8">
            <p>&copy; {new Date().getFullYear()} منصة سكري طفلي. جميع الحقوق محفوظة.</p>
            <p className="mt-1">هذه المنصة للتوعية والمتابعة ولا تغني عن استشارة الطبيب المختص.</p>
          </div>
        </div>

        {/* Right Side (Image & Info) */}
        <div className="hidden md:block md:w-1/2 bg-teal-50 p-12">
            <img src={HERO_IMAGE_BASE64} alt="طفل يمارس الرياضة" className="w-full h-auto rounded-lg mb-8" />
            <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                    <span className="text-teal-500 font-bold text-xl mt-1">&#10003;</span>
                    <span><strong className="font-semibold">متابعة دقيقة:</strong> سجل قراءات السكر والوجبات بسهولة لتكون دائمًا على اطلاع.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-teal-500 font-bold text-xl mt-1">&#10003;</span>
                    <span><strong className="font-semibold">تخطيط الوجبات:</strong> استخدم حاسبة الكربوهيدرات المدمجة لتخطيط وجبات صحية ومتوازنة.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-teal-500 font-bold text-xl mt-1">&#10003;</span>
                    <span><strong className="font-semibold">نمط حياة صحي:</strong> شجع طفلك على ممارسة الرياضة بانتظام كجزء أساسي من إدارة السكري.</span>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};