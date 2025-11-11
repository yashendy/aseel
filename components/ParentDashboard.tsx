
import React from 'react';
import { ChildProfile, ParentProfile } from '../types';
import { PlusCircleIcon, GiftIcon, StethoscopeIcon, ShieldIcon, UsersIcon } from './Icons';
import { calculateAge } from '../constants';
import { ParentDashboardVoiceWidget } from './ParentDashboardVoiceWidget'; // Import the new widget

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
  setIsVoiceModalOpen: (isOpen: boolean) => void;
}

const ChildCard: React.FC<{ child: ChildProfile; onSelect: () => void }> = ({ child, onSelect }) => (
  <button
    onClick={onSelect}
    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full text-right group"
  >
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span role="img" aria-label="child avatar" className="text-4xl">😀</span> {/* Emoji instead of icon */}
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


export const ParentDashboard: React.FC<ParentDashboardProps> = ({ parentProfile, childProfiles, onSelectChild, onAddChild, onManageRewards, onSwitchToDoctorView, onSwitchToAdminView, onSwitchToCaregiverView, appMode, setIsVoiceModalOpen }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* Removed the header from here, it's now in GlobalHeader.tsx */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">{appMode === 'parent' ? 'اختر ملف الطفل للمتابعة' : 'الأطفال تحت رعايتك'}</h2>
            
            {appMode === 'parent' && (
                <div className="flex items-center gap-2 flex-wrap mb-8"> {/* Mode buttons moved here and styled */}
                    <button
                        onClick={onManageRewards}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <GiftIcon className="w-5 h-5 text-amber-500" />
                        <span>إدارة المكافآت</span>
                    </button>
                    <button
                        onClick={onSwitchToCaregiverView}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <UsersIcon className="w-5 h-5 text-indigo-500" />
                        <span>واجهة مقدم الرعاية</span>
                    </button>
                    <button
                        onClick={onSwitchToDoctorView}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <StethoscopeIcon className="w-5 h-5 text-sky-500" />
                        <span>واجهة الطبيب</span>
                    </button>
                    <button
                        onClick={onSwitchToAdminView}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <ShieldIcon className="w-5 h-5 text-slate-600" />
                        <span>لوحة التحكم</span>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                {childProfiles.map(child => (
                    <ChildCard key={child.id} child={child} onSelect={() => onSelectChild(child.id)} />
                ))}
                {appMode === 'parent' && <AddChildCard onAdd={onAddChild} />}
            </div>

            {appMode === 'parent' && (
                <ParentDashboardVoiceWidget onOpenModal={() => setIsVoiceModalOpen(true)} />
            )}
        </main>
    </div>
  );
};
