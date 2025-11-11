import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { CalendarClockIcon, XIcon } from './Icons';

interface GlobalNotificationsProps {
  appointments: Appointment[];
  dismissedIds: Set<number>;
  onDismiss: (id: number) => void;
}

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

export const GlobalNotifications: React.FC<GlobalNotificationsProps> = ({ appointments, dismissedIds, onDismiss }) => {
    const [activeReminders, setActiveReminders] = useState<Appointment[]>([]);
    
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date().getTime();
            const timeWindows = {
                '1_hour': 60 * 60 * 1000,
                '1_day': 24 * 60 * 60 * 1000,
                '2_days': 2 * 24 * 60 * 60 * 1000,
            };

            const newActiveReminders = appointments.filter(appt => {
                if (!appt.reminder || appt.reminder === 'none' || dismissedIds.has(appt.id)) {
                    return false;
                }
                
                const apptTime = new Date(appt.date).getTime();
                const timeDiff = apptTime - now;

                return timeDiff > 0 && timeDiff <= timeWindows[appt.reminder];
            });

            // Prevent re-rendering if the list is identical
            setActiveReminders(currentReminders => {
                const currentIds = new Set(currentReminders.map(r => r.id));
                const newIds = new Set(newActiveReminders.map(r => r.id));
                if (currentIds.size === newIds.size && [...currentIds].every(id => newIds.has(id))) {
                    return currentReminders;
                }
                return newActiveReminders;
            });
        };
        
        checkReminders(); // Initial check
        const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute
        
        return () => clearInterval(intervalId); // Cleanup on unmount
        
    }, [appointments, dismissedIds]);

    if (activeReminders.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 w-80">
            {activeReminders.map(appt => (
                <div 
                    key={appt.id} 
                    className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 animate-slide-in"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-amber-500 mt-1"><CalendarClockIcon className="w-6 h-6"/></div>
                        <div className="flex-grow">
                            <p className="font-bold text-slate-800">تذكير بموعد قادم</p>
                            <p className="text-sm text-slate-600">{appt.specialty} مع {appt.doctorName}</p>
                            <p className="text-sm font-semibold text-amber-700 mt-1">{formatRelativeTime(appt.date)}</p>
                        </div>
                        <button 
                            onClick={() => onDismiss(appt.id)}
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label="إغلاق التذكير"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
