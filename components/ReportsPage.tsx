import React, { useState, useMemo } from 'react';
import { SugarReading, ChildProfile } from '../types';
import { ClipboardListIcon, BrainCircuitIcon } from './Icons';
import { MG_DL_PER_MMOL_L, calculateAge } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyzeReportData } from '../services/geminiService';

interface ReportsPageProps {
  sugarReadings: SugarReading[];
  profile: ChildProfile;
}

const toDateInputString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type TimeSlotKey = 'wakingUp' | 'beforeBreakfast' | 'afterBreakfast' | 'beforeLunch' | 'afterLunch' | 'beforeDinner' | 'afterDinner' | 'otherSnack';

const TIME_SLOT_COLUMNS: { key: TimeSlotKey; label: string }[] = [
    { key: 'wakingUp', label: 'الاستيقاظ' },
    { key: 'beforeBreakfast', label: 'قبل الفطار' },
    { key: 'afterBreakfast', label: 'بعد الفطار' },
    { key: 'beforeLunch', label: 'قبل الغدا' },
    { key: 'afterLunch', label: 'بعد الغدا' },
    { key: 'beforeDinner', label: 'قبل العشا' },
    { key: 'afterDinner', label: 'بعد العشا' },
    { key: 'otherSnack', label: 'سناك أخرى' },
];

const getSlotKey = (reading: SugarReading, profile: ChildProfile): TimeSlotKey | null => {
    // Fallback for profiles without mealTimes (older data structure or new profiles not yet saved)
    // or if the user provided manual context, let's respect that first for now.
    if (!profile.mealTimes || reading.timeContext !== 'other') {
        if (reading.timeContext === 'fasting') return 'wakingUp';
        if (reading.timeContext === 'before_meal') {
            if (reading.mealType === 'breakfast') return 'beforeBreakfast';
            if (reading.mealType === 'lunch') return 'beforeLunch';
            if (reading.mealType === 'dinner') return 'beforeDinner';
        }
        if (reading.timeContext === 'after_meal') {
            if (reading.mealType === 'breakfast') return 'afterBreakfast';
            if (reading.mealType === 'lunch') return 'afterLunch';
            if (reading.mealType === 'dinner') return 'afterDinner';
        }
        if (reading.mealType === 'snack' || reading.timeContext === 'exercise' || reading.timeContext === 'other') return 'otherSnack';
        return 'otherSnack'; // Default to otherSnack if no specific context
    }

    const readingDate = new Date(reading.date);
    const readingTime = readingDate.getHours() * 60 + readingDate.getMinutes();

    const parseTime = (timeStr: string) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return hour * 60 + minute;
    };

    const breakfastTime = parseTime(profile.mealTimes.breakfast);
    const lunchTime = parseTime(profile.mealTimes.lunch);
    const dinnerTime = parseTime(profile.mealTimes.dinner);

    const beforeWindow = 60; // 1 hour before
    const afterWindow = 180; // 3 hours after
    
    const morningStart = 4 * 60;
    if (readingTime >= morningStart && readingTime < breakfastTime - beforeWindow) {
        return 'wakingUp';
    }

    if (readingTime >= breakfastTime - beforeWindow && readingTime < breakfastTime) return 'beforeBreakfast';
    if (readingTime >= breakfastTime && readingTime < breakfastTime + afterWindow) return 'afterBreakfast';

    if (readingTime >= lunchTime - beforeWindow && readingTime < lunchTime) return 'beforeLunch';
    if (readingTime >= lunchTime && readingTime < lunchTime + afterWindow) return 'afterLunch';
    
    if (readingTime >= dinnerTime - beforeWindow && readingTime < dinnerTime) return 'beforeDinner';
    if (readingTime >= dinnerTime && readingTime < dinnerTime + afterWindow) return 'afterDinner';
    
    return 'otherSnack';
};

type ProcessedDay = {
    date: string;
    slots: Record<TimeSlotKey, { values: number[]; notes: string[] }>;
};

export const ReportsPage: React.FC<ReportsPageProps> = ({ sugarReadings, profile }) => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(toDateInputString(oneWeekAgo));
    const [endDate, setEndDate] = useState(toDateInputString(today));
    const [displayUnit, setDisplayUnit] = useState<'mg/dL' | 'mmol/L'>(profile.glucoseUnit);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);


    const toDisplayUnit = (valueInMgDl: number) => {
        if (displayUnit === 'mmol/L') {
            return (valueInMgDl / MG_DL_PER_MMOL_L);
        }
        return valueInMgDl;
    };
    
    const setDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setStartDate(toDateInputString(start));
        setEndDate(toDateInputString(end));
    }
    
    const { filteredReadings, processedTableData, donutData, timeSlotAverages, averageReadingInMgdl } = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filtered = sugarReadings
            .filter(r => {
                const readingDate = new Date(r.date);
                return readingDate >= start && readingDate <= end;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const totalValue = filtered.reduce((acc, r) => acc + r.value, 0);
        const average = filtered.length > 0 ? totalValue / filtered.length : 0;

        // Process for table
        const readingsByDay: Record<string, ProcessedDay> = {};
        for (const reading of filtered) {
            const dayStr = toDateInputString(new Date(reading.date));
            if (!readingsByDay[dayStr]) {
                readingsByDay[dayStr] = {
                    date: dayStr,
                    slots: Object.fromEntries(TIME_SLOT_COLUMNS.map(c => [c.key, { values: [], notes: [] }])) as Record<TimeSlotKey, { values: number[]; notes: string[] }>
                };
            }
            const slotKey = getSlotKey(reading, profile);
            if (slotKey) {
                readingsByDay[dayStr].slots[slotKey].values.push(reading.value);
                if (reading.correctionDose) {
                    readingsByDay[dayStr].slots[slotKey].notes.push(`تصحيح: ${reading.correctionDose}و`);
                }
                if (reading.hypoTreatment) {
                    readingsByDay[dayStr].slots[slotKey].notes.push(reading.hypoTreatment);
                }
            }
        }
        
        // Process for donut chart
        let counts = { hypo: 0, normal: 0, hyper: 0, severeHyper: 0, criticalHyper: 0 };
        filtered.forEach(r => {
            if (r.value < profile.hypoglycemiaLevel) counts.hypo++;
            else if (r.value >= profile.criticalHyperglycemiaLevel) counts.criticalHyper++;
            else if (r.value >= profile.severeHyperglycemiaLevel) counts.severeHyper++;
            else if (r.value > profile.hyperglycemiaLevel) counts.hyper++;
            else counts.normal++;
        });

        const donut = [
            { name: 'هبوط', value: counts.hypo, color: '#3b82f6' },
            { name: 'طبيعي', value: counts.normal, color: '#10b981' },
            { name: 'ارتفاع', value: counts.hyper, color: '#f97316' },
            { name: 'ارتفاع حاد', value: counts.severeHyper, color: '#ef4444' },
            { name: 'ارتفاع حرج', value: counts.criticalHyper, color: '#dc2626' },
        ].filter(d => d.value > 0);

        // Process for time slot averages
        const timeSlotTotals: Record<TimeSlotKey, { sum: number, count: number }> =
            Object.fromEntries(TIME_SLOT_COLUMNS.map(c => [c.key, { sum: 0, count: 0 }])) as any;

        for (const reading of filtered) {
            const slotKey = getSlotKey(reading, profile);
            if (slotKey) {
                timeSlotTotals[slotKey].sum += reading.value;
                timeSlotTotals[slotKey].count++;
            }
        }

        const slotAverages = TIME_SLOT_COLUMNS.map(col => {
            const totals = timeSlotTotals[col.key];
            const average = totals.count > 0 ? toDisplayUnit(totals.sum / totals.count) : 'N/A';
            return {
                label: col.label,
                average: typeof average === 'number' ? average.toFixed(displayUnit === 'mmol/L' ? 1 : 0) : 'N/A',
            };
        });

        return { 
            filteredReadings: filtered, 
            processedTableData: Object.values(readingsByDay).sort((a,b) => b.date.localeCompare(a.date)),
            donutData: donut,
            timeSlotAverages: slotAverages,
            averageReadingInMgdl: average
        };
    }, [startDate, endDate, sugarReadings, profile, displayUnit]);
    
    const getReadingColorClass = (value: number) => {
        if (value < profile.hypoglycemiaLevel) return 'bg-blue-100 text-blue-800';
        if (value >= profile.criticalHyperglycemiaLevel) return 'bg-red-300 text-red-900 font-extrabold';
        if (value >= profile.severeHyperglycemiaLevel) return 'bg-red-200 text-red-800 font-bold';
        if (value > profile.hyperglycemiaLevel) return 'bg-amber-100 text-amber-800';
        return 'bg-green-100 text-green-800';
    };
    
    const formattedLineChartData = filteredReadings.map(reading => ({
      ...reading,
      value: toDisplayUnit(reading.value),
      name: new Date(reading.date).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit' }),
    }));

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent === 0) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    
    const handleAnalyzeData = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeReportData(filteredReadings, profile);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis failed:", error);
            setAnalysisResult("حدث خطأ أثناء محاولة تحليل البيانات. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const renderAnalysis = (text: string) => {
        const sections = text.split('### ').filter(s => s.trim());
        return sections.map((section, sectionIndex) => {
            const lines = section.split('\n').filter(l => l.trim());
            const title = lines.shift();
            return (
                <div key={sectionIndex}>
                    <h3 className="font-bold text-lg text-slate-800 mt-4 mb-2">{title}</h3>
                    {lines.map((line, lineIndex) => {
                        if (line.startsWith('- **')) {
                            const match = line.match(/- \*\*(.*):\*\* (.*)/);
                             return match ? <p key={lineIndex}><strong className="font-semibold text-slate-700">{match[1]}:</strong> {match[2]}</p> : <p key={lineIndex}>{line}</p>;
                        }
                        if (line.startsWith('- ')) {
                            return <ul key={lineIndex} className="list-disc list-inside"><li >{line.substring(2)}</li></ul>;
                        }
                        return <p key={lineIndex}>{line}</p>;
                    })}
                </div>
            );
        });
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <ClipboardListIcon className="w-10 h-10 text-teal-500" />
                <h1 className="text-3xl font-bold text-slate-800">تقارير قياس السكر</h1>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                 <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                        <div><span className="font-semibold">الاسم:</span> {profile.name}</div>
                        <div><span className="font-semibold">العمر:</span> {calculateAge(profile.dateOfBirth)} سنوات</div>
                        <div><span className="font-semibold">الوزن:</span> {profile.weight} كجم</div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4 border-t pt-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <label htmlFor="start-date">من:</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md"/>
                        <label htmlFor="end-date">إلى:</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setDateRange(7)} className="px-3 py-1 text-sm bg-slate-100 rounded-md hover:bg-teal-100">أسبوع</button>
                        <button onClick={() => setDateRange(14)} className="px-3 py-1 text-sm bg-slate-100 rounded-md hover:bg-teal-100">أسبوعين</button>
                        <button onClick={() => setDateRange(30)} className="px-3 py-1 text-sm bg-slate-100 rounded-md hover:bg-teal-100">شهر</button>
                        <button onClick={() => setDateRange(90)} className="px-3 py-1 text-sm bg-slate-100 rounded-md hover:bg-teal-100">3 أشهر</button>
                    </div>
                </div>
                 <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4 border-t pt-4">
                    <div>
                        <label htmlFor="unit-select" className="mr-2 font-medium">وحدة القياس:</label>
                        <select id="unit-select" value={displayUnit} onChange={e => setDisplayUnit(e.target.value as any)} className="p-2 border rounded-md bg-slate-50">
                            <option value="mg/dL">mg/dL</option>
                            <option value="mmol/L">mmol/L</option>
                        </select>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-sm font-medium text-slate-500">متوسط القياسات في الفترة المحددة</p>
                        {averageReadingInMgdl > 0 ? (
                            <p className="text-2xl font-bold text-teal-600">
                                {averageReadingInMgdl.toFixed(0)} mg/dL
                                <span className="text-slate-400 font-normal mx-2">/</span>
                                {(averageReadingInMgdl / MG_DL_PER_MMOL_L).toFixed(1)} mmol/L
                            </p>
                        ) : (
                            <p className="text-xl font-bold text-slate-500">لا توجد بيانات</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BrainCircuitIcon className="w-6 h-6 text-teal-500" />
                        <span>تحليل بالذكاء الاصطناعي</span>
                    </h2>
                    <button
                        onClick={handleAnalyzeData}
                        disabled={isAnalyzing || filteredReadings.length === 0}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>جاري التحليل...</span>
                            </>
                        ) : 'تحليل بيانات الفترة المحددة'}
                    </button>
                </div>
                {isAnalyzing && (
                    <div className="text-center py-4">
                        <p className="text-slate-500">يقوم المساعد الذكي بتحليل البيانات الآن...</p>
                    </div>
                )}
                {analysisResult && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border max-w-none text-slate-700 space-y-2">
                        {renderAnalysis(analysisResult)}
                    </div>
                )}
                 {!analysisResult && !isAnalyzing && (
                    <p className="text-slate-500 text-center py-4">
                        انقر على زر التحليل للحصول على ملخص للمؤشرات والأنماط الرئيسية في بيانات السكر للفترة المحددة.
                    </p>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">الجدول الزمني للقياسات</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="p-2 border font-semibold">التاريخ</th>
                                {TIME_SLOT_COLUMNS.map(col => <th key={col.key} className="p-2 border font-semibold min-w-[120px]">{col.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {processedTableData.map(day => (
                                <tr key={day.date} className="even:bg-slate-50">
                                    <td className="p-2 border font-semibold">{day.date}</td>
                                    {TIME_SLOT_COLUMNS.map(col => (
                                        <td key={col.key} className="p-1 border align-top text-sm">
                                            {day.slots[col.key].values.map((val, index) => (
                                                <div key={index} className={`p-1 rounded-md mb-1 ${getReadingColorClass(val)}`}>
                                                    <p>{toDisplayUnit(val).toFixed(displayUnit === 'mmol/L' ? 1 : 0)}</p>
                                                    {day.slots[col.key].notes[index] && <p className="text-xs italic">{day.slots[col.key].notes[index]}</p>}
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">مخطط مستوى السكر</h2>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedLineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={displayUnit === 'mmol/L' ? [2, 14] : [40, 250]}/>
                                <Tooltip formatter={(value: number) => [`${value.toFixed(1)} ${displayUnit}`, 'سكر الدم']} />
                                <Legend />
                                <Line type="monotone" dataKey="value" name="مستوى السكر" stroke="#10b981" dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                     <h2 className="text-xl font-bold mb-4">توزيع القياسات</h2>
                     <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={donutData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} قياسات (${((value as number / filteredReadings.length) * 100).toFixed(1)}%)`, name]}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">متوسط القياسات حسب الفترة الزمنية</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b">
                            <tr>
                                <th className="p-2 font-semibold text-slate-600 text-right">الفترة الزمنية</th>
                                <th className="p-2 font-semibold text-slate-600 text-right">متوسط القياس ({displayUnit})</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlotAverages.map(slot => (
                                <tr key={slot.label} className="border-b last:border-b-0 even:bg-slate-50">
                                    <td className="p-3">{slot.label}</td>
                                    <td className="p-3 font-semibold">{slot.average}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};