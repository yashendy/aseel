import React, { useState, useEffect, useRef } from 'react';
import { MicIcon, BrainCircuitIcon, XIcon } from './Icons';

interface VoiceAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcessCommand: (command: string) => Promise<string>;
}

// Check for browser support
// FIX: Cast window to `any` to access non-standard SpeechRecognition APIs and prevent TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onProcessCommand }) => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'responding'>('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleStartListening = () => {
        if (!recognition || status === 'listening') return;
        try {
            setError('');
            setTranscript('');
            setResponse('');
            recognition.start();
        } catch (e) {
            console.error("Speech recognition could not start: ", e);
            setError("لم يتمكن الميكروفون من البدء. قد يكون مستخدماً في تطبيق آخر.");
        }
    };

    useEffect(() => {
        if (!isOpen) {
            if (recognition && status === 'listening') {
                recognition.stop();
            }
            return;
        }

        if (!recognition) {
            setError("متصفحك لا يدعم خاصية التعرف على الصوت. جرب استخدام Chrome أو Safari.");
            return;
        }

        recognition.onstart = () => setStatus('listening');
        recognition.onend = () => {
             if (status === 'listening') {
                setStatus('idle');
             }
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setError(`حدث خطأ في التعرف على الصوت: ${event.error}`);
            setStatus('idle');
        };
        recognition.onresult = async (event: any) => {
            const lastResult = event.results[event.results.length - 1];
            const command = lastResult[0].transcript.trim();
            setTranscript(command);
            setStatus('processing');
            const aiResponse = await onProcessCommand(command);
            setResponse(aiResponse);
            setStatus('responding');
        };

        handleStartListening(); // Start listening when modal opens

        return () => {
            if (recognition) {
                recognition.onstart = null;
                recognition.onend = null;
                recognition.onerror = null;
                recognition.onresult = null;
            }
        };
    }, [isOpen, onProcessCommand, status]);

    const renderStatus = () => {
        switch (status) {
            case 'listening':
                return <p className="text-lg text-slate-600">...استمع الآن</p>;
            case 'processing':
                return <p className="text-lg text-slate-600">...جاري تحليل الأمر</p>;
            case 'responding':
                 return (
                    <div className="text-right w-full">
                        <p className="text-sm text-slate-500 mb-1">أنت قلت:</p>
                        <p className="p-2 bg-slate-100 rounded-md text-slate-800 mb-4">"{transcript}"</p>
                        <div className="flex items-start gap-2">
                           <BrainCircuitIcon className="w-6 h-6 text-teal-500 flex-shrink-0 mt-1"/>
                           <p className="text-slate-700 whitespace-pre-wrap">{response}</p>
                        </div>
                    </div>
                );
            case 'idle':
            default:
                return <p className="text-lg text-slate-600">اضغط على الميكروفون للتحدث</p>;
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-modal="true">
            <div className={`bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full m-4 transform transition-transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">المساعد الصوتي</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><XIcon className="w-6 h-6 text-slate-500"/></button>
                </div>
                
                <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                    <button 
                        onClick={handleStartListening} 
                        disabled={status === 'listening' || status === 'processing'}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors mb-6 ${status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-teal-500 hover:bg-teal-600'}`}
                    >
                        <MicIcon className="w-12 h-12 text-white" />
                    </button>
                    {error ? <p className="text-red-500">{error}</p> : renderStatus()}
                </div>
            </div>
        </div>
    );
};
