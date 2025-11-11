
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SugarReading, LogType, ChildProfile, InsulinLog, ExerciseLog, SicknessLog } from '../types';
import { DropletIcon, ArrowUpCircleIcon, SyringeIcon, RunningIcon, ThermometerIcon } from './Icons';
import { MG_DL_PER_MMOL_L } from '../constants';

interface MeasurementPageProps {
    sugarReadings: SugarReading[];
    addLog: (type: LogType, data: any) => void;
    profile: ChildProfile;
}

const toDateInputString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const toTimeInputString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const SugarForm: React.FC<Pick<MeasurementPageProps, 'addLog' | 'profile'>> = ({ addLog, profile }) => {
    const today = new Date();
    const [date, setDate] = useState(toDateInputString(today));
    const [time, setTime] = useState(toTimeInputString(today));
    const [value, setValue] = useState('');
    const [timeContext, setTimeContext] = useState<SugarReading['timeContext']>('other');
    const [mealType, setMealType] = useState<NonNullable<SugarReading['mealType']>>('breakfast');
    const [hypoTreatment, setHypoTreatment] = useState('');
    const [correctionDose, setCorrectionDose] = useState<number | null>(null);
    const [isCorrectionManual, setIsCorrectionManual] = useState(false);
    const [entryUnit, setEntryUnit] = useState<'mg/dL' | 'mmol/L'>(profile.glucoseUnit);

    const numericValue = value ? parseFloat(value) : null;
    const valueInMgdl = useMemo(() => {
        if (numericValue === null) return null;
        return entryUnit === 'mmol/L' ? numericValue * MG_DL_PER_MMOL_L : numericValue;
    }, [numericValue, entryUnit]);

    const isHypo = valueInMgdl !== null && valueInMgdl < profile.hypoglycemiaLevel;
    const isHyper = valueInMgdl !== null && valueInMgdl > profile.hyperglycemiaLevel;

    useEffect(() => {
        if (isHyper && !isCorrectionManual && valueInMgdl) {
            const calculatedDose = (valueInMgdl - profile.hyperglycemiaLevel) / profile.correctionFactor;
            setCorrectionDose(Math.max(0, parseFloat(calculatedDose.toFixed(1))));
        } else if (!isHyper) {
            setCorrectionDose(null);
            setIsCorrectionManual(false);
        }
    }, [isHyper, isCorrectionManual, valueInMgdl, profile.hyperglycemiaLevel, profile.correctionFactor]);
    
    useEffect(() => {
        if (timeContext === 'after_meal' && mealType === 'other') {
            setMealType('breakfast');
        }
    }, [timeContext, mealType]);

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUnit = e.target.value as 'mg/dL' | 'mmol/L';
        const oldUnit = entryUnit;
        setEntryUnit(newUnit);
        if (value) {
            const numericVal = parseFloat(value);
            if (!isNaN(numericVal)) {
                let convertedValue: string;
                if (newUnit === 'mmol/L' && oldUnit === 'mg/dL') {
                    convertedValue = (numericVal / MG_DL_PER_MMOL_L).toFixed(1);
                } else if (newUnit === 'mg/dL' && oldUnit === 'mmol/L') {
                    convertedValue = (numericVal * MG_DL_PER_MMOL_L).toFixed(0);
                } else { return; }
                setValue(convertedValue);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (valueInMgdl === null || isNaN(valueInMgdl)) return;

        const logData: Partial<SugarReading> = {
            value: valueInMgdl,
            date: new Date(`${date}T${time}`).toISOString(),
            timeContext: timeContext,
            mealType: (timeContext === 'before_meal' || timeContext === 'after_meal') ? mealType : undefined,
        };

        if (isHypo && hypoTreatment) logData.hypoTreatment = hypoTreatment;
        if (isHyper && correctionDose !== null && correctionDose > 0) logData.correctionDose = correctionDose;

        addLog(LogType.SUGAR, logData);
        setValue(''); setHypoTreatment(''); setCorrectionDose(null); setIsCorrectionManual(false); setTime(toTimeInputString(new Date())); setTimeContext('other'); setMealType('breakfast');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">التاريخ</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">الوقت</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
            </div>
            <div>
                <label htmlFor="glucoseValue" className="block text-sm font-medium text-slate-600 mb-1">القياس</label>
                <div className="flex">
                    <input id="glucoseValue" type="number" placeholder="أدخل القراءة" value={value} onChange={e => { setValue(e.target.value); setIsCorrectionManual(false); }} className="w-full p-2 border border-r-0 rounded-l-md" required step="any" />
                    <select value={entryUnit} onChange={handleUnitChange} className="cursor-pointer appearance-none text-center pl-2 pr-8 py-2 border rounded-r-md bg-slate-50" aria-label="وحدة القياس" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                        <option value="mg/dL">mg/dL</option>
                        <option value="mmol/L">mmol/L</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">وقت القياس</label>
                <select value={timeContext} onChange={e => setTimeContext(e.target.value as SugarReading['timeContext'])} className="w-full p-2 border rounded-md bg-white">
                    <option value="before_meal">قبل الوجبة</option> <option value="after_meal">بعد الوجبة</option> <option value="fasting">صائم</option> <option value="exercise">رياضة</option> <option value="other">أخرى</option>
                </select>
            </div>
            {(timeContext === 'before_meal' || timeContext === 'after_meal') && (
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">الوجبة</label>
                    <select value={mealType} onChange={e => setMealType(e.target.value as NonNullable<SugarReading['mealType']>)} className="w-full p-2 border rounded-md bg-white" required>
                        <option value="breakfast">فطور</option> <option value="lunch">غداء</option> <option value="dinner">عشاء</option> <option value="snack">وجبة خفيفة</option> {timeContext === 'before_meal' && <option value="other">أخرى</option>}
                    </select>
                </div>
            )}
            {isHypo && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label htmlFor="hypoTreatment" className="block text-sm font-medium text-slate-600 mb-1">علاج الهبوط</label>
                    <input id="hypoTreatment" type="text" placeholder="مثال: 15 جرام عصير" value={hypoTreatment} onChange={e => setHypoTreatment(e.target.value)} className="w-full p-2 border rounded-md bg-white" />
                </div>
            )}
            {isHyper && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <label htmlFor="correctionDose" className="block text-sm font-medium text-slate-600 mb-1">جرعة التصحيح (وحدة)</label>
                    <input id="correctionDose" type="number" value={correctionDose === null ? '' : correctionDose} onChange={e => { setCorrectionDose(e.target.value ? parseFloat(e.target.value) : null); setIsCorrectionManual(true); }} className={`w-full p-2 border rounded-md transition-colors ${isCorrectionManual ? 'bg-white border-amber-400 focus:ring-amber-400' : 'bg-slate-100 border-slate-300 focus:ring-teal-400'}`} step="0.1" />
                    <p className="text-xs text-slate-500 mt-1">{isCorrectionManual ? 'تم تعديل الجرعة يدويًا.' : (correctionDose !== null && correctionDose > 0) ? 'جرعة مقترحة تلقائيًا.' : 'لا حاجة لجرعة تصحيح.'}</p>
                </div>
            )}
            <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition">تسجيل القياس</button>
        </form>
    );
};

const OtherEventsForm: React.FC<Pick<MeasurementPageProps, 'addLog'>> = ({ addLog }) => {
    const [activeTab, setActiveTab] = useState<'insulin' | 'exercise' | 'sickness'>('insulin');
    const [date, setDate] = useState(toDateInputString(new Date()));
    const [time, setTime] = useState(toTimeInputString(new Date()));

    const [insulinUnits, setInsulinUnits] = useState('');
    const [insulinType, setInsulinType] = useState<'bolus' | 'basal'>('bolus');
    
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
    
    const [sicknessNotes, setSicknessNotes] = useState('');

    const resetForms = () => {
        setInsulinUnits('');
        setActivity('');
        setDuration('');
        setSicknessNotes('');
    };

    const handleInsulinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const units = parseFloat(insulinUnits);
        if (units > 0) {
            addLog(LogType.INSULIN, { date: new Date(`${date}T${time}`).toISOString(), units, type: insulinType });
            resetForms();
        }
    };

    const handleExerciseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const durationMinutes = parseInt(duration, 10);
        if (activity && durationMinutes > 0) {
            addLog(LogType.EXERCISE, { date: new Date(`${date}T${time}`).toISOString(), activity, durationMinutes, intensity });
            resetForms();
        }
    };
    
    const handleSicknessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sicknessNotes) {
            addLog(LogType.SICKNESS, { date: new Date(`${date}T${time}`).toISOString(), notes: sicknessNotes });
            resetForms();
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">تسجيل أحداث أخرى</h2>
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('insulin')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${activeTab === 'insulin' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}><SyringeIcon className="w-5 h-5"/><span>أنسولين</span></button>
                <button onClick={() => setActiveTab('exercise')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${activeTab === 'exercise' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}><RunningIcon className="w-5 h-5"/><span>رياضة</span></button>
                <button onClick={() => setActiveTab('sickness')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${activeTab === 'sickness' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}><ThermometerIcon className="w-5 h-5"/><span>مرض</span></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-medium text-slate-600 mb-1">التاريخ</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-slate-600 mb-1">الوقت</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded-md" required /></div>
            </div>

            {activeTab === 'insulin' && (
                <form onSubmit={handleInsulinSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">الوحدات</label><input type="number" value={insulinUnits} onChange={e => setInsulinUnits(e.target.value)} className="w-full p-2 border rounded-md" step="0.5" required /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">النوع</label><select value={insulinType} onChange={e => setInsulinType(e.target.value as any)} className="w-full p-2 border rounded-md bg-white"><option value="bolus">سريع المفعول</option><option value="basal">قاعدي</option></select></div>
                    </div>
                    <button type="submit" className="w-full bg-sky-600 text-white p-3 rounded-lg font-semibold hover:bg-sky-700 transition">تسجيل جرعة الأنسولين</button>
                </form>
            )}
             {activeTab === 'exercise' && (
                <form onSubmit={handleExerciseSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-600 mb-1">النشاط</label><input type="text" value={activity} onChange={e => setActivity(e.target.value)} className="w-full p-2 border rounded-md" placeholder="مثل: لعب كرة قدم" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">المدة (دقائق)</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border rounded-md" required /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">الشدة</label><select value={intensity} onChange={e => setIntensity(e.target.value as any)} className="w-full p-2 border rounded-md bg-white"><option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option></select></div>
                    </div>
                    <button type="submit" className="w-full bg-sky-600 text-white p-3 rounded-lg font-semibold hover:bg-sky-700 transition">تسجيل النشاط الرياضي</button>
                </form>
            )}
            {activeTab === 'sickness' && (
                <form onSubmit={handleSicknessSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-600 mb-1">ملاحظات</label><textarea value={sicknessNotes} onChange={e => setSicknessNotes(e.target.value)} className="w-full p-2 border rounded-md" rows={3} placeholder="مثل: ارتفاع درجة الحرارة، أعراض برد..." required /></div>
                    <button type="submit" className="w-full bg-sky-600 text-white p-3 rounded-lg font-semibold hover:bg-sky-700 transition">تسجيل يوم مرضي</button>
                </form>
            )}
        </div>
    );
};


export const MeasurementPage: React.FC<MeasurementPageProps> = ({ sugarReadings, addLog, profile }) => {
    const [selectedDate, setSelectedDate] = useState(toDateInputString(new Date()));

    const dailyReadings = useMemo(() => {
        return sugarReadings.filter(r => toDateInputString(new Date(r.date)) === selectedDate)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedDate, sugarReadings]);

    const getReadingRowClass = (readingValue: number) => {
        if (readingValue < profile.hypoglycemiaLevel) return 'bg-blue-100 border-l-4 border-blue-500';
        if (readingValue >= profile.criticalHyperglycemiaLevel) return 'bg-red-200 border-l-4 border-red-800';
        if (readingValue >= profile.severeHyperglycemiaLevel) return 'bg-red-100 border-l-4 border-red-500';
        if (readingValue > profile.hyperglycemiaLevel) return 'bg-amber-100 border-l-4 border-amber-500';
        return 'bg-green-100 border-l-4 border-green-500';
    };

    const formatContext = (reading: SugarReading) => {
        const timeContextMap = {'before_meal': 'قبل', 'after_meal': 'بعد', 'fasting': 'صائم', 'exercise': 'رياضة', 'other': 'أخرى'};
        const mealTypeMap = {'breakfast': 'الفطور', 'lunch': 'الغداء', 'dinner': 'العشاء', 'snack': 'وجبة خفيفة', 'other': 'أخرى'};
        let context = timeContextMap[reading.timeContext] || '';
        if(reading.mealType) context += ` ${mealTypeMap[reading.mealType]}`;
        return context;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <DropletIcon className="w-10 h-10 text-teal-500" />
                <h1 className="text-3xl font-bold text-slate-800">إدارة القياسات والأحداث</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4">تسجيل قياس جديد</h2>
                        <SugarForm addLog={addLog} profile={profile} />
                    </div>
                     <OtherEventsForm addLog={addLog} />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">سجل اليوم</h2>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-md" />
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {dailyReadings.length > 0 ? dailyReadings.map(r => (
                            <div key={r.id} className={`p-3 rounded-lg ${getReadingRowClass(r.value)}`}>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <span className="font-bold text-xl">{profile.glucoseUnit === 'mmol/L' ? (r.value / MG_DL_PER_MMOL_L).toFixed(1) : r.value}</span>
                                        <span className="text-sm text-slate-600 mr-1">{profile.glucoseUnit}</span>
                                        {r.value >= profile.criticalHyperglycemiaLevel && <ArrowUpCircleIcon className="w-5 h-5 inline-block mr-1 text-red-800"/>}
                                        <p className="text-xs text-slate-500">{new Date(r.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})} - {formatContext(r)}</p>
                                    </div>
                                    <div className="text-left text-sm">
                                        {r.correctionDose && <p className="text-red-700 font-semibold">تصحيح: {r.correctionDose} وحدة</p>}
                                        {r.hypoTreatment && <p className="text-blue-700 font-semibold">علاج الهبوط: {r.hypoTreatment}</p>}
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-slate-500 text-center py-8">لا توجد قياسات مسجلة لهذا اليوم.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};