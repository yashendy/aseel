
import React, { useState } from 'react';
import { analyzeHealthData, getQuickNutritionAdvice, getNutritionTipsFromMeals } from '../services/geminiService';
import { BrainCircuitIcon } from './Icons';
import { SugarReading, MealLog, Appointment, ChildProfile, InsulinLog, ExerciseLog, SicknessLog } from '../types';

interface AIAssistantProps {
    allData: {
        sugarReadings: SugarReading[];
        mealLogs: MealLog[];
        insulinLogs: InsulinLog[];
        exerciseLogs: ExerciseLog[];
        sicknessLogs: SicknessLog[];
        appointments: Appointment[];
        profile: ChildProfile;
    };
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ allData }) => {
    const [activeTab, setActiveTab] = useState<'analysis' | 'advice' | 'tips'>('analysis');
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleQuery = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse('');
        try {
            let result;
            if (activeTab === 'analysis') {
                result = await analyzeHealthData(allData, query);
            } else {
                result = await getQuickNutritionAdvice(query);
            }
            setResponse(result);
        } catch (error) {
            setResponse('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetTips = async () => {
        setIsLoading(true);
        setResponse('');
        try {
            const result = await getNutritionTipsFromMeals(allData.mealLogs);
            setResponse(result);
        } catch (error) {
            setResponse('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const analysisSuggestions = [
        "حلل اتجاهات السكر خلال الأسبوع الماضي.",
        "ما هي العلاقة بين وجبات الغداء ومستويات السكر بعدها؟",
        "لخص أعلى وأدنى قراءات السكر ووضح أوقاتها.",
    ];

    const adviceSuggestions = [
        "ما هي أفضل وجبة خفيفة قبل ممارسة الرياضة؟",
        "هل يعتبر الزبادي اليوناني خيارًا جيدًا؟",
        "ما تأثير الأرز الأبيض على سكر الدم؟",
    ];
    
    const suggestions = activeTab === 'analysis' ? analysisSuggestions : adviceSuggestions;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <BrainCircuitIcon className="w-10 h-10 text-teal-500" />
                <h1 className="text-3xl font-bold text-slate-800">المساعد الذكي</h1>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex border-b mb-4 flex-wrap">
                    <button onClick={() => {setActiveTab('analysis'); setQuery(''); setResponse('');}} className={`px-4 sm:px-6 py-3 font-semibold ${activeTab === 'analysis' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>تحليل البيانات</button>
                    <button onClick={() => {setActiveTab('advice'); setQuery(''); setResponse('');}} className={`px-4 sm:px-6 py-3 font-semibold ${activeTab === 'advice' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>سؤال سريع</button>
                    <button onClick={() => {setActiveTab('tips'); setQuery(''); setResponse('');}} className={`px-4 sm:px-6 py-3 font-semibold ${activeTab === 'tips' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>نصائح التغذية</button>
                </div>
                
                {activeTab === 'tips' ? (
                     <div className="mb-4 text-center">
                        <p className="text-slate-600 mb-4">
                            احصل على نصائح تغذية سريعة ومخصصة بناءً على الوجبات التي سجلتها لطفلك. سيقوم المساعد بتحليل الأنماط الغذائية وتقديم اقتراحات مفيدة.
                        </p>
                        <button 
                            onClick={handleGetTips}
                            disabled={isLoading}
                            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-slate-400 flex items-center justify-center gap-2 mx-auto"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري إنشاء النصائح...
                                </>
                            ) : 'احصل على نصائح التغذية'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-slate-600 mb-2">
                                {activeTab === 'analysis' ? 'اطرح سؤالاً حول بيانات طفلك المسجلة للحصول على تحليل للأنماط والاتجاهات.' : 'اسأل عن الأطعمة أو المكونات للحصول على نصيحة غذائية عامة وسريعة.'}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {suggestions.map((s, i) => (
                                    <button key={i} onClick={() => setQuery(s)} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full hover:bg-teal-100 hover:text-teal-700 transition">
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                                rows={3}
                                placeholder={activeTab === 'analysis' ? "مثال: لخص لي قراءات هذا الأسبوع..." : "مثال: هل الشوفان مناسب لوجبة الإفطار؟"}
                            />
                        </div>
                        
                        <button 
                            onClick={handleQuery}
                            disabled={isLoading}
                            className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-slate-400 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري التحليل...
                                </>
                            ) : 'إرسال'}
                        </button>
                    </>
                )}
                
                {response && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                        <h3 className="font-bold text-lg mb-2">إجابة المساعد الذكي:</h3>
                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{response}</div>
                    </div>
                )}
            </div>
        </div>
    );
};