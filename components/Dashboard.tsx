
import React, { useMemo, useState } from 'react';
import { SugarReading, Appointment, MealLog, ChildProfile, InsulinLog, ExerciseLog, SicknessLog, ProactiveInsight, GlucosePrediction, CarePlan, DashboardWidget } from '../types';
import { SugarChart } from './SugarChart';
import { HeartPulseIcon, CalendarClockIcon, BellIcon, BrainCircuitIcon, AlertTriangleIcon, CheckCircleIcon, LineChartIcon, StethoscopeIcon, CheckSquareIcon, EditIcon, ChevronsUpIcon, ChevronsDownIcon, GripVerticalIcon, WatchIcon } from './Icons';
import { ActivityFeed } from './ActivityFeed';
import { MG_DL_PER_MMOL_L } from '../constants';

interface DashboardProps {
  sugarReadings: SugarReading[];
  appointments: Appointment[];
  mealLogs: MealLog[];
  insulinLogs: InsulinLog[];
  exerciseLogs: ExerciseLog[];
  sicknessLogs: SicknessLog[];
  profile: ChildProfile;
  proactiveInsights: ProactiveInsight[];
  isGeneratingInsights: boolean;
  onGeneratePrediction: () => void;
  prediction: GlucosePrediction | null;
  isPredicting: boolean;
  carePlan?: CarePlan;
  dashboardLayout: DashboardWidget[];
  onUpdateLayout: (newLayout: DashboardWidget[]) => void;
  onShowSmartwatch: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtitle: string; color: string }> = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div className="mr-4">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
    </div>
);

const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return `خلال أقل من ساعة`;
    if (hours < 24) return `خلال ${Math.ceil(hours)} ساعات`;
    if (hours < 48) return `غداً`;
    return `في ${date.toLocaleDateString('ar-EG')}`;
}

const InsightIcon: React.FC<{type: ProactiveInsight['type']}> = ({ type }) => {
    switch (type) {
        case 'warning': return <AlertTriangleIcon className="w-6 h-6 text-amber-500" />;
        case 'success': return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
        case 'info':
        default:
            return <BrainCircuitIcon className="w-6 h-6 text-sky-500" />;
    }
};

const WidgetWrapper: React.FC<{
    widgetId: DashboardWidget,
    isEditing: boolean,
    onMove: (widgetId: DashboardWidget, direction: 'up' | 'down') => void,
    children: React.ReactNode,
    className?: string
}> = ({ isEditing, onMove, widgetId, children, className = '' }) => {
    if (isEditing) {
        return (
            <div className={`relative border-2 border-dashed border-slate-300 rounded-2xl p-1 ${className}`}>
                {children}
                <div className="absolute top-2 left-2 flex flex-col gap-1 bg-white/80 rounded-md shadow-md">
                    <button onClick={() => onMove(widgetId, 'up')} className="p-1 hover:bg-slate-200 rounded-t-md"><ChevronsUpIcon className="w-5 h-5"/></button>
                    <button onClick={() => onMove(widgetId, 'down')} className="p-1 hover:bg-slate-200 rounded-b-md"><ChevronsDownIcon className="w-5 h-5"/></button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-300 cursor-grab"><GripVerticalIcon className="w-6 h-6"/></div>
            </div>
        );
    }
    return <div className={className}>{children}</div>;
};


export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { sugarReadings, appointments, mealLogs, insulinLogs, exerciseLogs, sicknessLogs, profile, proactiveInsights, isGeneratingInsights, onGeneratePrediction, prediction, isPredicting, carePlan, dashboardLayout, onUpdateLayout, onShowSmartwatch } = props;
  const { glucoseUnit } = profile;
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const handleMoveWidget = (widgetId: DashboardWidget, direction: 'up' | 'down') => {
    const currentIndex = dashboardLayout.indexOf(widgetId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= dashboardLayout.length) return;

    const newLayout = [...dashboardLayout];
    const [movedItem] = newLayout.splice(currentIndex, 1);
    newLayout.splice(newIndex, 0, movedItem);
    onUpdateLayout(newLayout);
  };


  const toUserUnit = (valueInMgDl: number) => {
      if (glucoseUnit === 'mmol/L') {
          return (valueInMgDl / MG_DL_PER_MMOL_L).toFixed(1);
      }
      return valueInMgDl.toFixed(0);
  };

  const latestReading = sugarReadings.length > 0 ? sugarReadings[0] : null;
  
  // Only use last 24h for average
  const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  const recentReadings = sugarReadings.filter(r => new Date(r.date).getTime() > oneDayAgo);
  const averageReading = recentReadings.length > 0
    ? (recentReadings.reduce((acc, r) => acc + r.value, 0) / recentReadings.length)
    : null;
  
  const activeReminders = useMemo(() => {
    const now = new Date().getTime();
    const reminders: Appointment[] = [];

    const timeWindows = {
        '1_hour': 60 * 60 * 1000,
        '1_day': 24 * 60 * 60 * 1000,
        '2_days': 2 * 24 * 60 * 60 * 1000,
    };

    appointments.forEach(appt => {
        if (!appt.reminder || appt.reminder === 'none') return;
        
        const apptTime = new Date(appt.date).getTime();
        const timeDiff = apptTime - now;

        if (timeDiff > 0 && timeDiff <= timeWindows[appt.reminder]) {
            reminders.push(appt);
        }
    });

    return reminders.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);
  
  const upcomingAppointment = appointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;

  const widgets: Record<DashboardWidget, React.ReactNode> = {
    stats: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
            icon={<HeartPulseIcon className="w-6 h-6 text-white"/>}
            title="آخر قياس"
            value={latestReading ? `${toUserUnit(latestReading.value)} ${glucoseUnit}` : 'لا يوجد'}
            subtitle={latestReading ? new Date(latestReading.date).toLocaleString('ar-EG') : ''}
            color="bg-red-400"
            />
            <StatCard 
            icon={<HeartPulseIcon className="w-6 h-6 text-white"/>}
            title="متوسط (آخر 24 ساعة)"
            value={averageReading ? `${toUserUnit(averageReading)} ${glucoseUnit}` : 'N/A'}
            subtitle={`${recentReadings.length} قياسات`}
            color="bg-blue-400"
            />
            <StatCard 
            icon={<CalendarClockIcon className="w-6 h-6 text-white"/>}
            title="موعد قادم"
            value={upcomingAppointment ? upcomingAppointment.specialty : 'لا يوجد'}
            subtitle={upcomingAppointment ? `مع ${upcomingAppointment.doctorName} في ${new Date(upcomingAppointment.date).toLocaleDateString('ar-EG')}` : ''}
            color="bg-green-400"
            />
        </div>
    ),
    insights: (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><BrainCircuitIcon className="w-6 h-6 text-teal-500" /><span>رؤى المساعد الذكي</span></h2>
            {isGeneratingInsights ? <div className="flex items-center gap-3 text-slate-500"><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>يقوم المساعد بتحليل البيانات...</span></div>
            : proactiveInsights.length > 0 ? <div className="space-y-3">{proactiveInsights.map(insight => <div key={insight.id} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3"><div className="flex-shrink-0 mt-1"><InsightIcon type={insight.type} /></div><p className="text-slate-700">{insight.message}</p></div>)}</div>
            : <p className="text-slate-500">لا توجد ملاحظات جديدة. يبدو أن كل شيء مستقر!</p>}
        </div>
    ),
    forecast: (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><LineChartIcon className="w-6 h-6 text-sky-500" /><span>توقع مسار السكر</span></h2>
            {isPredicting ? <div className="flex items-center gap-3 text-slate-500"><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>يقوم المساعد بالتنبؤ بالمسار...</span></div>
            : prediction ? <div className="p-3 bg-sky-50 rounded-lg flex items-start gap-3"><div className="flex-shrink-0 mt-1"><BrainCircuitIcon className="w-6 h-6 text-sky-500" /></div><p className="text-slate-700">{prediction.message}</p></div>
            : <p className="text-slate-500">احصل على توقع لاتجاه سكر الدم خلال الساعة القادمة بناءً على البيانات الأخيرة.</p>}
            <button onClick={onGeneratePrediction} disabled={isPredicting} className="mt-4 bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition disabled:bg-slate-400">{isPredicting ? 'جاري التوقع...' : 'توقع الآن'}</button>
        </div>
    ),
    reminders: activeReminders.length > 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-400">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600"><BellIcon className="w-6 h-6" /><span>تذكيرات هامة</span></h2>
          <ul className="space-y-3">{activeReminders.map(appt => <li key={appt.id} className="p-3 bg-amber-50 rounded-lg flex items-start gap-3"><div className="flex-shrink-0 text-amber-500 mt-1"><CalendarClockIcon className="w-5 h-5"/></div><div><p className="font-bold">{appt.specialty} مع {appt.doctorName}</p><p className="text-sm text-slate-600">{appt.notes}</p><p className="text-sm font-semibold text-amber-700 mt-1">{formatRelativeTime(appt.date)}</p></div></li>)}</ul>
        </div>
    ) : null,
    chart: (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm"><h2 className="text-xl font-bold mb-4">مخطط مستويات السكر (آخر 24 ساعة)</h2><div className="h-96"><SugarChart data={sugarReadings} glucoseUnit={glucoseUnit} timeWindowHours={24} predictedData={prediction?.predictedValues} /></div></div>
    ),
    activity: (
        <ActivityFeed sugarReadings={sugarReadings} mealLogs={mealLogs} insulinLogs={insulinLogs} exerciseLogs={exerciseLogs} sicknessLogs={sicknessLogs} profile={profile} />
    ),
    care_plan: carePlan ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-400">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600"><StethoscopeIcon className="w-6 h-6" /><span>خطة الرعاية من الطبيب</span></h2>
            <div className="space-y-4">
                <div><h3 className="font-semibold text-slate-700 mb-2">الأهداف الحالية:</h3><ul className="space-y-2">{carePlan.goals.map(goal => <li key={goal.id} className={`flex items-center gap-2 text-sm ${goal.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}><CheckSquareIcon className={`w-5 h-5 flex-shrink-0 ${goal.isCompleted ? 'text-green-500' : 'text-indigo-500'}`}/><span>{goal.text}</span></li>)}</ul></div>
                <div><h3 className="font-semibold text-slate-700 mb-2">توصيات الطبيب:</h3><ul className="space-y-2 list-disc list-inside text-sm text-slate-700">{carePlan.recommendations.map(rec => <li key={rec.id}>{rec.text}</li>)}</ul></div>
            </div>
        </div>
    ) : null
  };
  
  const orderedWidgets = dashboardLayout.map(widgetId => ({ id: widgetId, component: widgets[widgetId] })).filter(w => w.component);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم</h1>
        <div className="flex items-center gap-2">
            <button onClick={onShowSmartwatch} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                <WatchIcon className="w-5 h-5"/>
                <span>واجهة الساعة</span>
            </button>
            <button onClick={() => setIsEditingLayout(!isEditingLayout)} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                <EditIcon className="w-5 h-5"/>
                <span>{isEditingLayout ? 'حفظ الترتيب' : 'تعديل الترتيب'}</span>
            </button>
        </div>
      </div>
      
      {orderedWidgets.map(({id, component}) => (
          <WidgetWrapper key={id} widgetId={id} isEditing={isEditingLayout} onMove={handleMoveWidget}>
              {component}
          </WidgetWrapper>
      ))}

    </div>
  );
};
