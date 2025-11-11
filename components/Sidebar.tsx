

import React from 'react';
import { UsersIcon } from './Icons';

// FIX: Added 'growth' and 'doctor-chat' to the View type to match the definition in App.tsx and resolve type incompatibility.
type View = 'dashboard' | 'logs' | 'ai' | 'meals' | 'profile' | 'measurement' | 'reports' | 'awareness' | 'rewards' | 'growth' | 'doctor-chat' | 'cgm' | 'community';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: View;
}

interface SidebarProps {
  navItems: NavItem[];
  currentView: string;
  setCurrentView: (view: View) => void;
  childName: string;
  onGoToParentDashboard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, currentView, setCurrentView, childName, onGoToParentDashboard }) => {
  return (
    <aside className="w-20 lg:w-64 bg-white shadow-md flex flex-col transition-all duration-300">
      <div className="p-4 border-b h-20 flex flex-col justify-center">
         <div className="flex items-center justify-center lg:justify-start">
            {/* Removed Global Header elements from here as they are now in GlobalHeader.tsx */}
            <div className="hidden lg:block text-center w-full">
                <p className="text-xs text-slate-500">ملف: {childName}</p>
            </div>
            {/* For small screens, maybe show child initial or simplified indicator if needed */}
         </div>
      </div>
      <nav className="flex-1 px-2 lg:px-4 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center w-full p-3 my-2 rounded-lg transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                }`}
              >
                {item.icon}
                <span className="hidden lg:block mr-4">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-2 lg:px-4 py-4 border-t">
         <button
            onClick={onGoToParentDashboard}
            className="flex items-center w-full p-3 my-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-sky-50 hover:text-sky-600"
          >
            <UsersIcon className="w-6 h-6" />
            <span className="hidden lg:block mr-4">كل الأبناء</span>
          </button>
      </div>
    </aside>
  );
};