
import { SugarReading, MealLog, Appointment, FoodItem, ChildProfile, ParentProfile, MealTemplate, AwarenessArticle, Reward, DoctorProfile, Allergen, Diet, InsulinLog, ExerciseLog, SicknessLog, Challenge, Badge, DailyLogs, Conversation, Message, CommunityPost, CommunityReply, Caregiver, CarePlan } from './types';

export const MG_DL_PER_MMOL_L = 18.0182;

export const ALLERGENS: Allergen[] = ['peanuts', 'gluten', 'dairy', 'nuts', 'soy', 'shellfish'];
export const ALLERGEN_NAMES: Record<Allergen, string> = {
    peanuts: 'فول سوداني',
    gluten: 'جلوتين',
    dairy: 'منتجات ألبان',
    nuts: 'مكسرات',
    soy: 'صويا',
    shellfish: 'محار',
};

export const DIETS: Diet[] = ['low_carb', 'keto', 'vegetarian'];
export const DIET_NAMES: Record<Diet, string> = {
    low_carb: 'قليل الكربوهيدرات',
    keto: 'كيتو',
    vegetarian: 'نباتي',
    vegan: 'نباتي صرف',
};


export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const DUMMY_PARENT_PROFILE: ParentProfile = {
    id: 101,
    name: "علي",
    avatarUrl: "https://i.pravatar.cc/150?u=parent101",
    dashboardLayout: ['stats', 'insights', 'chart', 'activity', 'care_plan', 'forecast', 'reminders']
};

export const DUMMY_DOCTOR_PROFILES: DoctorProfile[] = [
    {
        id: 201,
        name: "د. إبراهيم خالد",
        specialty: "استشاري غدد صماء وسكري أطفال",
        linkCode: "DOC-IK-12345"
    }
];

export const DUMMY_CHILD_PROFILES: ChildProfile[] = [
    {
        id: 1,
        parentId: 101,
        name: 'أحمد',
        dateOfBirth: '2016-05-15',
        weight: 25,
        height: 125,
        points: 275,
        glucoseUnit: 'mg/dL',
        mealTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' },
        correctionFactor: 50,
        carbRatios: { breakfast: 15, lunch: 10, dinner: 12, snack: 20 },
        carbRanges: { breakfast: { min: 30, max: 45 }, lunch: { min: 50, max: 70 }, dinner: { min: 40, max: 60 }, snack: { min: 15, max: 25 }},
        hypoglycemiaLevel: 70, severeHypoglycemiaLevel: 54, hyperglycemiaLevel: 180, severeHyperglycemiaLevel: 250, criticalHyperglycemiaLevel: 400,
        alertSettings: {
            hypoAlert: { enabled: true, delayMinutes: 5 },
            severeHyperAlert: { enabled: false, delayMinutes: 15 },
        },
        doctorLinkCode: 'DOC-IK-12345',
        linkedDoctorId: 201,
        allergies: ['peanuts'],
        foodPreferences: { preferred: ['1'], disliked: ['2'] }, // Prefers apple, dislikes white bread
        diet: 'low_carb',
        growthLog: [
            { date: '2023-01-10T10:00:00Z', weight: 22, height: 120 },
            { date: '2023-07-15T10:00:00Z', weight: 24, height: 123 },
            { date: new Date().toISOString(), weight: 25, height: 125 },
        ],
        isActive: true,
        earnedBadgeIds: ['first_reading', 'ten_meals'],
        completedChallengeIds: [],
        cgm: 'dexcom',
    },
    {
        id: 2,
        parentId: 101,
        name: 'فاطمة',
        dateOfBirth: '2018-10-20',
        weight: 20,
        height: 110,
        points: 120,
        glucoseUnit: 'mmol/L',
        mealTimes: { breakfast: '07:30', lunch: '12:30', dinner: '18:30' },
        correctionFactor: 3, // Corresponds to ~54 mg/dL
        carbRatios: { breakfast: 20, lunch: 15, dinner: 18, snack: 25 },
        carbRanges: { breakfast: { min: 25, max: 40 }, lunch: { min: 40, max: 60 }, dinner: { min: 35, max: 50 }, snack: { min: 10, max: 20 }},
        hypoglycemiaLevel: 70, severeHypoglycemiaLevel: 54, hyperglycemiaLevel: 180, severeHyperglycemiaLevel: 250, criticalHyperglycemiaLevel: 400,
        alertSettings: {
            hypoAlert: { enabled: false, delayMinutes: 5 },
            severeHyperAlert: { enabled: false, delayMinutes: 15 },
        },
        doctorLinkCode: null,
        linkedDoctorId: null,
        allergies: [],
        foodPreferences: { preferred: ['4'], disliked: [] }, // Prefers chicken
        growthLog: [
             { date: '2023-05-20T10:00:00Z', weight: 18, height: 105 },
             { date: new Date().toISOString(), weight: 20, height: 110 },
        ],
        isActive: true,
        earnedBadgeIds: [],
        completedChallengeIds: [],
        cgm: null,
    }
];

export const EMPTY_PROFILE_DEFAULTS: ChildProfile = {
  id: 0, // 0 indicates a new profile
  parentId: DUMMY_PARENT_PROFILE.id,
  name: '',
  dateOfBirth: '',
  weight: 0,
  height: 0,
  points: 0,
  glucoseUnit: 'mg/dL',
  mealTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' },
  correctionFactor: 50,
  carbRatios: { breakfast: 15, lunch: 10, dinner: 12, snack: 20 },
  carbRanges: { breakfast: { min: 30, max: 45 }, lunch: { min: 50, max: 70 }, dinner: { min: 40, max: 60 }, snack: { min: 15, max: 25 }},
  hypoglycemiaLevel: 70, severeHypoglycemiaLevel: 54, hyperglycemiaLevel: 180, severeHyperglycemiaLevel: 250, criticalHyperglycemiaLevel: 400,
  alertSettings: {
      hypoAlert: { enabled: false, delayMinutes: 5 },
      severeHyperAlert: { enabled: false, delayMinutes: 15 },
  },
  doctorLinkCode: null,
  linkedDoctorId: null,
  allergies: [],
  foodPreferences: { preferred: [], disliked: [] },
  diet: undefined,
  growthLog: [],
  isActive: true,
  earnedBadgeIds: [],
  completedChallengeIds: [],
  cgm: null,
};

export const DUMMY_SUGAR_READINGS: SugarReading[] = [
  { id: 1, childId: 1, value: 110, date: new Date(new Date().setHours(new Date().getHours() - 10)).toISOString(), timeContext: 'before_meal', mealType: 'breakfast' },
  { id: 2, childId: 1, value: 160, date: new Date(new Date().setHours(new Date().getHours() - 8)).toISOString(), timeContext: 'after_meal', mealType: 'breakfast' },
  { id: 3, childId: 1, value: 95, date: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(), timeContext: 'before_meal', mealType: 'lunch' },
  { id: 4, childId: 2, value: 12.2, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), timeContext: 'after_meal', mealType: 'lunch', correctionDose: 0.5 },
  { id: 5, childId: 2, value: 3.5, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), timeContext: 'other', hypoTreatment: 'عصير برتقال' },
  { id: 6, childId: 1, value: 130, date: new Date(new Date().setHours(new Date().getHours() - 24)).toISOString(), timeContext: 'fasting' },
];

export const DUMMY_MEALS: MealLog[] = [
  { id: 1, childId: 1, description: 'شوفان بالحليب والفواكه', carbs: 45, date: new Date(new Date().setHours(new Date().getHours() - 9)).toISOString(), mealType: 'breakfast' },
  { id: 2, childId: 1, description: 'دجاج مشوي مع أرز وسلطة', carbs: 60, date: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(), mealType: 'lunch' },
  { id: 3, childId: 2, description: 'زبادي يوناني وتفاحة', carbs: 20, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), mealType: 'snack' },
];

export const DUMMY_APPOINTMENTS: Appointment[] = [
  { id: 1, childId: 1, doctorName: 'د. محمد علي', specialty: 'استشاري غدد صماء', date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), notes: 'متابعة دورية كل 3 أشهر', reminder: '2_days' },
  { id: 2, childId: 2, doctorName: 'د. سارة محمود', specialty: 'أخصائية تغذية', date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(), notes: 'مراجعة الخطة الغذائية', reminder: '1_day' },
];

export const DUMMY_INSULIN_LOGS: InsulinLog[] = [
    { id: 1, childId: 1, date: new Date(new Date().setHours(new Date().getHours() - 10)).toISOString(), units: 3, type: 'bolus'},
    { id: 2, childId: 1, date: new Date(new Date().setHours(new Date().getHours() - 22)).toISOString(), units: 8, type: 'basal'},
];

export const DUMMY_EXERCISE_LOGS: ExerciseLog[] = [
    { id: 1, childId: 1, date: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), activity: 'لعب كرة القدم', durationMinutes: 60, intensity: 'high' },
];

export const DUMMY_SICKNESS_LOGS: SicknessLog[] = [];

export const DUMMY_CAREGIVERS: Caregiver[] = [
    { id: 1, childId: 1, name: 'جدة فاطمة', email: 'grandma@example.com', permission: 'read' },
    { id: 2, childId: 1, name: 'ممرضة المدرسة', email: 'nurse@school.com', permission: 'read_write' },
];

export const DUMMY_CARE_PLANS: CarePlan[] = [
    {
        id: 1,
        childId: 1,
        goals: [
            { id: 'g1', text: 'زيادة نسبة الوقت في النطاق (TIR) إلى 70%', isCompleted: false },
            { id: 'g2', text: 'تقليل نوبات الهبوط الحاد (أقل من 54) إلى أقل من مرة أسبوعيًا', isCompleted: true },
        ],
        recommendations: [
            { id: 'r1', text: 'مراجعة معامل الكربوهيدرات لوجبة الغداء، يبدو أنه يحتاج إلى تعديل طفيف.'},
            { id: 'r2', text: 'التأكد من قياس السكر قبل أي نشاط رياضي عالي الشدة.' },
        ],
    }
];


export const DUMMY_FOOD_ITEMS: FoodItem[] = [
  { id: '1', name: 'تفاح', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80', servingOptions: [{ name: 'حبة متوسطة', grams: 180 }], carbs: 14, calories: 52, fiber: 2.4, sodium: 1, protein: 0.3, fat: 0.2, glycemicIndex: 36, allergens: [], suitableDiets: ['low_carb', 'vegetarian'] },
  { id: '2', name: 'خبز أبيض', imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80', servingOptions: [{ name: 'شريحة', grams: 25 }], carbs: 49, calories: 265, fiber: 2.7, sodium: 491, protein: 9, fat: 3.2, glycemicIndex: 75, allergens: ['gluten'], suitableDiets: [] },
  { id: '3', name: 'أرز أبيض مطبوخ', imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80', servingOptions: [{ name: 'كوب', grams: 160 }], carbs: 28, calories: 130, fiber: 0.4, sodium: 1, protein: 2.7, fat: 0.3, glycemicIndex: 73, allergens: ['gluten'], suitableDiets: [] },
  { id: '4', name: 'صدر دجاج مشوي', imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c7373058?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80', servingOptions: [{ name: '100 جرام', grams: 100 }], carbs: 0, calories: 165, fiber: 0, sodium: 74, protein: 31, fat: 3.6, glycemicIndex: 0, allergens: [], suitableDiets: ['low_carb', 'keto'] },
  { id: '5', name: 'حليب كامل الدسم', imageUrl: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80', servingOptions: [{ name: 'كوب', grams: 244 }], carbs: 5, calories: 61, fiber: 0, sodium: 43, protein: 3.3, fat: 3.3, glycemicIndex: 39, allergens: ['dairy'], suitableDiets: ['low_carb', 'vegetarian'] },
];

export const DUMMY_MEAL_TEMPLATES: MealTemplate[] = [
    {
        id: 1,
        childId: 1,
        name: 'فطور أحمد المعتاد',
        items: [
            { foodId: '2', quantity: 2, servingName: 'شريحة' },
            { foodId: '5', quantity: 1, servingName: 'كوب' },
        ]
    },
    {
        id: 2,
        childId: 1,
        name: 'غداء صحي',
        items: [
            { foodId: '4', quantity: 1.5, servingName: '100 جرام' },
            { foodId: '3', quantity: 1, servingName: 'كوب' },
        ]
    }
];


export const DUMMY_AWARENESS_ARTICLES: AwarenessArticle[] = [
    {
        id: 1,
        title: "فهم الكربوهيدرات: ليست كلها متشابهة!",
        category: "تغذية",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        excerpt: "الكربوهيدرات هي المصدر الرئيسي للطاقة، ولكن اختيار النوع المناسب يمكن أن يحدث فرقًا كبيرًا في استقرار مستويات السكر."
    },
    {
        id: 2,
        title: "الرياضة والمرح: كيف تجعل طفلك نشيطًا؟",
        category: "نمط حياة",
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        excerpt: "النشاط البدني ليس مجرد تمرين، بل هو جزء أساسي من خطة إدارة السكري. اكتشف طرقًا ممتعة لتحفيز طفلك."
    },
    {
        id: 3,
        title: "كيف تتعامل مع هبوط السكر بهدوء؟",
        category: "نصائح طبية",
        imageUrl: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        excerpt: "هبوط السكر قد يكون مخيفًا، ولكن الاستعداد المسبق ومعرفة الخطوات الصحيحة يمكن أن يجعله موقفًا يمكن السيطرة عليه."
    },
    {
        id: 4,
        title: "قراءة الملصقات الغذائية: دليلك السريع",
        category: "تغذية",
        imageUrl: "https://images.unsplash.com/photo-1555992336-fb0d29498b13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        excerpt: "تعلم كيفية قراءة ملصقات الأطعمة بسرعة وفعالية لاتخاذ قرارات أفضل عند التسوق وإعداد الوجبات."
    }
];

export const DUMMY_REWARDS: Reward[] = [
    { id: 1, title: 'شراء لعبة جديدة', pointsRequired: 250, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 2, title: 'يوم مفتوح للعب', pointsRequired: 150, imageUrl: 'https://images.unsplash.com/photo-1546422401-68b415a78732?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 3, title: 'اختيار فيلم السهرة', pointsRequired: 100, imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 4, title: 'زيارة مدينة الملاهي', pointsRequired: 500, imageUrl: 'https://images.unsplash.com/photo-1552342893-67b5b1501867?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
];

export const DUMMY_CHALLENGES: Challenge[] = [
    {
        id: 'log_3_meals',
        title: 'مسجل الوجبات',
        description: 'سجل 3 وجبات اليوم (فطور، غداء، عشاء)',
        points: 15,
        isComplete: (logs: DailyLogs) => {
            const mealTypes = new Set(logs.meal.map(l => l.mealType));
            return mealTypes.has('breakfast') && mealTypes.has('lunch') && mealTypes.has('dinner');
        },
        getProgress: (logs: DailyLogs) => {
            const mealTypes = new Set(logs.meal.map(l => l.mealType));
            return { current: mealTypes.size, target: 3 };
        }
    },
    {
        id: 'log_5_readings',
        title: 'المراقب الدقيق',
        description: 'سجل 5 قراءات سكر على الأقل اليوم',
        points: 10,
        isComplete: (logs: DailyLogs) => logs.sugar.length >= 5,
        getProgress: (logs: DailyLogs) => ({ current: logs.sugar.length, target: 5 }),
    },
    {
        id: 'log_exercise',
        title: 'الرياضي النشيط',
        description: 'سجل نشاطًا رياضيًا واحدًا على الأقل',
        points: 20,
        isComplete: (logs: DailyLogs) => logs.exercise.length >= 1,
        getProgress: (logs: DailyLogs) => ({ current: logs.exercise.length, target: 1 }),
    },
];

export const DUMMY_BADGES: Badge[] = [
    {
        id: 'first_reading',
        title: 'الخطوة الأولى',
        description: 'تسجيل أول قراءة سكر في المنصة',
        isComplete: (allLogs: DailyLogs) => allLogs.sugar.length >= 1,
    },
    {
        id: 'ten_meals',
        title: 'خبير التغذية',
        description: 'تسجيل 10 وجبات مختلفة',
        isComplete: (allLogs: DailyLogs) => allLogs.meal.length >= 10,
    },
    {
        id: 'perfect_day',
        title: 'يوم مثالي',
        description: 'الحفاظ على جميع قراءات السكر في النطاق ليوم كامل (5 قراءات على الأقل)',
        isComplete: (allLogs: DailyLogs) => {
            // This is a simplified check for demo. A real app would group by day.
            const todayStr = new Date().toISOString().split('T')[0];
            const todaysReadings = allLogs.sugar.filter(r => r.date.startsWith(todayStr));
            if (todaysReadings.length < 5) return false;
            // A bit of a hack here: we need the profile to check range, which we don't have.
            // We'll assume a standard range for this check.
            return todaysReadings.every(r => r.value >= 70 && r.value <= 180);
        }
    },
    {
        id: 'week_streak',
        title: 'مواظبة أسبوعية',
        description: 'تسجيل قراءة واحدة على الأقل يوميًا لمدة 7 أيام متتالية',
        isComplete: (allLogs: DailyLogs) => {
             const dates = new Set(allLogs.sugar.map(r => r.date.split('T')[0]));
             if(dates.size < 7) return false;
             // More complex logic needed here for a real implementation
             return true;
        }
    }
];

export const DUMMY_CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        childId: 1,
        participants: { parentId: 101, doctorId: 201 },
    }
];

export const DUMMY_MESSAGES: Message[] = [
    { id: 1, conversationId: 1, senderId: 201, text: 'مرحباً، كيف حال أحمد اليوم؟ لاحظت بعض الارتفاعات بعد وجبة الغداء. هل هناك أي تغييرات في نظامه الغذائي؟', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 2, conversationId: 1, senderId: 101, text: 'أهلاً دكتور، نعم لقد أضفنا نوعًا جديدًا من الخبز. سأكون أكثر انتباهًا للكمية.', timestamp: new Date(new Date().getTime() - 1000 * 60 * 55 * 1).toISOString() },
];

export const DUMMY_COMMUNITY_POSTS: CommunityPost[] = [
    {
        id: 1,
        authorId: 101,
        authorName: "علي",
        authorAvatarUrl: "https://i.pravatar.cc/150?u=parent101",
        title: "نصائح للتعامل مع ارتفاع السكر بعد وجبة الفطور",
        content: "مرحباً جميعاً، ابني أحمد (8 سنوات) يعاني دائماً من ارتفاع في سكر الدم بعد وجبة الفطور، حتى مع حساب الكربوهيدرات بدقة. جربنا الشوفان والخبز الأسمر. هل لدى أحدكم أي أفكار أو وجبات فطور بديلة نجحت معكم؟",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
    {
        id: 2,
        authorId: 102,
        authorName: "سارة",
        authorAvatarUrl: "https://i.pravatar.cc/150?u=parent102",
        title: "أفضل الأنشطة الرياضية للأطفال الصغار؟",
        content: "ابنتي فاطمة (6 سنوات) ليست من محبي الرياضات التقليدية. أبحث عن أفكار لأنشطة ممتعة ومرحة تساعد على تنظيم سكر الدم ولا تشعرها بأنها 'تمرين'. ماذا تفعلون مع أطفالكم؟",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString(),
    }
];

export const DUMMY_COMMUNITY_REPLIES: CommunityReply[] = [
    {
        id: 1,
        postId: 1,
        authorId: 103,
        authorName: "محمد",
        authorAvatarUrl: "https://i.pravatar.cc/150?u=parent103",
        content: "أهلاً علي، واجهت نفس المشكلة. ما ساعدنا هو إضافة مصدر بروتين ودهون صحية للفطور مثل البيض أو الأفوكادو. هذا يبطئ امتصاص الكربوهيدرات. جرب نصف شريحة توست أسمر مع بيضة وأفوكادو.",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 20)).toISOString(),
    },
    {
        id: 2,
        postId: 1,
        authorId: 104,
        authorName: "هند",
        authorAvatarUrl: "https://i.pravatar.cc/150?u=parent104",
        content: "نقطة أخرى مهمة هي توقيت الجرعة. استشر طبيبك حول إعطاء جرعة الأنسولين قبل 15-20 دقيقة من بدء الأكل، قد يحدث فرقاً كبيراً.",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 18)).toISOString(),
    },
    {
        id: 3,
        postId: 2,
        authorId: 101,
        authorName: "علي",
        authorAvatarUrl: "https://i.pravatar.cc/150?u=parent101",
        content: "مرحباً سارة، الألعاب الحركية مثل 'البحث عن الكنز' في الحديقة، أو الرقص على أغانيها المفضلة، أو حتى سباق صغير من غرفة لغرفة. كلها طرق رائعة للحركة بدون أن تشعر بأنها واجب.",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(),
    }
];


export const MEAL_TYPE_NAMES: Record<MealLog['mealType'], string> = {
  breakfast: 'فطور',
  lunch: 'غداء',
  dinner: 'عشاء',
  snack: 'وجبة خفيفة',
};

// FIX: Added missing constants for AuthPage component.
export const HERO_IMAGE_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
export const LOGO_IMAGE_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';