
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChildProfile, DoctorProfile, ParentProfile, Conversation, Message, SugarReading, CarePlan } from '../types';
import { StethoscopeIcon, UsersIcon, ChildIcon, AlertTriangleIcon, MessageSquareIcon, ClipboardListIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon } from './Icons';
import { calculateAge } from '../constants';

type ChildWithData = ChildProfile & { sugarReadings: SugarReading[] };

interface DoctorDashboardProps {
  doctorProfile: DoctorProfile;
  linkedChildrenData: ChildWithData[];
  onSwitchToParentView: () => void;
  conversations: Conversation[];
  messages: Message[];
  onSendMessage: (conversationId: number, text: string) => void;
  parentProfiles: ParentProfile[];
  carePlans: CarePlan[];
  onUpdateCarePlan: (plan: CarePlan) => void;
}

const calculateRiskScore = (child: ChildWithData): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentReadings = child.sugarReadings.filter(r => new Date(r.date) > oneWeekAgo);
    
    if (recentReadings.length === 0) return 0;

    const hypos = recentReadings.filter(r => r.value < child.hypoglycemiaLevel).length;
    const hypers = recentReadings.filter(r => r.value > child.hyperglycemiaLevel).length;

    return (hypos * 2) + hypers; // Weight hypos more heavily
};

const PatientListItem: React.FC<{
    child: ChildWithData;
    isSelected: boolean;
    onSelect: () => void;
    riskScore: number;
}> = ({ child, isSelected, onSelect, riskScore }) => (
    <button
        onClick={onSelect}
        className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-3 ${isSelected ? 'bg-teal-500 text-white' : 'hover:bg-slate-100'}`}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white' : 'bg-slate-200'}`}>
            <ChildIcon className={`w-6 h-6 ${isSelected ? 'text-teal-500' : 'text-slate-500'}`} />
        </div>
        <div className="flex-grow">
            <p className={`font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{child.name}</p>
            <p className={`text-xs ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>{calculateAge(child.dateOfBirth)} سنوات</p>
        </div>
        {riskScore > 3 && (
             <div className="flex-shrink-0" title="يحتاج إلى اهتمام">
                <AlertTriangleIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
            </div>
        )}
    </button>
);


const ChatPanel: React.FC<{
    selectedChild: ChildWithData;
    conversation: Conversation | undefined;
    messages: Message[];
    doctorProfile: DoctorProfile;
    parentProfile: ParentProfile | undefined;
    onSendMessage: (conversationId: number, text: string) => void;
}> = ({ selectedChild, conversation, messages, doctorProfile, parentProfile, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && conversation) {
            onSendMessage(conversation.id, newMessage);
            setNewMessage('');
        }
    };
    
    if (!parentProfile || !conversation) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-slate-500">
                <MessageSquareIcon className="w-16 h-16 mb-4"/>
                <p>لا توجد محادثة لهذا الطفل.</p>
                <p className="text-sm">يمكن لولي الأمر بدء المحادثة من واجهته.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-slate-50">
                <h3 className="font-bold text-slate-800">محادثة بخصوص {selectedChild.name}</h3>
                <p className="text-sm text-slate-500">مع ولي الأمر: {parentProfile.name}</p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-slate-100 space-y-4">
                {messages.map(msg => {
                    const isDoctor = msg.senderId === doctorProfile.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isDoctor ? 'justify-end' : ''}`}>
                            {!isDoctor && <img src={parentProfile.avatarUrl} className="w-8 h-8 rounded-full" alt={parentProfile.name} />}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${isDoctor ? 'bg-teal-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${isDoctor ? 'text-teal-100' : 'text-slate-400'}`}>{new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t bg-white">
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

const CarePlanPanel: React.FC<{
    childId: number;
    plan: CarePlan | undefined;
    onUpdatePlan: (plan: CarePlan) => void;
}> = ({ childId, plan, onUpdatePlan }) => {
    const [currentPlan, setCurrentPlan] = useState<CarePlan>(plan || { id: Date.now(), childId, goals: [], recommendations: [] });
    const [newGoal, setNewGoal] = useState('');
    const [newRecommendation, setNewRecommendation] = useState('');

    useEffect(() => {
        setCurrentPlan(plan || { id: Date.now(), childId, goals: [], recommendations: [] });
    }, [plan, childId]);

    const handleUpdate = () => onUpdatePlan(currentPlan);

    const addGoal = () => {
        if (newGoal.trim()) {
            const updatedPlan = { ...currentPlan, goals: [...currentPlan.goals, { id: `g-${Date.now()}`, text: newGoal, isCompleted: false }] };
            setCurrentPlan(updatedPlan);
            setNewGoal('');
        }
    };
    
    const addRecommendation = () => {
        if (newRecommendation.trim()) {
            const updatedPlan = { ...currentPlan, recommendations: [...currentPlan.recommendations, { id: `r-${Date.now()}`, text: newRecommendation }] };
            setCurrentPlan(updatedPlan);
            setNewRecommendation('');
        }
    };
    
    const toggleGoal = (goalId: string) => {
        const updatedPlan = { ...currentPlan, goals: currentPlan.goals.map(g => g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g) };
        setCurrentPlan(updatedPlan);
    };

    const removeGoal = (goalId: string) => {
        const updatedPlan = { ...currentPlan, goals: currentPlan.goals.filter(g => g.id !== goalId) };
        setCurrentPlan(updatedPlan);
    };

    const removeRecommendation = (recId: string) => {
        const updatedPlan = { ...currentPlan, recommendations: currentPlan.recommendations.filter(r => r.id !== recId) };
        setCurrentPlan(updatedPlan);
    };


    return (
        <div className="flex flex-col h-full p-4">
            <div className="space-y-4 overflow-y-auto">
                <div>
                    <h4 className="font-bold text-lg mb-2">الأهداف</h4>
                    <div className="space-y-2">
                        {currentPlan.goals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                                <input type="checkbox" checked={goal.isCompleted} onChange={() => toggleGoal(goal.id)} className="w-5 h-5 accent-teal-500" />
                                <p className={`flex-grow ${goal.isCompleted ? 'line-through text-slate-500' : ''}`}>{goal.text}</p>
                                <button onClick={() => removeGoal(goal.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="أضف هدف جديد..." className="w-full p-2 border rounded-md"/>
                        <button onClick={addGoal} className="bg-sky-500 text-white p-2 rounded-md"><PlusCircleIcon className="w-6 h-6"/></button>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">التوصيات</h4>
                     <div className="space-y-2">
                        {currentPlan.recommendations.map(rec => (
                            <div key={rec.id} className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                                <p className="flex-grow">{rec.text}</p>
                                <button onClick={() => removeRecommendation(rec.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input value={newRecommendation} onChange={e => setNewRecommendation(e.target.value)} placeholder="أضف توصية جديدة..." className="w-full p-2 border rounded-md"/>
                        <button onClick={addRecommendation} className="bg-sky-500 text-white p-2 rounded-md"><PlusCircleIcon className="w-6 h-6"/></button>
                    </div>
                </div>
            </div>
            <div className="mt-auto pt-4 border-t">
                <button onClick={handleUpdate} className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700">حفظ خطة الرعاية</button>
            </div>
        </div>
    );
};


export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctorProfile, linkedChildrenData, onSwitchToParentView, conversations, messages, onSendMessage, parentProfiles, carePlans, onUpdateCarePlan }) => {
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'plan'>('chat');

    const sortedChildren = useMemo(() => {
        return [...linkedChildrenData].sort((a, b) => calculateRiskScore(b) - calculateRiskScore(a));
    }, [linkedChildrenData]);

    useEffect(() => {
        if (!selectedChildId && sortedChildren.length > 0) {
            setSelectedChildId(sortedChildren[0].id);
        }
    }, [sortedChildren, selectedChildId]);
    
    const selectedChild = linkedChildrenData.find(c => c.id === selectedChildId);
    const selectedConversation = conversations.find(c => c.childId === selectedChildId);
    const selectedMessages = messages.filter(m => m.conversationId === selectedConversation?.id);
    const selectedParent = parentProfiles.find(p => p.id === selectedChild?.parentId);
    const selectedCarePlan = carePlans.find(p => p.childId === selectedChildId);

    return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
             <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <StethoscopeIcon className="w-12 h-12 text-teal-500 flex-shrink-0" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">لوحة تحكم الطبيب</h1>
                  <p className="text-xl text-slate-600">{doctorProfile.name}</p>
                </div>
              </div>
              <button onClick={onSwitchToParentView} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border hover:bg-slate-50 transition">
                  العودة لواجهة ولي الأمر
              </button>
            </header>
            
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-150px)]">
                <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-sm flex flex-col">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 p-2">
                        <UsersIcon className="w-6 h-6 text-teal-500" />
                        <span>المرضى ({sortedChildren.length})</span>
                    </h2>
                    <div className="space-y-2 overflow-y-auto">
                        {sortedChildren.map(child => (
                            <PatientListItem
                                key={child.id}
                                child={child}
                                isSelected={selectedChildId === child.id}
                                onSelect={() => setSelectedChildId(child.id)}
                                riskScore={calculateRiskScore(child)}
                            />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                     {selectedChild && (
                        <>
                            <div className="flex border-b flex-shrink-0">
                                <button onClick={() => setActiveTab('chat')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold ${activeTab === 'chat' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}><MessageSquareIcon className="w-5 h-5"/><span>المحادثة</span></button>
                                <button onClick={() => setActiveTab('plan')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold ${activeTab === 'plan' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}><ClipboardListIcon className="w-5 h-5"/><span>خطة الرعاية</span></button>
                            </div>
                            <div className="flex-grow overflow-hidden">
                                {activeTab === 'chat' && (
                                    <ChatPanel
                                        selectedChild={selectedChild}
                                        conversation={selectedConversation}
                                        messages={selectedMessages}
                                        doctorProfile={doctorProfile}
                                        parentProfile={selectedParent}
                                        onSendMessage={onSendMessage}
                                    />
                                )}
                                {activeTab === 'plan' && (
                                    <CarePlanPanel
                                        childId={selectedChild.id}
                                        plan={selectedCarePlan}
                                        onUpdatePlan={onUpdateCarePlan}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};