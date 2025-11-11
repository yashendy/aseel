
import React from 'react';
import { ChildProfile } from '../types';
import { Share2Icon, CheckCircleIcon } from './Icons';

interface CGMIntegrationPageProps {
    profile: ChildProfile;
    onConnectCGM: (childId: number, provider: 'dexcom' | 'freestyle') => void;
    onDisconnectCGM: (childId: number) => void;
}

const CGMCard: React.FC<{
    name: string;
    logoUrl: string;
    description: string;
    isConnected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
}> = ({ name, logoUrl, description, isConnected, onConnect, onDisconnect }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-start">
            <div className="flex items-center justify-between w-full mb-4">
                <img src={logoUrl} alt={`${name} logo`} className="h-10" />
                {isConnected && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>متصل</span>
                    </div>
                )}
            </div>
            <p className="text-sm text-slate-600 mb-6 flex-grow">{description}</p>
            {isConnected ? (
                <div className="w-full mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 justify-center">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                        جاري استقبال البيانات الحية...
                    </div>
                    <button 
                        onClick={onDisconnect}
                        className="w-full bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                        قطع الاتصال
                    </button>
                </div>
            ) : (
                <button
                    onClick={onConnect}
                    className="w-full mt-auto bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                    ربط الحساب
                </button>
            )}
        </div>
    );
};

export const CGMIntegrationPage: React.FC<CGMIntegrationPageProps> = ({ profile, onConnectCGM, onDisconnectCGM }) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Share2Icon className="w-10 h-10 text-teal-500" />
                <h1 className="text-3xl font-bold text-slate-800">ربط أجهزة قياس السكر المستمر (CGM)</h1>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-2">اتصال تلقائي، دقة أعلى</h2>
                <p className="text-slate-600 max-w-3xl">
                    اربط جهاز قياس السكر المستمر الخاص بطفلك بالمنصة لسحب البيانات تلقائيًا. هذا يضمن أن تكون البيانات دقيقة ومحدثة دائمًا بدون الحاجة للإدخال اليدوي، مما يوفر رؤى أفضل لك ولطبيبك.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CGMCard
                    name="Dexcom"
                    logoUrl="https://s3-us-west-2.amazonaws.com/dexcom-assets/images/dexcom-logo-400.png"
                    description="اربط حساب Dexcom الخاص بك لمزامنة قراءات السكر مباشرةً من جهاز G6 أو G7 الخاص بطفلك."
                    isConnected={profile.cgm === 'dexcom'}
                    onConnect={() => onConnectCGM(profile.id, 'dexcom')}
                    onDisconnect={() => onDisconnectCGM(profile.id)}
                />
                <CGMCard
                    name="FreeStyle Libre"
                    logoUrl="https://freestylediabetes.co.uk/media/wysiwyg/images/libre-logo.png"
                    description="قم بمزامنة بياناتك من أجهزة FreeStyle Libre 2 أو 3 عبر حساب LibreView الخاص بك للحصول على تحديثات مستمرة."
                    isConnected={profile.cgm === 'freestyle'}
                    onConnect={() => onConnectCGM(profile.id, 'freestyle')}
                    onDisconnect={() => onDisconnectCGM(profile.id)}
                />
            </div>
        </div>
    );
};
