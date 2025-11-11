
import React from 'react';
import { MicIcon, XIcon } from './Icons';

interface ParentDashboardVoiceWidgetProps {
  onOpenModal: () => void;
}

export const ParentDashboardVoiceWidget: React.FC<ParentDashboardVoiceWidgetProps> = ({ onOpenModal }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm max-w-sm mx-auto text-center md:mr-0 md:ml-auto"> {/* Aligned right */}
        <h3 className="text-xl font-bold mb-4">المساعد الصوتي</h3>
        <div className="flex items-center justify-center gap-4">
            <button
                onClick={onOpenModal}
                className="bg-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600 transition-transform hover:scale-110"
                aria-label="افتح المساعد الصوتي"
            >
                <MicIcon className="w-8 h-8"/>
            </button>
            <button
                // This X icon is visual as per image, actual modal close is handled by the modal itself
                onClick={() => { /* No-op, visual only to match image */ }}
                className="bg-slate-200 text-slate-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-300 transition-transform hover:scale-110"
                aria-label="إغلاق"
            >
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <p className="text-sm text-slate-500 mt-4">اضغط على الميكروفون للتحدث</p>
    </div>
  );
};
