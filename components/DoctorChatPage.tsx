
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, ParentProfile, DoctorProfile } from '../types';
import { MessageSquareIcon } from './Icons';

interface DoctorChatPageProps {
  conversation: Conversation | undefined;
  messages: Message[];
  currentUser: ParentProfile;
  otherUser: DoctorProfile | undefined;
  onSendMessage: (text: string) => void;
}

export const DoctorChatPage: React.FC<DoctorChatPageProps> = ({ conversation, messages, currentUser, otherUser, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    if (!conversation || !otherUser) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center text-slate-500 p-8">
                <MessageSquareIcon className="w-16 h-16 mb-4 text-slate-300"/>
                <h2 className="text-2xl font-bold mb-2">لا توجد محادثة</h2>
                <p>لا يمكن بدء محادثة. قد يكون ملف الطفل غير مربوط بطبيب.</p>
            </div>
        );
    }
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden">
             <div className="p-4 border-b bg-slate-50 flex-shrink-0">
                <h1 className="text-xl font-bold text-slate-800">محادثة مع {otherUser.name}</h1>
                <p className="text-sm text-slate-500">{otherUser.specialty}</p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-slate-100 space-y-4">
                {messages.map(msg => {
                    const isCurrentUser = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                             {!isCurrentUser && (
                                <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center font-bold text-teal-700 flex-shrink-0">
                                    {otherUser.name.substring(0, 1)}
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${isCurrentUser ? 'bg-teal-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-teal-100' : 'text-slate-400'}`}>{new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {isCurrentUser && <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full" alt={currentUser.name} />}
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full p-2 border rounded-full px-4"
                    />
                    <button type="submit" className="bg-teal-600 text-white rounded-full p-2 hover:bg-teal-700 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    </button>
                </div>
            </form>
        </div>
    );
};