
import React from 'react';
import { ParentProfile } from '../types';
import { ShieldIcon, StethoscopeIcon, UsersIcon, GiftIcon } from './Icons'; // Assuming these are needed for consistent icon usage across headers

interface GlobalHeaderProps {
  parentProfile: ParentProfile;
  appMode: 'parent' | 'doctor' | 'admin' | 'caregiver';
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ parentProfile, appMode }) => {
  const getModeLabel = () => {
    switch (appMode) {
      case 'parent': return 'لوحة التحكم الرئيسية';
      case 'doctor': return 'واجهة الطبيب';
      case 'admin': return 'لوحة تحكم المسؤول';
      case 'caregiver': return 'واجهة مقدم الرعاية';
      default: return '';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Custom 'S' logo to match the original image */}
          <div className="flex items-center justify-center flex-shrink-0">
            <span className="font-black text-4xl text-red-500">S</span>
          </div>
          <h1 className="font-bold text-2xl text-slate-800">سكري طفلي</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">مرحباً, {parentProfile.name}</p>
            <p className="text-xs text-slate-500">{getModeLabel()}</p>
          </div>
          <img src={parentProfile.avatarUrl} alt="User" className="rounded-full w-10 h-10" />
        </div>
      </div>
    </header>
  );
};
