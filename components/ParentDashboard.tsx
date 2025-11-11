
import React from 'react';
import { ChildProfile, ParentProfile } from '../types';
import { ChildIcon, PlusCircleIcon, GiftIcon, StethoscopeIcon, ShieldIcon, UsersIcon } from './Icons';
import { calculateAge } from '../constants';

interface ParentDashboardProps {
  parentProfile: ParentProfile;
  childProfiles: ChildProfile[];
  onSelectChild: (id: number) => void;
  onAddChild: () => void;
  onManageRewards: () => void;
  onSwitchToDoctorView: () => void;
  onSwitchToAdminView: () => void;
  onSwitchToCaregiverView: () => void;
  appMode: 'parent' | 'caregiver';
}

const ChildCard: React.FC<{ child: ChildProfile; onSelect: () => void }> = ({ child, onSelect }) => (
  <button
    onClick={onSelect}
    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full text-right group"
  >
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
        <ChildIcon className="w-8 h-8 text-teal-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{child.name}</h3>
        <p className="text-slate-500">{calculateAge(child.dateOfBirth)} سنوات</p>
      </div>
    </div>
  </button>
);

const AddChildCard: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <button
        onClick={onAdd}
        className="border-2 border-dashed border-slate-300 p-6 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 w-full text-center group min-h-[148px]"
    >
        <div className="flex flex-col items-center justify-center h-full gap-2">
            <PlusCircleIcon className="w-10 h-10 text-slate-400 group-hover:text-teal-500 transition-colors" />
            <p className="font-semibold text-slate-600 group-hover:text-teal-600 transition-colors">إضافة طفل جديد</p>
        </div>
    </button>
);


export const ParentDashboard: React.FC<ParentDashboardProps> = ({ parentProfile, childProfiles, onSelectChild, onAddChild, onManageRewards, onSwitchToDoctorView, onSwitchToAdminView, onSwitchToCaregiverView, appMode }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <h1 className="font-bold text-2xl text-teal-600">سكري طفلي</h1>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right">
                        <p className="text-sm font-semibold">مرحباً, {parentProfile.name}</p>
                        <p className="text-xs text-slate-500">{appMode === 'parent' ? 'لوحة التحكم الرئيسية' : 'واجهة مقدم الرعاية'}</p>
                    </div>
                    <img src={parentProfile.avatarUrl} alt="User" className="rounded-full w-10 h-10" />
                </div>
            </div>
        </header>
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
             <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h2 className="text-3xl font-bold">{appMode === 'parent' ? 'اختر ملف الطفل للمتابعة' : 'الأطفال تحت رعايتك'}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                    {appMode === 'parent' && (
                        <>
                        <button
                            onClick={onManageRewards}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
                        >
                            <GiftIcon className="w-5 h-5" />
                            <span>إدارة المكافآت</span>
                        </button>
                        <button
                            onClick={onSwitchToCaregiverView}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-semibold"
                        >
                            <UsersIcon className="w-5 h-5" />
                            <span>واجهة مقدم الرعاية</span>
                        </button>
                         <button
                            onClick={onSwitchToDoctorView}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition font-semibold"
                        >
                            <StethoscopeIcon className="w-5 h-5" />
                            <span>واجهة الطبيب</span>
                        </button>
                        <button
                            onClick={onSwitchToAdminView}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-semibold"
                        >
                            <ShieldIcon className="w-5 h-5" />
                            <span>لوحة التحكم</span>
                        </button>
                        </>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {childProfiles.map(child => (
                    <ChildCard key={child.id} child={child} onSelect={() => onSelectChild(child.id)} />
                ))}
                {appMode === 'parent' && <AddChildCard onAdd={onAddChild} />}
            </div>
        </main>
    </div>
  );
};
