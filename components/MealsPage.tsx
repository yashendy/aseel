
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FoodItem, ChildProfile, MealLog, ServingOption, MealTemplate, LogType, MealTemplateItem } from '../types';
import { MEAL_TYPE_NAMES, MG_DL_PER_MMOL_L } from '../constants';
import { UtensilsIcon, BookmarkIcon, CheckCircleIcon, HeartIcon, ThumbsDownIcon, EyeOffIcon, BanIcon, CameraIcon, SparklesIcon } from './Icons';
import { FoodScanner } from './FoodScanner';
import { suggestMeal } from '../services/geminiService';

type SelectedFoodItem = {
  food: FoodItem;
  quantity: number;
  selectedServingName: string;
  uniqueId: number;
};

interface MealsPageProps {
  profile: ChildProfile;
  addLog: (type: LogType, data: any) => void;
  mealTemplates: MealTemplate[];
  addMealTemplate: (templateData: Omit<MealTemplate, 'id' | 'childId'>) => void;
  childMealLogs: MealLog[];
  foodItems: FoodItem[];
  onAddFoodItem: (item: Omit<FoodItem, 'id'>) => void;
}

const CarbProgressBar: React.FC<{ totalCarbs: number, range: {min: number, max: number} }> = ({ totalCarbs, range }) => {
    if (range.max <= 0) return null;
    
    const percent = Math.min((totalCarbs / range.max) * 100, 100);
    const isOver = totalCarbs > range.max;
    const isUnder = totalCarbs < range.min;
    
    let bgColor = 'bg-green-500'; // In range
    if(isOver) bgColor = 'bg-red-500';
    else if (isUnder && totalCarbs > 0) bgColor = 'bg-amber-500';
    
    return (
        <div className="w-full bg-slate-200 rounded-full h-4 relative overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-500 ${bgColor}`}
                style={{ width: `${percent}%` }}
            />
            <div 
                className="absolute top-0 bottom-0 border-r-2 border-slate-400 border-dashed"
                style={{ left: `${(range.min / range.max) * 100}%` }}
            />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white text-shadow-sm">
                    {totalCarbs.toFixed(0)} / {range.max} جم
                </span>
             </div>
        </div>
    );
};


export const MealsPage: React.FC<MealsPageProps> = ({ profile, addLog, mealTemplates, addMealTemplate, childMealLogs, foodItems, onAddFoodItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<SelectedFoodItem[]>([]);
    const [currentMealType, setCurrentMealType] = useState<MealLog['mealType']>('breakfast');
    const [bloodSugar, setBloodSugar] = useState('');
    const [manualCorrection, setManualCorrection] = useState<number | null>(null);
    const [manualTotalDose, setManualTotalDose] = useState<number | null>(null);
    const [entryUnit, setEntryUnit] = useState<'mg/dL' | 'mmol/L'>(profile.glucoseUnit);
    
    const [showSaveTemplateInput, setShowSaveTemplateInput] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hideDisliked, setHideDisliked] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [isSuggestingMeal, setIsSuggestingMeal] = useState(false);
    const [suggestedMeal, setSuggestedMeal] = useState<MealTemplateItem[] | null>(null);


    const insulinToCarbRatio = profile.carbRatios[currentMealType];
    const carbRange = profile.carbRanges[currentMealType];

    const filteredFoodItems = useMemo(() => {
        const { preferred, disliked } = profile.foodPreferences;

        let items = [...foodItems];

        // 1. Hide disliked if toggled
        if (hideDisliked) {
            items = items.filter(item => !disliked.includes(item.id));
        }

        // 2. Filter by search term
        if (searchTerm) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // 3. Sort by preference
        items.sort((a, b) => {
            const aIsPreferred = preferred.includes(a.id);
            const bIsPreferred = preferred.includes(b.id);
            const aIsDisliked = disliked.includes(a.id);
            const bIsDisliked = disliked.includes(b.id);

            if (aIsPreferred && !bIsPreferred) return -1;
            if (!aIsPreferred && bIsPreferred) return 1;

            if (!hideDisliked) { // Only sort by disliked if they are visible
                if (!aIsDisliked && bIsDisliked) return -1;
                if (aIsDisliked && !bIsDisliked) return 1;
            }
            
            return a.name.localeCompare(b.name, 'ar');
        });
        
        return items;

    }, [searchTerm, foodItems, profile.foodPreferences, hideDisliked]);

    const todaysLogs = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format
        return childMealLogs.filter(log => {
            const logDateStr = new Date(log.date).toLocaleDateString('en-CA');
            return logDateStr === todayStr;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [childMealLogs]);

    const handleAddItem = (item: FoodItem) => {
        setSelectedItems(prev => [...prev, { 
            food: item, 
            quantity: 1, 
            selectedServingName: item.servingOptions[0].name,
            uniqueId: Date.now() 
        }]);
    };

    const handleRemoveItem = (uniqueId: number) => {
        setSelectedItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    };

    const handleQuantityChange = (uniqueId: number, newQuantity: number) => {
        if (newQuantity < 0) return;
        setSelectedItems(prev =>
            prev.map(item => item.uniqueId === uniqueId ? { ...item, quantity: newQuantity } : item)
        );
    };
    
    const handleServingChange = (uniqueId: number, newServingName: string) => {
        setSelectedItems(prev =>
            prev.map(item =>
              item.uniqueId === uniqueId ? { ...item, selectedServingName: newServingName } : item
            )
        );
    };

    const getItemNutrients = useCallback((item: SelectedFoodItem) => {
        const serving = item.food.servingOptions.find(s => s.name === item.selectedServingName);
        if (!serving) return { carbs: 0, calories: 0, protein: 0, fat: 0, sodium: 0, glycemicLoad: 0 };

        const totalGrams = item.quantity * serving.grams;
        const scale = totalGrams / 100;

        const carbs = item.food.carbs * scale;
        const glycemicLoad = (item.food.glycemicIndex * carbs) / 100;

        return {
            carbs,
            calories: item.food.calories * scale,
            protein: item.food.protein * scale,
            fat: item.food.fat * scale,
            sodium: item.food.sodium * scale,
            glycemicLoad,
        };
    }, []);

    const totals = useMemo(() => {
        return selectedItems.reduce(
            (acc, item) => {
                const nutrients = getItemNutrients(item);
                acc.carbs += nutrients.carbs;
                acc.calories += nutrients.calories;
                acc.protein += nutrients.protein;
                acc.fat += nutrients.fat;
                acc.sodium += nutrients.sodium;
                acc.glycemicLoad += nutrients.glycemicLoad;
                return acc;
            },
            { carbs: 0, calories: 0, protein: 0, fat: 0, sodium: 0, glycemicLoad: 0 }
        );
    }, [selectedItems, getItemNutrients]);
    
    const handleAdjustQuantities = () => {
        const targetCarbs = (carbRange.min + carbRange.max) / 2;
        const currentCarbs = totals.carbs;
        if (currentCarbs <= 0) return;

        const ratio = targetCarbs / currentCarbs;

        const newSelectedItems = selectedItems.map(item => {
            const newQuantity = Math.max(0, item.quantity * ratio);
            const roundedQuantity = parseFloat(newQuantity.toFixed(2));
            return { ...item, quantity: roundedQuantity };
        });
        
        setSelectedItems(newSelectedItems);
    };

    // Dose Calculations
    const mealDose = insulinToCarbRatio > 0 ? totals.carbs / insulinToCarbRatio : 0;
    
    const calculatedCorrectionDose = useMemo(() => {
        const bsValue = parseFloat(bloodSugar);
        if(!bsValue) return 0;

        const bsInMgdl = entryUnit === 'mmol/L' ? bsValue * MG_DL_PER_MMOL_L : bsValue;

        if(bsInMgdl <= profile.hyperglycemiaLevel) return 0;
        const dose = (bsInMgdl - profile.hyperglycemiaLevel) / profile.correctionFactor;
        return Math.max(0, dose);
    }, [bloodSugar, entryUnit, profile.hyperglycemiaLevel, profile.correctionFactor]);
    
    const correctionDose = manualCorrection ?? calculatedCorrectionDose;
    const totalDose = mealDose + correctionDose;
    const finalTotalDose = manualTotalDose ?? totalDose;

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleLoadTemplate = (template: MealTemplate) => {
        const newItems: SelectedFoodItem[] = template.items.map(templateItem => {
            const food = foodItems.find(f => f.id === templateItem.foodId);
            if (!food) return null;
            return {
                food,
                quantity: templateItem.quantity,
                selectedServingName: templateItem.servingName,
                uniqueId: Date.now() + Math.random(),
            };
        }).filter((item): item is SelectedFoodItem => item !== null);
        setSelectedItems(newItems);
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName.trim() || selectedItems.length === 0) return;
        
        const templateItems = selectedItems.map(item => ({
            foodId: item.food.id,
            quantity: item.quantity,
            servingName: item.selectedServingName,
        }));

        addMealTemplate({ name: newTemplateName, items: templateItems });
        setNewTemplateName('');
        setShowSaveTemplateInput(false);
        showSuccess(`تم حفظ وجبة "${newTemplateName}" بنجاح!`);
    };

    const handleLogMeal = () => {
        if (selectedItems.length === 0) return;

        const description = selectedItems.map(item => `${item.food.name} (${item.quantity} ${item.selectedServingName})`).join(', ');

        addLog(LogType.MEAL, {
            description,
            carbs: totals.carbs,
            date: new Date().toISOString(),
            mealType: currentMealType,
        });

        setSelectedItems([]);
        setBloodSugar('');
        setManualCorrection(null);
        setManualTotalDose(null);
        showSuccess('تم تسجيل الوجبة في السجل بنجاح!');
    };
    
    const handleSuggestMeal = async () => {
        setIsSuggestingMeal(true);
        setSuggestedMeal(null);
        const meal = await suggestMeal(profile, foodItems, carbRange, MEAL_TYPE_NAMES[currentMealType]);
        setSuggestedMeal(meal);
        setIsSuggestingMeal(false);
    };

    const handleAddSuggestedMeal = () => {
        if (!suggestedMeal) return;
        const newItems: SelectedFoodItem[] = suggestedMeal.map(item => {
            const food = foodItems.find(f => f.id === item.foodId);
            return food ? { food, quantity: item.quantity, selectedServingName: item.servingName, uniqueId: Date.now() + Math.random() } : null;
        }).filter((i): i is SelectedFoodItem => i !== null);

        setSelectedItems(prev => [...prev, ...newItems]);
        setSuggestedMeal(null);
    };

    useEffect(() => {
        setEntryUnit(profile.glucoseUnit);
    }, [profile.glucoseUnit]);


    return (
        <>
            {showScanner && (
                <FoodScanner 
                    onClose={() => setShowScanner(false)} 
                    onAddFoodItem={(item) => {
                        onAddFoodItem(item);
                        setShowScanner(false);
                        showSuccess(`تمت إضافة "${item.name}" للمكتبة بنجاح!`);
                    }} 
                />
            )}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <UtensilsIcon className="w-10 h-10 text-teal-500" />
                    <h1 className="text-3xl font-bold text-slate-800">مساعد الوجبات الذكي</h1>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <span className="text-sm text-slate-500">الطفل:</span>
                        <span className="font-bold text-lg text-slate-800 mr-2">{profile.name}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="meal-type-select" className="text-sm font-medium text-slate-600">نوع الوجبة:</label>
                        <select 
                            id="meal-type-select"
                            value={currentMealType}
                            onChange={(e) => setCurrentMealType(e.target.value as MealLog['mealType'])}
                            className="p-2 border rounded-md bg-slate-50 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                        >
                            {(Object.keys(MEAL_TYPE_NAMES) as Array<keyof typeof MEAL_TYPE_NAMES>).map(key => (
                                <option key={key} value={key}>{MEAL_TYPE_NAMES[key]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500">نطاق الكارب:</span>
                        <span className="font-bold text-lg text-teal-600 mr-2">{carbRange.min} - {carbRange.max} جرام</span>
                    </div>
                </div>

                 {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6" />
                        <p className="font-semibold">{successMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">مكتبة الأصناف</h2>
                                <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 text-sm text-teal-600 font-semibold hover:text-teal-800">
                                    <CameraIcon className="w-5 h-5" />
                                    <span>مسح جديد</span>
                                </button>
                            </div>
                            <input
                                type="search" placeholder="ابحث عن صنف..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 border rounded-md mb-4"
                            />
                             <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <input type="checkbox" id="hide-disliked" checked={hideDisliked} onChange={e => setHideDisliked(e.target.checked)} className="accent-teal-500" />
                                <label htmlFor="hide-disliked" className="flex items-center gap-1 cursor-pointer"><EyeOffIcon className="w-4 h-4" /> إخفاء الأصناف غير المفضلة</label>
                            </div>
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                                {filteredFoodItems.map(item => {
                                    const isPreferred = profile.foodPreferences.preferred.includes(item.id);
                                    const isDisliked = profile.foodPreferences.disliked.includes(item.id);
                                    const hasAllergy = item.allergens?.some(allergen => profile.allergies.includes(allergen)) ?? false;
                                    return (
                                    <li key={item.id} className={`flex justify-between items-center p-2 rounded-lg ${isDisliked ? 'opacity-60' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />}
                                            <div>
                                                <p className="font-semibold flex items-center gap-1.5">
                                                    {hasAllergy && <BanIcon className="w-4 h-4 text-red-500" title="يحتوي على مسبب حساسية"/>}
                                                    {item.name}
                                                    {isPreferred && <HeartIcon className="w-3 h-3 text-red-500 fill-current" />}
                                                    {isDisliked && <ThumbsDownIcon className="w-3 h-3 text-slate-500" />}
                                                </p>
                                                <p className="text-xs text-slate-500">{item.servingOptions[0].grams} جم لكل {item.servingOptions[0].name} ({item.carbs} جم كارب لكل 100 جم)</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAddItem(item)} className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-teal-600 transition text-xl font-bold flex-shrink-0">+</button>
                                    </li>
                                    )
                                })}
                            </ul>
                        </div>
                         <div>
                            <h2 className="text-xl font-bold mb-4">الوجبات الجاهزة</h2>
                            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                                {mealTemplates.length > 0 ? mealTemplates.map(template => (
                                    <li key={template.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                        <p className="font-semibold">{template.name}</p>
                                        <button onClick={() => handleLoadTemplate(template)} className="px-3 py-1 text-sm bg-sky-500 text-white rounded-md hover:bg-sky-600 transition">تحميل</button>
                                    </li>
                                )) : <p className="text-slate-500 text-sm">لم يتم حفظ أي وجبات جاهزة بعد.</p>}
                            </ul>
                        </div>
                         <div className="mt-6">
                            <h2 className="text-xl font-bold mb-4">وجبات اليوم المسجلة</h2>
                            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                                {todaysLogs.length > 0 ? (
                                    todaysLogs.map(log => (
                                        <li key={log.id} className="p-2 bg-slate-50 rounded-lg text-sm">
                                            <p className="font-semibold text-teal-700">{MEAL_TYPE_NAMES[log.mealType]}</p>
                                            <p className="text-xs text-slate-600 truncate" title={log.description}>{log.description}</p>
                                            <p className="text-xs text-slate-500 font-bold">{log.carbs.toFixed(1)} جم كارب</p>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm">لم يتم تسجيل أي وجبات اليوم.</p>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                 <h2 className="text-xl font-bold">تفاصيل الوجبة الحالية</h2>
                                 <button onClick={handleSuggestMeal} disabled={isSuggestingMeal} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm font-semibold disabled:bg-slate-300">
                                     <SparklesIcon className="w-4 h-4"/>
                                     <span>{isSuggestingMeal ? 'جاري الاقتراح...' : 'اقترح وجبة'}</span>
                                </button>
                            </div>

                             {suggestedMeal && (
                                <div className="p-4 bg-indigo-50 rounded-lg mb-4">
                                    <h3 className="font-bold text-indigo-800">وجبة مقترحة من المساعد الذكي:</h3>
                                    <ul className="list-disc list-inside text-sm text-slate-700 mt-2">
                                        {suggestedMeal.map(item => {
                                            const food = foodItems.find(f => f.id === item.foodId);
                                            return <li key={item.foodId}>{food?.name} ({item.quantity} {item.servingName})</li>;
                                        })}
                                    </ul>
                                    <button onClick={handleAddSuggestedMeal} className="mt-3 bg-indigo-500 text-white px-3 py-1 rounded-md text-sm font-semibold">إضافة الوجبة المقترحة</button>
                                </div>
                             )}

                             <div className="mb-4">
                                <CarbProgressBar totalCarbs={totals.carbs} range={carbRange} />
                             </div>
                             {selectedItems.length === 0 ? (
                                 <p className="text-slate-500 text-center py-8">اختر الأصناف من المكتبة أو دع المساعد الذكي يقترح عليك وجبة.</p>
                             ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="border-b text-slate-500">
                                            <tr>
                                                <th className="p-2 font-medium">الصنف</th>
                                                <th className="p-2 font-medium">الكمية</th>
                                                <th className="p-2 font-medium">الوحدة</th>
                                                <th className="p-2 font-medium">الكارب (جم)</th>
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedItems.map(item => {
                                                const nutrients = getItemNutrients(item);
                                                return (
                                                    <tr key={item.uniqueId} className="border-b">
                                                        <td className="p-2 font-semibold">
                                                            <div className="flex items-center gap-3">
                                                                {item.food.imageUrl && <img src={item.food.imageUrl} alt={item.food.name} className="w-10 h-10 rounded-md object-cover" />}
                                                                <span>{item.food.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <input type="number" value={item.quantity}
                                                                onChange={e => handleQuantityChange(item.uniqueId, parseFloat(e.target.value) || 0)}
                                                                className="w-20 p-1 border rounded-md text-center" step="0.25"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <select value={item.selectedServingName} 
                                                                    onChange={(e) => handleServingChange(item.uniqueId, e.target.value)}
                                                                    className="w-24 p-1 border rounded-md bg-white">
                                                                {item.food.servingOptions.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="p-2">{nutrients.carbs.toFixed(1)}</td>
                                                        <td className="p-2 text-center">
                                                            <button onClick={() => handleRemoveItem(item.uniqueId)} className="text-red-500 hover:text-red-700 font-bold text-lg">×</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="font-bold text-base">
                                            <tr className="border-t-2">
                                                <td className="p-2" colSpan={3}>الإجمالي</td>
                                                <td className="p-2 text-teal-600">{totals.carbs.toFixed(1)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <div className="mt-4 pt-4 border-t">
                                        {showSaveTemplateInput ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    value={newTemplateName}
                                                    onChange={e => setNewTemplateName(e.target.value)}
                                                    placeholder="اسم الوجبة الجاهزة..."
                                                    className="flex-grow p-2 border rounded-md"
                                                />
                                                <button onClick={handleSaveTemplate} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold">حفظ</button>
                                                <button onClick={() => setShowSaveTemplateInput(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm">إلغاء</button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center flex-wrap gap-2">
                                                 <button
                                                    onClick={() => setShowSaveTemplateInput(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-semibold disabled:bg-slate-300"
                                                    disabled={selectedItems.length === 0}
                                                >
                                                    <BookmarkIcon className="w-4 h-4" />
                                                    <span>حفظ كوجبة جاهزة</span>
                                                </button>
                                                <button
                                                    onClick={handleAdjustQuantities}
                                                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition text-sm font-semibold disabled:bg-slate-300"
                                                    disabled={selectedItems.length === 0 || totals.carbs <= 0}
                                                >
                                                    تعديل الكميات لتناسب نطاق الكارب
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h2 className="text-xl font-bold mb-4">حساب الجرعة النهائية</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                 <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">مجموع الكارب</label>
                                    <p className="p-2 border rounded-md bg-slate-100 font-bold">{totals.carbs.toFixed(1)} جم</p>
                                 </div>
                                 <div>
                                    <label htmlFor="blood-sugar" className="block text-sm font-medium text-slate-600 mb-1">القياس</label>
                                    <div className="flex">
                                        <input 
                                            id="blood-sugar" 
                                            type="number" 
                                            value={bloodSugar} 
                                            onChange={e => setBloodSugar(e.target.value)} 
                                            className="w-full p-2 border border-r-0 rounded-l-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition" 
                                            step={entryUnit === 'mmol/L' ? '0.1' : '1'}
                                        />
                                        <select
                                            value={entryUnit}
                                            onChange={(e) => setEntryUnit(e.target.value as 'mg/dL' | 'mmol/L')}
                                            className="cursor-pointer appearance-none text-center pl-2 pr-8 py-2 border rounded-r-md bg-slate-50 text-slate-500 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                                            aria-label="وحدة القياس"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundPosition: 'right 0.5rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.5em 1.5em',
                                            }}
                                        >
                                            <option value="mg/dL">mg/dL</option>
                                            <option value="mmol/L">mmol/L</option>
                                        </select>
                                    </div>
                                 </div>
                                <div>
                                    <label htmlFor="correction-dose" className="block text-sm font-medium text-slate-600 mb-1">التصحيحي</label>
                                    <input id="correction-dose" type="number" 
                                           value={manualCorrection === null ? calculatedCorrectionDose.toFixed(2) : manualCorrection}
                                           onChange={e => setManualCorrection(parseFloat(e.target.value))}
                                           className="w-full p-2 border rounded-md" />
                                </div>
                                 <div className="lg:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center bg-teal-50 p-4 rounded-lg">
                                    <div className="text-center lg:text-right">
                                        <p className="text-sm text-teal-800">الجرعة الإجمالية المقترحة</p>
                                        <p className="text-xs text-slate-500">
                                            ({mealDose.toFixed(1)} للكارب + {correctionDose.toFixed(1)} للتصحيح)
                                        </p>
                                    </div>
                                    <div className="text-center lg:text-left">
                                          <input type="number"
                                               value={finalTotalDose.toFixed(2)}
                                               onChange={e => setManualTotalDose(parseFloat(e.target.value))}
                                               className="text-3xl font-bold text-teal-600 bg-transparent border-b-2 border-teal-300 focus:outline-none focus:border-teal-500 w-32 text-center"
                                         />
                                        <span className="text-lg text-teal-800 mr-1">وحدة</span>
                                    </div>
                                 </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleLogMeal}
                                    className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-slate-400"
                                    disabled={selectedItems.length === 0}
                                >
                                    تسجيل الوجبة وحفظها في السجل
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};