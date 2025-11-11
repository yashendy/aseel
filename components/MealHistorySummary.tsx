import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MealLog } from '../types';
import { UtensilsCrossedIcon } from './Icons';
import { MEAL_TYPE_NAMES } from '../constants';

interface MealHistorySummaryProps {
  mealLogs: MealLog[];
}

const COLORS: Record<MealLog['mealType'], string> = {
    breakfast: '#10B981', // Teal
    lunch: '#3B82F6',   // Blue
    dinner: '#F97316',  // Orange
    snack: '#8B5CF6',   // Violet
};

export const MealHistorySummary: React.FC<MealHistorySummaryProps> = ({ mealLogs }) => {
  // FIX: Added type for the accumulator to prevent type errors.
  const carbsByDay = mealLogs.reduce((acc: Record<string, number>, log) => {
    const day = new Date(log.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
    acc[day] = (acc[day] || 0) + log.carbs;
    return acc;
  }, {});

  const totalDays = Object.keys(carbsByDay).length;
  const totalCarbs = Object.values(carbsByDay).reduce((sum, carbs) => sum + carbs, 0);
  const averageDailyCarbs = totalDays > 0 ? (totalCarbs / totalDays).toFixed(0) : '0';

  // FIX: Added type for the accumulator to prevent type errors.
  const mealTypeStats = mealLogs.reduce((acc: Record<string, { count: number, totalCarbs: number }>, log) => {
    if (!acc[log.mealType]) {
        acc[log.mealType] = { count: 0, totalCarbs: 0 };
    }
    acc[log.mealType].count += 1;
    acc[log.mealType].totalCarbs += log.carbs;
    return acc;
  }, {});

  const mealTypeData = (Object.keys(MEAL_TYPE_NAMES) as Array<MealLog['mealType']>).map(key => ({
    name: MEAL_TYPE_NAMES[key],
    value: mealTypeStats[key]?.count || 0,
    totalCarbs: mealTypeStats[key]?.totalCarbs || 0,
    color: COLORS[key]
  })).filter(item => item.value > 0);


  if (mealLogs.length === 0) {
    return (
         <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossedIcon className="w-6 h-6 text-teal-500" />
                <span>ملخص الوجبات</span>
            </h2>
            <p className="text-slate-500 text-center py-8">لا توجد بيانات وجبات مسجلة لعرض الملخص.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UtensilsCrossedIcon className="w-6 h-6 text-teal-500" />
            <span>ملخص الوجبات</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="space-y-4 text-center sm:text-right">
                <div className="mb-6">
                    <p className="text-sm text-slate-500">متوسط الكربوهيدرات اليومي</p>
                    <p className="text-3xl font-bold text-teal-600">{averageDailyCarbs} <span className="text-lg font-medium text-slate-400">جرام</span></p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">توزيع الوجبات</p>
                    <ul className="space-y-1">
                      {mealTypeData.map(entry => (
                        <li key={entry.name} className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                          <span>{entry.name}:</span>
                          <span className="font-bold">{entry.value} وجبات</span>
                          <span className="text-slate-500">({entry.totalCarbs.toFixed(0)} جم كارب)</span>
                        </li>
                      ))}
                    </ul>
                </div>
            </div>
            <div className="h-40 w-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={mealTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {mealTypeData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} وجبات`, name]} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};
