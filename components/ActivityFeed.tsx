
import React, { useMemo } from 'react';
import { SugarReading, MealLog, InsulinLog, ExerciseLog, SicknessLog, ChildProfile, LogType } from '../types';
import { DropletIcon, UtensilsCrossedIcon, SyringeIcon, RunningIcon, ThermometerIcon } from './Icons';
import { MG_DL_PER_MMOL_L } from '../constants';

type ActivityItem = {
    id: string;
    date: string;
    type: 'sugar' | 'meal' | 'insulin' | 'exercise' | 'sickness';
    data: SugarReading | MealLog | InsulinLog | ExerciseLog | SicknessLog;
};

interface ActivityFeedProps {
    sugarReadings: SugarReading[];
    mealLogs: MealLog[];
    insulinLogs: InsulinLog[];
    exerciseLogs: ExerciseLog[];
    sicknessLogs: SicknessLog[];
    profile: ChildProfile;
}

const ActivityIcon: React.FC<{ type: ActivityItem['type'] }> = ({ type }) => {
    const baseClasses = "w-6 h-6 text-white";
    switch (type) {
        case 'sugar': return <div className="bg-red-400 p-2 rounded-full"><DropletIcon className={baseClasses} /></div>;
        case 'meal': return <div className="bg-orange-400 p-2 rounded-full"><UtensilsCrossedIcon className={baseClasses} /></div>;
        case 'insulin': return <div className="bg-sky-400 p-2 rounded-full"><SyringeIcon className={baseClasses} /></div>;
        case 'exercise': return <div className="bg-green-400 p-2 rounded-full"><RunningIcon className={baseClasses} /></div>;
        case 'sickness': return <div className="bg-purple-400 p-2 rounded-full"><ThermometerIcon className={baseClasses} /></div>;
        default: return null;
    }
};

const ActivityDetails: React.FC<{ item: ActivityItem, profile: ChildProfile }> = ({ item, profile }) => {
    const toUserUnitDisplay = (val: number) => {
        return profile.glucoseUnit === 'mmol/L' ? (val / MG_DL_PER_MMOL_L).toFixed(1) : val.toFixed(0);
    };

    switch (item.type) {
        case 'sugar':
            const reading = item.data as SugarReading;
            return (
                <div>
                    <p className="font-bold text-slate-800">
                        قياس سكر: {toUserUnitDisplay(reading.value)} {profile.glucoseUnit}
                    </p>
                    {reading.hypoTreatment && <p className="text-xs text-blue-600">علاج الهبوط: {reading.hypoTreatment}</p>}
                    {reading.correctionDose && <p className="text-xs text-red-600">جرعة تصحيح: {reading.correctionDose} وحدة</p>}
                </div>
            );
        case 'meal':
            const meal = item.data as MealLog;
            return (
                <div>
                    <p className="font-bold text-slate-800">
                        وجبة: {meal.carbs.toFixed(0)} جم كارب
                    </p>
                    <p className="text-xs text-slate-500" title={meal.description}>{meal.description}</p>
                </div>
            );
        case 'insulin':
            const insulin = item.data as InsulinLog;
            return (
                <p className="font-bold text-slate-800">
                    جرعة أنسولين: {insulin.units} وحدة ({insulin.type === 'basal' ? 'قاعدي' : 'سريع'})
                </p>
            );
        case 'exercise':
            const exercise = item.data as ExerciseLog;
            return (
                <div>
                    <p className="font-bold text-slate-800">
                        نشاط رياضي: {exercise.activity}
                    </p>
                    <p className="text-xs text-slate-500">{exercise.durationMinutes} دقيقة - شدة {exercise.intensity === 'low' ? 'منخفضة' : exercise.intensity === 'medium' ? 'متوسطة' : 'عالية'}</p>
                </div>
            );
        case 'sickness':
            const sickness = item.data as SicknessLog;
            return (
                <div>
                    <p className="font-bold text-slate-800">يوم مرضي</p>
                    <p className="text-xs text-slate-500">{sickness.notes}</p>
                </div>
            );
        default:
            return null;
    }
};


export const ActivityFeed: React.FC<ActivityFeedProps> = (props) => {
    const combinedFeed = useMemo(() => {
        const feed: ActivityItem[] = [
            ...props.sugarReadings.map(r => ({ id: `s-${r.id}`, date: r.date, type: 'sugar' as const, data: r })),
            ...props.mealLogs.map(m => ({ id: `m-${m.id}`, date: m.date, type: 'meal' as const, data: m })),
            ...props.insulinLogs.map(i => ({ id: `i-${i.id}`, date: i.date, type: 'insulin' as const, data: i })),
            ...props.exerciseLogs.map(e => ({ id: `e-${e.id}`, date: e.date, type: 'exercise' as const, data: e })),
            ...props.sicknessLogs.map(s => ({ id: `sick-${s.id}`, date: s.date, type: 'sickness' as const, data: s })),
        ];
        
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        return feed
            .filter(item => new Date(item.date).getTime() >= startOfDay)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [props.sugarReadings, props.mealLogs, props.insulinLogs, props.exerciseLogs, props.sicknessLogs]);
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">سجل اليوم</h2>
            <div className="space-y-4 max-h-[384px] overflow-y-auto pr-2">
                {combinedFeed.length > 0 ? (
                    combinedFeed.map((item, index) => (
                        <div key={item.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <ActivityIcon type={item.type} />
                                {index < combinedFeed.length - 1 && (
                                    <div className="w-px h-full bg-slate-200 mt-1"></div>
                                )}
                            </div>
                            <div className="pb-4">
                                <p className="text-xs text-slate-500 font-semibold mb-1">
                                    {new Date(item.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <ActivityDetails item={item} profile={props.profile} />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-8">لا توجد أنشطة مسجلة اليوم.</p>
                )}
            </div>
        </div>
    );
};