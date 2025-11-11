
import React, { useMemo, useState } from 'react';
import { ChildProfile, Reward, DailyLogs, Challenge } from '../types';
import { TrophyIcon, CheckCircleIcon, CheckSquareIcon, BadgeIcon } from './Icons';
import { DUMMY_CHALLENGES, DUMMY_BADGES } from '../constants';


interface RewardsPageProps {
  profile: ChildProfile;
  rewards: Reward[];
  onClaimReward: (reward: Reward) => boolean;
  todaysLogs: DailyLogs;
  dailyCompletedChallenges: string[];
}

const RewardCard: React.FC<{ reward: Reward; currentPoints: number; onClaim: () => void }> = ({ reward, currentPoints, onClaim }) => {
    const progress = Math.min((currentPoints / reward.pointsRequired) * 100, 100);
    const canClaim = currentPoints >= reward.pointsRequired;

    const handleClaimClick = () => {
        if (window.confirm(`هل أنت متأكد من تحقيق مكافأة "${reward.title}"؟ سيتم خصم ${reward.pointsRequired} نقطة.`)) {
            onClaim();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <img src={reward.imageUrl} alt={reward.title} className="w-full h-40 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{reward.title}</h3>
                <p className="text-sm text-slate-500 mb-4">
                    {reward.pointsRequired} نقطة مطلوبة
                </p>
                <div className="w-full bg-slate-200 rounded-full h-4 relative mt-auto">
                    <div
                        className="bg-amber-400 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-800">
                            {Math.floor(progress)}%
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleClaimClick}
                    disabled={!canClaim}
                    className="mt-4 w-full text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {canClaim ? 'تحقيق المكافأة' : 'نقاط غير كافية'}
                </button>
            </div>
        </div>
    );
};

const ChallengeCard: React.FC<{ challenge: Challenge, logs: DailyLogs, isCompleted: boolean }> = ({ challenge, logs, isCompleted }) => {
    const { current, target } = challenge.getProgress(logs);
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : (isCompleted ? 100 : 0);
    
    return (
        <div className={`p-4 rounded-lg transition-all ${isCompleted ? 'bg-green-100' : 'bg-slate-50'}`}>
            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <CheckSquareIcon className="w-5 h-5 text-white"/>
                </div>
                <div>
                    <p className={`font-bold ${isCompleted ? 'text-green-800' : 'text-slate-800'}`}>{challenge.title}</p>
                    <p className="text-xs text-slate-500">{challenge.description}</p>
                    <p className="text-xs font-semibold text-amber-600 mt-1">+{challenge.points} نقطة</p>
                </div>
            </div>
            <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-2.5 relative">
                     <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-amber-400'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {!isCompleted && <p className="text-xs text-right mt-1 text-slate-500">{current} / {target}</p>}
            </div>
        </div>
    );
};

const BadgeCard: React.FC<{ badge: (typeof DUMMY_BADGES)[0], isEarned: boolean }> = ({ badge, isEarned }) => {
    return (
        <div className={`p-4 rounded-lg text-center transition-opacity ${isEarned ? 'bg-white shadow-sm' : 'opacity-40'}`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isEarned ? 'bg-amber-400' : 'bg-slate-300'}`}>
                <BadgeIcon className="w-8 h-8 text-white"/>
            </div>
            <p className="font-bold text-sm text-slate-800">{badge.title}</p>
            <p className="text-xs text-slate-500">{badge.description}</p>
        </div>
    );
};


export const RewardsPage: React.FC<RewardsPageProps> = ({ profile, rewards, onClaimReward, todaysLogs, dailyCompletedChallenges }) => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const handleClaim = (reward: Reward) => {
        const success = onClaimReward(reward);
        if (success) {
            setSuccessMessage(`تهانينا! لقد حققت مكافأة "${reward.title}".`);
            setTimeout(() => setSuccessMessage(null), 4000);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <TrophyIcon className="w-10 h-10 text-amber-500" />
                <h1 className="text-3xl font-bold text-slate-800">المكافآت والنقاط</h1>
            </div>
             
             {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6" />
                    <p className="font-semibold">{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center">
                    <p className="text-lg font-semibold text-slate-600 mb-2">مجموع النقاط الحالي</p>
                    <p className="text-6xl font-extrabold text-amber-500">{profile.points}</p>
                    <p className="text-sm text-slate-400">نقطة</p>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                     <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckSquareIcon className="w-6 h-6 text-teal-500" />
                        <span>التحديات اليومية</span>
                     </h3>
                     <div className="space-y-3">
                        {DUMMY_CHALLENGES.map(challenge => (
                            <ChallengeCard 
                                key={challenge.id} 
                                challenge={challenge} 
                                logs={todaysLogs} 
                                isCompleted={dailyCompletedChallenges.includes(challenge.id)} 
                            />
                        ))}
                     </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BadgeIcon className="w-6 h-6 text-amber-500" />
                    <span>الشارات المكتسبة</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {DUMMY_BADGES.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} isEarned={profile.earnedBadgeIds.includes(badge.id)} />
                    ))}
                </div>
            </div>


            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">قائمة المكافآت</h2>
                {rewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {rewards.map(reward => (
                            <RewardCard key={reward.id} reward={reward} currentPoints={profile.points} onClaim={() => handleClaim(reward)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
                        <p className="text-slate-500">لم يقم ولي الأمر بإضافة أي مكافآت بعد. يرجى إضافتها من لوحة التحكم الرئيسية.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
