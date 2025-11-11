
import React from 'react';
import { ChildProfile, SugarReading } from '../types';
import { DropletIcon, XIcon } from './Icons';
import { MG_DL_PER_MMOL_L } from '../constants';

interface SmartwatchViewProps {
    isVisible: boolean;
    onClose: () => void;
    latestReading: SugarReading | null;
    profile: ChildProfile;
    onLogInsulin: (units: number) => void;
}

export const SmartwatchView: React.FC<SmartwatchViewProps> = ({ isVisible, onClose, latestReading, profile, onLogInsulin }) => {
    if (!isVisible) return null;

    const valueInUserUnit = latestReading
        ? profile.glucoseUnit === 'mmol/L'
            ? (latestReading.value / MG_DL_PER_MMOL_L).toFixed(1)
            : (Math.round(latestReading.value / 10) * 10).toString()
        : '--';

    const getTrendArrow = () => {
        // This is a placeholder for real trend data from a CGM
        return '→';
    };

    const getBackgroundColor = () => {
        if (!latestReading) return 'bg-slate-800';
        if (latestReading.value < profile.hypoglycemiaLevel) return 'bg-blue-600';
        if (latestReading.value > profile.hyperglycemiaLevel) return 'bg-amber-600';
        return 'bg-slate-800';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
            <div 
                className={`relative w-80 h-80 rounded-full flex flex-col items-center justify-center p-4 text-white transition-colors duration-500 ${getBackgroundColor()}`}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><XIcon className="w-6 h-6"/></button>
                <div className="text-center">
                    <p className="text-7xl font-bold">{valueInUserUnit}</p>
                    <p className="text-2xl font-light -mt-2">{profile.glucoseUnit}</p>
                    <p className="text-5xl mt-2">{getTrendArrow()}</p>
                </div>
                <div className="absolute bottom-8 flex gap-4">
                    <button onClick={() => onLogInsulin(1)} className="w-12 h-12 bg-white/20 rounded-full text-lg font-bold hover:bg-white/30">+1 U</button>
                    <button onClick={() => onLogInsulin(2)} className="w-12 h-12 bg-white/20 rounded-full text-lg font-bold hover:bg-white/30">+2 U</button>
                </div>
            </div>
        </div>
    );
};
