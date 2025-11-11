
export enum LogType {
  SUGAR = 'sugar',
  MEAL = 'meal',
  APPOINTMENT = 'appointment',
  INSULIN = 'insulin',
  EXERCISE = 'exercise',
  SICKNESS = 'sickness',
}

export interface SugarReading {
  id: number;
  childId: number;
  value: number; // Always stored as mg/dL
  date: string;
  notes?: string;
  timeContext: 'before_meal' | 'after_meal' | 'fasting' | 'other' | 'exercise';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  correctionDose?: number;
  hypoTreatment?: string;
}

export interface InsulinLog {
    id: number;
    childId: number;
    date: string;
    units: number;
    type: 'bolus' | 'basal'; // Bolus (rapid-acting), Basal (long-acting)
}

export interface ExerciseLog {
    id: number;
    childId: number;
    date: string;
    activity: string;
    durationMinutes: number;
    intensity: 'low' | 'medium' | 'high';
}

export interface SicknessLog {
    id: number;
    childId: number;
    date: string;
    notes: string;
}

export interface MealLog {
  id: number;
  childId: number;
  description: string;
  carbs: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface Appointment {
  id: number;
  childId: number;
  doctorName: string;
  specialty: string;
  date: string;
  notes: string;
  reminder?: 'none' | '1_hour' | '1_day' | '2_days';
}

export interface ServingOption {
  name: string; // e.g. 'شريحة', 'كوب', '100 جرام'
  grams: number;
}

export type Allergen = 'gluten' | 'nuts' | 'dairy' | 'soy' | 'shellfish' | 'peanuts';
export type Diet = 'low_carb' | 'keto' | 'vegetarian' | 'vegan';


export interface FoodItem {
  id: string;
  name: string;
  imageUrl?: string;
  servingOptions: ServingOption[];
  // Base nutrients per 100g
  carbs: number;
  calories: number;
  fiber: number;
  sodium: number;
  protein: number;
  fat: number;
  glycemicIndex: number;
  allergens?: Allergen[];
  suitableDiets?: Diet[];
}

export interface MealTemplateItem {
  foodId: string;
  quantity: number;
  servingName: string;
}

export interface MealTemplate {
  id: number;
  childId: number;
  name: string;
  items: MealTemplateItem[];
}

export interface AlertSettings {
  hypoAlert: {
    enabled: boolean;
    delayMinutes: 0 | 5 | 15;
  };
  severeHyperAlert: {
    enabled: boolean;
    delayMinutes: 0 | 5 | 15;
  };
}

export interface GrowthRecord {
  date: string;
  weight: number; // in kg
  height: number; // in cm
}

export type DailyLogs = {
    sugar: SugarReading[];
    meal: MealLog[];
    insulin: InsulinLog[];
    exercise: ExerciseLog[];
    sickness: SicknessLog[];
};

export interface Challenge {
    id: string;
    title: string;
    description: string;
    points: number;
    isComplete: (logs: DailyLogs) => boolean;
    getProgress: (logs: DailyLogs) => { current: number; target: number };
}

export interface Badge {
    id: string;
    title: string;
    description: string;
    isComplete: (allLogs: DailyLogs) => boolean;
}

export interface ProactiveInsight {
    id: string;
    message: string;
    type: 'warning' | 'info' | 'success';
}

export interface GlucosePrediction {
    trend: 'rising' | 'falling' | 'stable';
    message: string;
    predictedValues: { time: string, value: number }[];
}

export interface VoiceCommand {
    intent: 'log' | 'query' | 'unknown';
    logType?: 'sugar' | 'insulin'; // Extend as more voice logs are supported
    value?: number; // For sugar reading
    units?: number; // For insulin
    insulinType?: 'bolus' | 'basal';
    query?: string;
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: number; // parentId or doctorId
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: number;
    childId: number;
    participants: {
        parentId: number;
        doctorId: number;
    };
}

export interface CommunityPost {
    id: number;
    authorId: number;
    authorName: string;
    authorAvatarUrl: string;
    title: string;
    content: string;
    timestamp: string;
}

export interface CommunityReply {
    id: number;
    postId: number;
    authorId: number;
    authorName: string;
    authorAvatarUrl: string;
    content: string;
    timestamp: string;
}

export interface Caregiver {
    id: number;
    childId: number;
    name: string;
    email: string;
    permission: 'read' | 'read_write';
}

export interface CarePlan {
    id: number;
    childId: number;
    goals: {
        id: string;
        text: string;
        isCompleted: boolean;
    }[];
    recommendations: {
        id: string;
        text: string;
    }[];
}

export type DashboardWidget = 'stats' | 'insights' | 'forecast' | 'reminders' | 'chart' | 'activity' | 'care_plan';


export interface ChildProfile {
  id: number;
  parentId: number;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  weight: number; // in kg
  height: number; // in cm
  points: number; // New for rewards
  glucoseUnit: 'mg/dL' | 'mmol/L';
  mealTimes: {
    breakfast: string; // "HH:mm"
    lunch: string;     // "HH:mm"
    dinner: string;    // "HH:mm"
  };
  correctionFactor: number;
  carbRatios: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  carbRanges: {
    breakfast: { min: number, max: number };
    lunch: { min: number, max: number };
    dinner: { min: number, max: number };
    snack: { min: number, max: number };
  }
  hypoglycemiaLevel: number;
  severeHypoglycemiaLevel: number;
  hyperglycemiaLevel: number;
  severeHyperglycemiaLevel: number;
  criticalHyperglycemiaLevel: number;
  alertSettings: AlertSettings;
  doctorLinkCode: string | null;
  linkedDoctorId: number | null;
  allergies: Allergen[];
  foodPreferences: {
    preferred: string[]; // array of food item IDs
    disliked: string[];  // array of food item IDs
  };
  diet?: Diet;
  growthLog: GrowthRecord[];
  isActive: boolean;
  earnedBadgeIds: string[];
  completedChallengeIds: string[];
  cgm: 'dexcom' | 'freestyle' | null;
}

export interface ParentProfile {
  id: number;
  name: string;
  avatarUrl: string;
  dashboardLayout: DashboardWidget[];
}

export interface DoctorProfile {
  id: number;
  name: string;
  specialty: string;
  linkCode: string;
}

export interface AwarenessArticle {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  excerpt: string;
}

export interface Reward {
  id: number;
  title: string;
  pointsRequired: number;
  imageUrl: string;
}
