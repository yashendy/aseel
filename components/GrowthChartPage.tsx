import React, { useMemo } from 'react';
import { ChildProfile } from '../types';
import { TrendingUpIcon } from './Icons';
import { calculateAge } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GrowthChartPageProps {
  profile: ChildProfile;
}

const StatCard: React.FC<{ title: string; value: string; subtitle: string; }> = ({ title, value, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
);

export const GrowthChartPage: React.FC<GrowthChartPageProps> = ({ profile }) => {
    
    const formattedData = useMemo(() => {
        return (profile.growthLog || [])
            .map(record => ({
                ...record,
                name: new Date(record.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }),
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [profile.growthLog]);

    const sortedTableData = useMemo(() => {
        return [...(profile.growthLog || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [profile.growthLog]);

    const bmi = useMemo(() => {
        if (profile.height > 0 && profile.weight > 0) {
            const heightInMeters = profile.height / 100;
            return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
        }
        return 'N/A';
    }, [profile.height, profile.weight]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <TrendingUpIcon className="w-10 h-10 text-teal-500" />
                <h1 className="text-3xl font-bold text-slate-800">سجل النمو لطفلك {profile.name}</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard title="العمر الحالي" value={`${calculateAge(profile.dateOfBirth)}`} subtitle="سنوات" />
                <StatCard title="الوزن الحالي" value={`${profile.weight}`} subtitle="كجم" />
                <StatCard title="الطول الحالي" value={`${profile.height}`} subtitle="سم" />
                <StatCard title="مؤشر كتلة الجسم" value={bmi} subtitle="BMI" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">مخطط تطور الوزن (كجم)</h2>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => [`${value.toFixed(1)} كجم`, 'الوزن']} />
                                <Legend />
                                <Line type="monotone" dataKey="weight" name="الوزن" stroke="#3b82f6" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">مخطط تطور الطول (سم)</h2>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} سم`, 'الطول']} />
                                <Legend />
                                <Line type="monotone" dataKey="height" name="الطول" stroke="#10b981" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">السجل التفصيلي للنمو</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b text-slate-500">
                            <tr>
                                <th className="p-3 font-semibold">تاريخ التسجيل</th>
                                <th className="p-3 font-semibold">الوزن (كجم)</th>
                                <th className="p-3 font-semibold">الطول (سم)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTableData.map((record, index) => (
                                <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="p-3">{new Date(record.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td className="p-3">{record.weight.toFixed(1)}</td>
                                    <td className="p-3">{record.height.toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
