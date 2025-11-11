import React, { useState } from 'react';
import { Appointment, LogType } from '../types';

interface DataManagementProps {
    appointments: Appointment[];
    addLog: (type: LogType, data: any) => void;
}

const AppointmentForm: React.FC<{ addLog: (type: LogType, data: any) => void }> = ({ addLog }) => {
    const [apptDoctor, setApptDoctor] = useState('');
    const [apptSpecialty, setApptSpecialty] = useState('');
    const [apptDate, setApptDate] = useState('');
    const [apptNotes, setApptNotes] = useState('');
    const [apptReminder, setApptReminder] = useState<'none' | '1_hour' | '1_day' | '2_days'>('1_day');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apptDoctor && apptSpecialty && apptDate && apptNotes) {
            // FIX: Corrected typo from APPOINTPOINTMENT to APPOINTMENT
            addLog(LogType.APPOINTMENT, { 
                doctorName: apptDoctor, 
                specialty: apptSpecialty, 
                date: new Date(apptDate).toISOString(), 
                notes: apptNotes,
                reminder: apptReminder
            });
            setApptDoctor('');
            setApptSpecialty('');
            setApptDate('');
            setApptNotes('');
            setApptReminder('1_day');
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">إضافة موعد جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="اسم الطبيب" value={apptDoctor} onChange={e => setApptDoctor(e.target.value)} className="w-full p-2 border rounded-md" required />
                <input type="text" placeholder="التخصص" value={apptSpecialty} onChange={e => setApptSpecialty(e.target.value)} className="w-full p-2 border rounded-md" required />
                <input type="datetime-local" value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full p-2 border rounded-md" required />
                <select value={apptReminder} onChange={e => setApptReminder(e.target.value as any)} className="w-full p-2 border rounded-md">
                    <option value="none">بدون تذكير</option>
                    <option value="1_hour">تذكير قبل ساعة</option>
                    <option value="1_day">تذكير قبل يوم</option>
                    <option value="2_days">تذكير قبل يومين</option>
                </select>
                <textarea placeholder="ملاحظات" value={apptNotes} onChange={e => setApptNotes(e.target.value)} className="w-full p-2 border rounded-md" rows={3} required />
                <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition">إضافة موعد</button>
            </form>
        </div>
    );
};


const AppointmentsList: React.FC<{ items: Appointment[] }> = ({ items }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">سجل المواعيد الطبية</h2>
        <ul className="space-y-3 max-h-96 overflow-y-auto">
            {items.length > 0 ? items.map(item => (
                 <li key={item.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <p className="font-bold text-teal-700">{item.specialty}</p>
                            <p className="font-semibold">{item.doctorName}</p>
                        </div>
                        <span className="text-xs text-slate-500 text-left whitespace-nowrap">
                            {new Date(item.date).toLocaleString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{item.notes}</p>
                </li>
            )) : <p className="text-slate-500">لا توجد مواعيد لعرضها.</p>}
        </ul>
    </div>
);

export const DataManagement: React.FC<DataManagementProps> = ({ appointments, addLog }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">إدارة المواعيد</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <AppointmentForm addLog={addLog} />
                </div>
                <div className="lg:col-span-2">
                    <AppointmentsList items={appointments} />
                </div>
            </div>
        </div>
    );
};