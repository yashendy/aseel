
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataManagement } from './components/DataManagement';
import { AIAssistant } from './components/AIAssistant';
import { MealsPage } from './components/MealsPage';
import { ProfilePage } from './components/ProfilePage';
import { MeasurementPage } from './components/MeasurementPage';
import { ReportsPage } from './components/ReportsPage';
import { ParentDashboard } from './components/ParentDashboard';
import { AwarenessPage } from './components/AwarenessPage';
import { RewardsPage } from './components/RewardsPage';
import { ManageRewardsPage } from './components/ManageRewardsPage';
import { GlobalNotifications } from './components/GlobalNotifications';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GrowthChartPage } from './components/GrowthChartPage';
import { DoctorChatPage } from './components/DoctorChatPage';
import { CGMIntegrationPage } from './components/CGMIntegrationPage';
import { CommunityPage } from './components/CommunityPage';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SmartwatchView } from './components/SmartwatchView';
import { LogType, SugarReading, MealLog, Appointment, ChildProfile, ParentProfile, MealTemplate, Reward, DoctorProfile, FoodItem, GrowthRecord, InsulinLog, ExerciseLog, SicknessLog, DailyLogs, ProactiveInsight, Conversation, Message, CommunityPost, CommunityReply, GlucosePrediction, VoiceCommand, Caregiver, CarePlan, DashboardWidget } from './types';
import { DUMMY_APPOINTMENTS, DUMMY_MEALS, DUMMY_SUGAR_READINGS, DUMMY_CHILD_PROFILES, DUMMY_PARENT_PROFILE, EMPTY_PROFILE_DEFAULTS, DUMMY_MEAL_TEMPLATES, DUMMY_REWARDS, DUMMY_DOCTOR_PROFILES, DUMMY_FOOD_ITEMS, DUMMY_INSULIN_LOGS, DUMMY_EXERCISE_LOGS, DUMMY_SICKNESS_LOGS, DUMMY_CHALLENGES, DUMMY_BADGES, DUMMY_CONVERSATIONS, DUMMY_MESSAGES, DUMMY_COMMUNITY_POSTS, DUMMY_COMMUNITY_REPLIES, DUMMY_CAREGIVERS, DUMMY_CARE_PLANS } from './constants';
import { generateProactiveInsights, generateGlucosePrediction, processVoiceCommand, analyzeHealthData } from './services/geminiService';
import { HeartPulseIcon, BrainCircuitIcon, UtensilsIcon, ChildIcon, DropletIcon, ClipboardListIcon, StethoscopeIcon, BookOpenIcon, TrophyIcon, GiftIcon, TrendingUpIcon, MessageSquareIcon, Share2Icon, MessageCircleIcon, MicIcon } from './components/Icons';

type View = 'dashboard' | 'measurement' | 'logs' | 'ai' | 'meals' | 'profile' | 'reports' | 'awareness' | 'rewards' | 'growth' | 'doctor-chat' | 'cgm' | 'community';
type ParentView = 'dashboard' | 'manageRewards';
type AppMode = 'parent' | 'doctor' | 'admin' | 'caregiver';
export type AdminView = 'dashboard' | 'children' | 'doctors' | 'food';


const App: React.FC = () => {
  // Global data state
  const [parentProfile, setParentProfile] = useState<ParentProfile>(DUMMY_PARENT_PROFILE);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(DUMMY_CHILD_PROFILES);
  const [doctorProfiles, setDoctorProfiles] = useState<DoctorProfile[]>(DUMMY_DOCTOR_PROFILES);
  const [sugarReadings, setSugarReadings] = useState<SugarReading[]>(DUMMY_SUGAR_READINGS);
  const [mealLogs, setMealLogs] = useState<MealLog[]>(DUMMY_MEALS);
  const [appointments, setAppointments] = useState<Appointment[]>(DUMMY_APPOINTMENTS);
  const [insulinLogs, setInsulinLogs] = useState<InsulinLog[]>(DUMMY_INSULIN_LOGS);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(DUMMY_EXERCISE_LOGS);
  const [sicknessLogs, setSicknessLogs] = useState<SicknessLog[]>(DUMMY_SICKNESS_LOGS);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>(DUMMY_MEAL_TEMPLATES);
  const [rewards, setRewards] = useState<Reward[]>(DUMMY_REWARDS);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(DUMMY_FOOD_ITEMS);
  const [conversations, setConversations] = useState<Conversation[]>(DUMMY_CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(DUMMY_COMMUNITY_POSTS);
  const [communityReplies, setCommunityReplies] = useState<CommunityReply[]>(DUMMY_COMMUNITY_REPLIES);
  const [caregivers, setCaregivers] = useState<Caregiver[]>(DUMMY_CAREGIVERS);
  const [carePlans, setCarePlans] = useState<CarePlan[]>(DUMMY_CARE_PLANS);


  // UI state
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);
  const [parentView, setParentView] = useState<ParentView>('dashboard');
  const [dismissedReminderIds, setDismissedReminderIds] = useState<Set<number>>(new Set());
  const [appMode, setAppMode] = useState<AppMode>('parent');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [dailyCompletedChallenges, setDailyCompletedChallenges] = useState<string[]>([]);
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [prediction, setPrediction] = useState<GlucosePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSmartwatchVisible, setIsSmartwatchVisible] = useState(false);
  
  // FIX: In a browser environment, setInterval returns a number, not a NodeJS.Timeout.
  const cgmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const selectedChild = childProfiles.find(c => c.id === selectedChildId);
    if (selectedChild?.cgm && !cgmIntervalRef.current) {
        cgmIntervalRef.current = setInterval(() => {
            setSugarReadings(prev => {
                const lastReading = prev[0]?.value || 120;
                const change = (Math.random() - 0.45) * 5; // Small random fluctuation
                const newValue = Math.max(40, Math.min(400, lastReading + change));
                const newReading: SugarReading = {
                    id: Date.now(),
                    childId: selectedChild.id,
                    value: newValue,
                    date: new Date().toISOString(),
                    timeContext: 'other',
                };
                return [newReading, ...prev];
            });
        }, 5000); // Add a new reading every 5 seconds for demo
    } else if (!selectedChild?.cgm && cgmIntervalRef.current) {
        clearInterval(cgmIntervalRef.current);
        cgmIntervalRef.current = null;
    }

    return () => {
        if (cgmIntervalRef.current) {
            clearInterval(cgmIntervalRef.current);
            cgmIntervalRef.current = null;
        }
    };
  }, [selectedChildId, childProfiles]);


  const selectedChild = childProfiles.find(c => c.id === selectedChildId);
  const childSugarReadings = sugarReadings.filter(r => r.childId === selectedChildId);
  const childMealLogs = mealLogs.filter(m => m.childId === selectedChildId);
  const childAppointments = appointments.filter(a => a.childId === selectedChildId);
  const childInsulinLogs = insulinLogs.filter(i => i.childId === selectedChildId);
  const childExerciseLogs = exerciseLogs.filter(e => e.childId === selectedChildId);
  const childSicknessLogs = sicknessLogs.filter(s => s.childId === selectedChildId);
  const childMealTemplates = mealTemplates.filter(t => t.childId === selectedChildId);
  const childCaregivers = caregivers.filter(c => c.childId === selectedChildId);
  const childCarePlan = carePlans.find(p => p.childId === selectedChildId);
  
  const addLogAndCheckAwards = (type: LogType, data: any) => {
    if (!selectedChildId) return;

    const newLog = { id: Date.now(), childId: selectedChildId, ...data };
    if (!data.date) {
        newLog.date = new Date().toISOString();
    }

    let tempSugar = [...sugarReadings];
    let tempMeals = [...mealLogs];
    let tempInsulin = [...insulinLogs];
    let tempExercise = [...exerciseLogs];
    let tempSickness = [...sicknessLogs];

    switch (type) {
        case LogType.SUGAR:
            tempSugar = [newLog, ...tempSugar];
            break;
        case LogType.MEAL:
            tempMeals = [newLog, ...tempMeals];
            break;
        case LogType.APPOINTMENT:
            setAppointments(prev => [newLog, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            return; // No points for appointments
        case LogType.INSULIN:
            tempInsulin = [newLog, ...tempInsulin];
            break;
        case LogType.EXERCISE:
            tempExercise = [newLog, ...tempExercise];
            break;
        case LogType.SICKNESS:
            tempSickness = [newLog, ...tempSickness];
            break;
    }

    // Sort logs by date after adding new one
    const sortLogs = (logs: any[]) => logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Update log states first
    setSugarReadings(sortLogs(tempSugar));
    setMealLogs(sortLogs(tempMeals));
    setInsulinLogs(sortLogs(tempInsulin));
    setExerciseLogs(sortLogs(tempExercise));
    setSicknessLogs(sortLogs(tempSickness));
    
    const child = childProfiles.find(p => p.id === selectedChildId);
    if (!child) return;

    let pointsToAdd = 0;
    const newEarnedBadgeIds = [...child.earnedBadgeIds];

    // 1. Award point for in-range reading
    if (type === LogType.SUGAR) {
        const reading = newLog as SugarReading;
        if (reading.value >= child.hypoglycemiaLevel && reading.value <= child.hyperglycemiaLevel) {
            pointsToAdd += 1;
        }
    }

    // 2. Check daily challenges
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs: DailyLogs = {
        sugar: tempSugar.filter(l => l.childId === selectedChildId && l.date.startsWith(todayStr)),
        meal: tempMeals.filter(l => l.childId === selectedChildId && l.date.startsWith(todayStr)),
        insulin: tempInsulin.filter(l => l.childId === selectedChildId && l.date.startsWith(todayStr)),
        exercise: tempExercise.filter(l => l.childId === selectedChildId && l.date.startsWith(todayStr)),
        sickness: tempSickness.filter(l => l.childId === selectedChildId && l.date.startsWith(todayStr)),
    };

    const newCompletedChallenges = [...dailyCompletedChallenges];
    DUMMY_CHALLENGES.forEach(challenge => {
        if (!newCompletedChallenges.includes(challenge.id) && challenge.isComplete(todaysLogs)) {
            pointsToAdd += challenge.points;
            newCompletedChallenges.push(challenge.id);
        }
    });

    if (newCompletedChallenges.length > dailyCompletedChallenges.length) {
        setDailyCompletedChallenges(newCompletedChallenges);
    }

    // 3. Check achievement badges
    const allLogs: DailyLogs = {
        sugar: tempSugar.filter(l => l.childId === selectedChildId),
        meal: tempMeals.filter(l => l.childId === selectedChildId),
        insulin: tempInsulin.filter(l => l.childId === selectedChildId),
        exercise: tempExercise.filter(l => l.childId === selectedChildId),
        sickness: tempSickness.filter(l => l.childId === selectedChildId),
    };

    DUMMY_BADGES.forEach(badge => {
        if (!newEarnedBadgeIds.includes(badge.id) && badge.isComplete(allLogs)) {
            newEarnedBadgeIds.push(badge.id);
        }
    });

    // 4. Update child profile if anything changed
    if (pointsToAdd > 0 || newEarnedBadgeIds.length > child.earnedBadgeIds.length) {
        setChildProfiles(prev => prev.map(p =>
            p.id === selectedChildId
                ? {
                    ...p,
                    points: p.points + pointsToAdd,
                    earnedBadgeIds: newEarnedBadgeIds,
                }
                : p
        ));
    }
  };

  useEffect(() => {
    const fetchInsights = async () => {
        if (!selectedChildId || !selectedChild) return;
        
        setIsGeneratingInsights(true);
        setProactiveInsights([]);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentData = {
            profile: { name: selectedChild.name, age: new Date().getFullYear() - new Date(selectedChild.dateOfBirth).getFullYear() },
            sugarReadings: childSugarReadings.filter(r => new Date(r.date) > oneWeekAgo),
            mealLogs: childMealLogs.filter(m => new Date(m.date) > oneWeekAgo),
            insulinLogs: childInsulinLogs.filter(i => new Date(i.date) > oneWeekAgo),
            exerciseLogs: childExerciseLogs.filter(e => new Date(e.date) > oneWeekAgo),
        };

        const insights = await generateProactiveInsights(recentData);
        setProactiveInsights(insights);
        setIsGeneratingInsights(false);
    };

    const timer = setTimeout(fetchInsights, 1000); // Debounce fetching
    return () => clearTimeout(timer);
  }, [selectedChildId, sugarReadings, mealLogs, insulinLogs, exerciseLogs]);
  
  const addMealTemplate = useCallback((templateData: Omit<MealTemplate, 'id'>) => {
    if (!selectedChildId) return;
    const newTemplate = { ...templateData, id: Date.now(), childId: selectedChildId };
    setMealTemplates(prev => [...prev, newTemplate]);
  }, [selectedChildId]);

  const handleSaveProfile = (profileData: ChildProfile) => {
    const now = new Date().toISOString();
    
    if (profileData.id === 0) { // New Child
      const newId = Date.now();
      // Add first growth record
      profileData.growthLog = [{
          date: now,
          weight: profileData.weight,
          height: profileData.height,
      }];
      const newChild = { ...profileData, id: newId, parentId: parentProfile.id };
      setChildProfiles(prev => [...prev, newChild]);
      setSelectedChildId(newId);
    } else { // Existing Child
      const currentChild = childProfiles.find(p => p.id === profileData.id);
      if (currentChild) {
          const lastLog = currentChild.growthLog?.[currentChild.growthLog.length - 1];
          // Check if weight or height has changed
          if (!lastLog || lastLog.weight !== profileData.weight || lastLog.height !== profileData.height) {
               profileData.growthLog = [
                  ...(currentChild.growthLog || []),
                  {
                      date: now,
                      weight: profileData.weight,
                      height: profileData.height,
                  }
               ];
          } else {
            // Keep the old log if no changes
            profileData.growthLog = currentChild.growthLog;
          }
      }
      setChildProfiles(prev => prev.map(p => p.id === profileData.id ? profileData : p));
      setSelectedChildId(profileData.id);
    }
    setEditingProfile(null);
    setCurrentView('dashboard');
};
  
  const handleCancelProfile = () => {
    setEditingProfile(null);
    if (selectedChildId) {
        setCurrentView('dashboard');
    }
  };
  
  const handleAddChild = () => {
    setEditingProfile(EMPTY_PROFILE_DEFAULTS);
    setSelectedChildId(null);
  };
  
  const handleSelectChild = (id: number) => {
    setSelectedChildId(id);
    setCurrentView('dashboard');
    setEditingProfile(null);
    setParentView('dashboard');
    setAppMode('parent');
    setDailyCompletedChallenges([]); // Reset daily challenges for the new child
  };

  const goToParentDashboard = () => {
    setSelectedChildId(null);
    setEditingProfile(null);
    setParentView('dashboard');
    setAppMode('parent');
    // Also works for caregiver
  };

  const addReward = (rewardData: Omit<Reward, 'id'>) => {
    const newReward = { ...rewardData, id: Date.now() };
    setRewards(prev => [...prev, newReward]);
  };

  const deleteReward = (rewardId: number) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId));
  };

  const handleClaimReward = (reward: Reward) => {
    if (!selectedChild) return false;

    if (selectedChild.points >= reward.pointsRequired) {
      const updatedChild = { ...selectedChild, points: selectedChild.points - reward.pointsRequired };
      setChildProfiles(prev => prev.map(p => p.id === selectedChildId ? updatedChild : p));
      return true;
    }
    return false;
  };

  const handleDismissReminder = useCallback((id: number) => {
      setDismissedReminderIds(prev => new Set(prev).add(id));
  }, []);

  const handleLinkDoctor = useCallback((childId: number, doctorCode: string): boolean => {
    const doctor = doctorProfiles.find(d => d.linkCode === doctorCode.trim());
    if (doctor) {
        setChildProfiles(prev => prev.map(child =>
            child.id === childId ? { ...child, linkedDoctorId: doctor.id, doctorLinkCode: doctor.linkCode } : child
        ));
        // Create a new conversation if one doesn't exist
        const conversationExists = conversations.some(c => c.childId === childId && c.participants.doctorId === doctor.id);
        if (!conversationExists) {
            const newConversation: Conversation = {
                id: Date.now(),
                childId: childId,
                participants: { parentId: parentProfile.id, doctorId: doctor.id }
            };
            setConversations(prev => [...prev, newConversation]);
        }
        return true;
    }
    return false;
  }, [doctorProfiles, conversations, parentProfile.id]);

  const handleUnlinkDoctor = useCallback((childId: number) => {
    setChildProfiles(prev => prev.map(child =>
        child.id === childId ? { ...child, linkedDoctorId: null, doctorLinkCode: null } : child
    ));
  }, []);

  const handleAddFoodItem = (item: Omit<FoodItem, 'id'>) => {
    setFoodItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const handleUpdateFoodItem = (updatedItem: FoodItem) => {
    setFoodItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteFoodItem = (itemId: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddGrowthRecord = useCallback((childId: number, record: GrowthRecord) => {
    setChildProfiles(prev => prev.map(child => {
        if (child.id === childId) {
            const newLog = [...(child.growthLog || []), record];
            newLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const latestRecord = newLog[0];
            return {
                ...child,
                growthLog: newLog,
                weight: latestRecord.weight,
                height: latestRecord.height,
            };
        }
        return child;
    }));
  }, []);

  const handleDeleteGrowthRecord = useCallback((childId: number, recordDate: string) => {
      setChildProfiles(prev => prev.map(child => {
          if (child.id === childId) {
              const newLog = (child.growthLog || []).filter(r => r.date !== recordDate);
              newLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const latestRecord = newLog[0];
              return {
                  ...child,
                  growthLog: newLog,
                  weight: latestRecord ? latestRecord.weight : child.weight,
                  height: latestRecord ? latestRecord.height : child.height,
              };
          }
          return child;
      }));
  }, []);
  
  const handleSendMessage = useCallback((conversationId: number, text: string, senderId: number) => {
    const newMessage: Message = {
        id: Date.now(),
        conversationId,
        senderId,
        text,
        timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);
  
    const handleConnectCGM = useCallback((childId: number, provider: 'dexcom' | 'freestyle') => {
        setChildProfiles(prev => prev.map(child => 
            child.id === childId ? { ...child, cgm: provider } : child
        ));
    }, []);

    const handleDisconnectCGM = useCallback((childId: number) => {
        setChildProfiles(prev => prev.map(child =>
            child.id === childId ? { ...child, cgm: null } : child
        ));
    }, []);

    const handleAddPost = useCallback((title: string, content: string) => {
        const newPost: CommunityPost = {
            id: Date.now(),
            authorId: parentProfile.id,
            authorName: parentProfile.name,
            authorAvatarUrl: parentProfile.avatarUrl,
            title,
            content,
            timestamp: new Date().toISOString()
        };
        setCommunityPosts(prev => [newPost, ...prev]);
    }, [parentProfile]);

    const handleAddReply = useCallback((postId: number, content: string) => {
        const newReply: CommunityReply = {
            id: Date.now(),
            postId,
            authorId: parentProfile.id,
            authorName: parentProfile.name,
            authorAvatarUrl: parentProfile.avatarUrl,
            content,
            timestamp: new Date().toISOString()
        };
        setCommunityReplies(prev => [...prev, newReply]);
    }, [parentProfile]);

    const handleGeneratePrediction = useCallback(async () => {
        setIsPredicting(true);
        setPrediction(null);
        if (!selectedChild) {
            setIsPredicting(false);
            return;
        }
        const threeHoursAgo = new Date();
        threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

        const recentData = {
            sugarReadings: childSugarReadings.filter(r => new Date(r.date) > threeHoursAgo),
            mealLogs: childMealLogs.filter(m => new Date(m.date) > threeHoursAgo),
            insulinLogs: childInsulinLogs.filter(i => new Date(i.date) > threeHoursAgo),
        };
        const result = await generateGlucosePrediction(recentData);
        setPrediction(result);
        setIsPredicting(false);
    }, [selectedChild, childSugarReadings, childMealLogs, childInsulinLogs]);

    const handleProcessVoiceCommand = useCallback(async (command: string): Promise<string> => {
        if (!selectedChildId) return "الرجاء تحديد ملف طفل أولاً.";
    
        const structuredCommand = await processVoiceCommand(command);
    
        if (structuredCommand.intent === 'log') {
            if (structuredCommand.logType === 'sugar' && structuredCommand.value) {
                addLogAndCheckAwards(LogType.SUGAR, { value: structuredCommand.value, timeContext: 'other' });
                return `تم تسجيل قراءة السكر: ${structuredCommand.value}`;
            }
            if (structuredCommand.logType === 'insulin' && structuredCommand.units) {
                addLogAndCheckAwards(LogType.INSULIN, { units: structuredCommand.units, type: structuredCommand.insulinType || 'bolus' });
                return `تم تسجيل ${structuredCommand.units} وحدة أنسولين.`;
            }
        }
    
        if (structuredCommand.intent === 'query' && structuredCommand.query) {
             const allLogs = {
                sugarReadings: childSugarReadings,
                mealLogs: childMealLogs,
                insulinLogs: childInsulinLogs,
                exerciseLogs: childExerciseLogs,
                sicknessLogs: childSicknessLogs,
                appointments: childAppointments,
                profile: selectedChild,
            };
            return await analyzeHealthData(allLogs, structuredCommand.query);
        }
    
        return "لم أتمكن من فهم الأمر. هل يمكنك المحاولة مرة أخرى؟";
    }, [selectedChildId, selectedChild, childSugarReadings, childMealLogs, childInsulinLogs, childExerciseLogs, childSicknessLogs, childAppointments]);

  const handleUpdateDashboardLayout = (newLayout: DashboardWidget[]) => {
      setParentProfile(prev => ({...prev, dashboardLayout: newLayout}));
  };

  const handleAddCaregiver = (childId: number, name: string, email: string, permission: 'read' | 'read_write') => {
      const newCaregiver: Caregiver = { id: Date.now(), childId, name, email, permission };
      setCaregivers(prev => [...prev, newCaregiver]);
  };
  const handleRemoveCaregiver = (caregiverId: number) => {
      setCaregivers(prev => prev.filter(c => c.id !== caregiverId));
  };
  const handleUpdateCarePlan = (plan: CarePlan) => {
      setCarePlans(prev => prev.map(p => p.id === plan.id ? plan : p));
  };


  // Admin Functions
  const handleToggleChildStatus = (childId: number) => {
    setChildProfiles(prev => prev.map(child => 
      child.id === childId ? { ...child, isActive: !child.isActive } : child
    ));
  };

  const handleAddDoctor = (doctorData: Omit<DoctorProfile, 'id' | 'linkCode'>) => {
    const linkCode = `DOC-${doctorData.name.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-5)}`;
    const newDoctor: DoctorProfile = { ...doctorData, id: Date.now(), linkCode };
    setDoctorProfiles(prev => [...prev, newDoctor]);
  };

  const handleUpdateDoctor = (updatedDoctor: DoctorProfile) => {
    setDoctorProfiles(prev => prev.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc));
  };

  const handleDeleteDoctor = (doctorId: number) => {
    // Also unlink any children associated with this doctor
    setChildProfiles(prev => prev.map(child => 
      child.linkedDoctorId === doctorId ? { ...child, linkedDoctorId: null, doctorLinkCode: null } : child
    ));
    setDoctorProfiles(prev => prev.filter(doc => doc.id !== doctorId));
  };

  const handleAdminLinkDoctor = (childId: number, doctorId: number) => {
    const doctor = doctorProfiles.find(d => d.id === doctorId);
    if (doctor) {
      setChildProfiles(prev => prev.map(child => 
        child.id === childId ? { ...child, linkedDoctorId: doctorId, doctorLinkCode: doctor.linkCode } : child
      ));
    }
  };

  const handleAdminUnlinkDoctor = (childId: number) => {
    setChildProfiles(prev => prev.map(child => 
      child.id === childId ? { ...child, linkedDoctorId: null, doctorLinkCode: null } : child
    ));
  };

  const baseNavItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <HeartPulseIcon className="w-6 h-6" />, view: 'dashboard' as View },
    { id: 'measurement', label: 'إدارة القياس', icon: <DropletIcon className="w-6 h-6" />, view: 'measurement' as View },
    { id: 'reports', label: 'التقارير', icon: <ClipboardListIcon className="w-6 h-6" />, view: 'reports' as View },
    { id: 'growth', label: 'سجل النمو', icon: <TrendingUpIcon className="w-6 h-6" />, view: 'growth' as View },
    { id: 'logs', label: 'إدارة المواعيد', icon: <StethoscopeIcon className="w-6 h-6" />, view: 'logs' as View },
    { id: 'meals', label: 'مساعد الوجبات', icon: <UtensilsIcon className="w-6 h-6" />, view: 'meals' as View },
    { id: 'cgm', label: 'ربط الأجهزة', icon: <Share2Icon className="w-6 h-6" />, view: 'cgm' as View },
    { id: 'rewards', label: 'المكافآت والنقاط', icon: <TrophyIcon className="w-6 h-6" />, view: 'rewards' as View },
    { id: 'community', label: 'المجتمع', icon: <MessageCircleIcon className="w-6 h-6" />, view: 'community' as View },
    { id: 'awareness', label: 'مجلة التوعية', icon: <BookOpenIcon className="w-6 h-6" />, view: 'awareness' as View },
    { id: 'ai', label: 'المساعد الذكي', icon: <BrainCircuitIcon className="w-6 h-6" />, view: 'ai' as View },
    { id: 'profile', label: 'بيانات الطفل', icon: <ChildIcon className="w-6 h-6" />, view: 'profile' as View }
  ];

  const navItems = useMemo(() => {
    const items = [...baseNavItems];
    if (selectedChild?.linkedDoctorId) {
        const profileIndex = items.findIndex(item => item.id === 'profile');
        items.splice(profileIndex, 0, { id: 'doctor-chat', label: 'محادثة الطبيب', icon: <MessageSquareIcon className="w-6 h-6" />, view: 'doctor-chat' as View });
    }
    return items;
  }, [selectedChild]);

  const renderView = () => {
    const allLogs = {
        sugarReadings: childSugarReadings,
        mealLogs: childMealLogs,
        insulinLogs: childInsulinLogs,
        exerciseLogs: childExerciseLogs,
        sicknessLogs: childSicknessLogs,
    };
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs: DailyLogs = {
        sugar: childSugarReadings.filter(l => l.date.startsWith(todayStr)),
        meal: childMealLogs.filter(l => l.date.startsWith(todayStr)),
        insulin: childInsulinLogs.filter(l => l.date.startsWith(todayStr)),
        exercise: childExerciseLogs.filter(l => l.date.startsWith(todayStr)),
        sickness: childSicknessLogs.filter(l => l.date.startsWith(todayStr)),
    };
    
    const currentConversation = conversations.find(c => c.childId === selectedChildId);
    const doctorProfile = doctorProfiles.find(d => d.id === selectedChild?.linkedDoctorId);

    switch (currentView) {
      case 'dashboard': return <Dashboard 
                                {...allLogs} 
                                appointments={childAppointments}
                                profile={selectedChild!}
                                proactiveInsights={proactiveInsights}
                                isGeneratingInsights={isGeneratingInsights}
                                onGeneratePrediction={handleGeneratePrediction}
                                prediction={prediction}
                                isPredicting={isPredicting}
                                carePlan={childCarePlan}
                                dashboardLayout={parentProfile.dashboardLayout}
                                onUpdateLayout={handleUpdateDashboardLayout}
                                onShowSmartwatch={() => setIsSmartwatchVisible(true)}
                              />;
      case 'measurement': return <MeasurementPage sugarReadings={childSugarReadings} addLog={addLogAndCheckAwards} profile={selectedChild!} />;
      case 'reports': return <ReportsPage sugarReadings={childSugarReadings} profile={selectedChild!} />;
      case 'growth': return <GrowthChartPage profile={selectedChild!} />;
      case 'logs': return <DataManagement appointments={childAppointments} addLog={addLogAndCheckAwards} />;
      case 'meals': return <MealsPage profile={selectedChild!} addLog={addLogAndCheckAwards} mealTemplates={childMealTemplates} addMealTemplate={addMealTemplate} childMealLogs={childMealLogs} foodItems={foodItems} onAddFoodItem={handleAddFoodItem} />;
      case 'cgm': return <CGMIntegrationPage profile={selectedChild!} onConnectCGM={handleConnectCGM} onDisconnectCGM={handleDisconnectCGM} />;
      case 'rewards': return <RewardsPage 
                                profile={selectedChild!}
                                rewards={rewards}
                                onClaimReward={handleClaimReward}
                                todaysLogs={todaysLogs}
                                dailyCompletedChallenges={dailyCompletedChallenges}
                             />;
      case 'community': return <CommunityPage
                                posts={communityPosts}
                                replies={communityReplies}
                                currentUser={parentProfile}
                                onAddPost={handleAddPost}
                                onAddReply={handleAddReply}
                              />;
      case 'awareness': return <AwarenessPage />;
      case 'ai': return <AIAssistant allData={{ ...allLogs, appointments: childAppointments, profile: selectedChild! }} />;
      case 'profile': return <ProfilePage 
                                profile={selectedChild!} 
                                onSave={handleSaveProfile} 
                                onCancel={handleCancelProfile}
                                doctors={doctorProfiles}
                                onLinkDoctor={handleLinkDoctor}
                                onUnlinkDoctor={handleUnlinkDoctor}
                                foodItems={foodItems}
                                onAddGrowthRecord={handleAddGrowthRecord}
                                onDeleteGrowthRecord={handleDeleteGrowthRecord}
                                caregivers={childCaregivers}
                                onAddCaregiver={handleAddCaregiver}
                                onRemoveCaregiver={handleRemoveCaregiver}
                              />;
      case 'doctor-chat': return <DoctorChatPage 
                                conversation={currentConversation}
                                messages={messages.filter(m => m.conversationId === currentConversation?.id)}
                                currentUser={parentProfile}
                                otherUser={doctorProfile}
                                onSendMessage={(text) => handleSendMessage(currentConversation!.id, text, parentProfile.id)}
                              />;
      default: return <Dashboard {...allLogs} appointments={childAppointments} profile={selectedChild!} proactiveInsights={proactiveInsights} isGeneratingInsights={isGeneratingInsights} onGeneratePrediction={handleGeneratePrediction} prediction={prediction} isPredicting={isPredicting} carePlan={childCarePlan} dashboardLayout={parentProfile.dashboardLayout} onUpdateLayout={handleUpdateDashboardLayout} onShowSmartwatch={() => setIsSmartwatchVisible(true)} />;
    }
  };
  
  const renderAppContent = () => {
    if (appMode === 'admin') {
      return <AdminDashboard 
                adminView={adminView}
                setAdminView={setAdminView}
                onSwitchToParentView={() => setAppMode('parent')}
                foodItems={foodItems}
                onAddFoodItem={handleAddFoodItem}
                onUpdateFoodItem={handleUpdateFoodItem}
                onDeleteFoodItem={handleDeleteFoodItem}
                childProfiles={childProfiles}
                doctorProfiles={doctorProfiles}
                parentProfile={parentProfile}
                onToggleChildStatus={handleToggleChildStatus}
                onAddDoctor={handleAddDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
                onAdminLinkDoctor={handleAdminLinkDoctor}
                onAdminUnlinkDoctor={handleAdminUnlinkDoctor}
            />;
    }
    
    if (appMode === 'doctor') {
      const currentDoctor = doctorProfiles[0]; // Assuming one doctor for this demo
      if (!currentDoctor) return <div>No doctor profile found.</div>;
      
      const linkedChildrenData = childProfiles.filter(c => c.linkedDoctorId === currentDoctor.id).map(child => {
          const childLogs = sugarReadings.filter(r => r.childId === child.id);
          return { ...child, sugarReadings: childLogs };
      });
      
      return <DoctorDashboard
          doctorProfile={currentDoctor}
          linkedChildrenData={linkedChildrenData}
          onSwitchToParentView={() => setAppMode('parent')}
          conversations={conversations.filter(c => c.participants.doctorId === currentDoctor.id)}
          messages={messages}
          onSendMessage={(convId, text) => handleSendMessage(convId, text, currentDoctor.id)}
          parentProfiles={[parentProfile]}
          carePlans={carePlans.filter(p => linkedChildrenData.some(c => c.id === p.childId))}
          onUpdateCarePlan={handleUpdateCarePlan}
      />;
    }
    
    // Caregiver mode just shows the parent dashboard with a filtered list of children
    const visibleChildren = appMode === 'caregiver'
        ? childProfiles.filter(c => c.isActive && caregivers.some(cg => cg.childId === c.id /* && cg.email === loggedInCaregiverEmail */))
        : childProfiles.filter(c => c.isActive);

    if (editingProfile) {
      return (
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
              <ProfilePage 
                  profile={editingProfile} 
                  onSave={handleSaveProfile} 
                  onCancel={handleCancelProfile}
                  doctors={doctorProfiles}
                  onLinkDoctor={handleLinkDoctor}
                  onUnlinkDoctor={handleUnlinkDoctor}
                  foodItems={foodItems}
                  onAddGrowthRecord={handleAddGrowthRecord}
                  onDeleteGrowthRecord={handleDeleteGrowthRecord}
                  caregivers={childCaregivers}
                  onAddCaregiver={handleAddCaregiver}
                  onRemoveCaregiver={handleRemoveCaregiver}
               />
          </div>
      );
    }

    if (!selectedChildId || !selectedChild) {
      if (parentView === 'manageRewards') {
        return <ManageRewardsPage 
                  rewards={rewards}
                  onAddReward={addReward}
                  onDeleteReward={deleteReward}
                  onBack={() => setParentView('dashboard')}
               />;
      }
      
      return <ParentDashboard 
                  parentProfile={parentProfile} 
                  childProfiles={visibleChildren} 
                  onSelectChild={handleSelectChild} 
                  onAddChild={handleAddChild} 
                  onManageRewards={() => setParentView('manageRewards')}
                  onSwitchToDoctorView={() => setAppMode('doctor')}
                  onSwitchToAdminView={() => { setAppMode('admin'); setAdminView('dashboard'); }}
                  onSwitchToCaregiverView={() => setAppMode('caregiver')}
                  appMode={appMode}
              />;
    }

    return (
      <div className="flex h-screen bg-slate-50 text-slate-800">
        <Sidebar 
          navItems={navItems} 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          childName={selectedChild.name}
          onGoToParentDashboard={goToParentDashboard}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    );
  };

  return (
    <>
      <GlobalNotifications
        appointments={appointments}
        dismissedIds={dismissedReminderIds}
        onDismiss={handleDismissReminder}
      />
      {renderAppContent()}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onProcessCommand={handleProcessVoiceCommand}
      />
      {selectedChild && (
          <SmartwatchView 
            isVisible={isSmartwatchVisible}
            onClose={() => setIsSmartwatchVisible(false)}
            latestReading={childSugarReadings[0]}
            profile={selectedChild}
            onLogInsulin={(units) => addLogAndCheckAwards(LogType.INSULIN, { units, type: 'bolus' })}
          />
      )}
      {appMode === 'parent' && selectedChildId && !isSmartwatchVisible && (
        <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="fixed bottom-6 left-6 z-40 bg-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600 transition-transform hover:scale-110"
            aria-label="افتح المساعد الصوتي"
        >
            <MicIcon className="w-8 h-8"/>
        </button>
      )}
    </>
  );
};

export default App;
