import React, { useState } from 'react';
import { Reward } from '../types';
import { GiftIcon } from './Icons';

interface ManageRewardsPageProps {
  rewards: Reward[];
  onAddReward: (rewardData: Omit<Reward, 'id'>) => void;
  onDeleteReward: (rewardId: number) => void;
  onBack: () => void;
}

export const ManageRewardsPage: React.FC<ManageRewardsPageProps> = ({ rewards, onAddReward, onDeleteReward, onBack }) => {
  const [title, setTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(pointsRequired, 10);
    if (title && points > 0) {
      onAddReward({ title, pointsRequired: points, imageUrl });
      setTitle('');
      setPointsRequired('');
      setImageUrl('');
    }
  };
  
  const handleDelete = (reward: Reward) => {
    if (window.confirm(`هل أنت متأكد من حذف مكافأة "${reward.title}"؟`)) {
      onDeleteReward(reward.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <GiftIcon className="w-10 h-10 text-amber-500" />
                <h1 className="text-3xl font-bold text-slate-800">إدارة المكافآت</h1>
            </div>
            <button onClick={onBack} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border hover:bg-slate-50 transition">
                العودة للوحة التحكم
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">إضافة مكافأة جديدة</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">اسم المكافأة</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">النقاط المطلوبة</label>
                        <input type="number" value={pointsRequired} onChange={e => setPointsRequired(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">رابط الصورة (اختياري)</label>
                        <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition">إضافة مكافأة</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">قائمة المكافآت الحالية</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {rewards.length > 0 ? rewards.map(reward => (
                        <div key={reward.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <img src={reward.imageUrl || 'https://via.placeholder.com/64'} alt={reward.title} className="w-16 h-16 rounded-md object-cover bg-slate-200" />
                                <div>
                                    <p className="font-bold">{reward.title}</p>
                                    <p className="text-sm text-amber-600 font-semibold">{reward.pointsRequired} نقطة</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(reward)} className="text-red-500 hover:text-red-700 font-bold text-lg px-3 py-1">×</button>
                        </div>
                    )) : (
                        <p className="text-slate-500 text-center py-8">لا توجد مكافآت مضافة حاليًا.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
