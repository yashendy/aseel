
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChildProfile, AlertSettings, DoctorProfile, FoodItem, Allergen, Diet, GrowthRecord, Caregiver } from '../types';
import { ChildIcon, AlertTriangleIcon, BanIcon, HeartIcon, ThumbsDownIcon, LeafIcon, TrashIcon, UsersIcon } from './Icons';
import { MG_DL_PER_MMOL_L, calculateAge, ALLERGENS, ALLERGEN_NAMES, DIETS, DIET_NAMES } from '../constants';

interface ProfilePageProps {
  profile: ChildProfile; 
  onSave: (profile: ChildProfile) => void;
  onCancel: () => void;
  doctors: DoctorProfile[];
  onLinkDoctor: (childId: number, doctorCode: string) => boolean;
  onUnlinkDoctor: (childId: number) => void;
  foodItems: FoodItem[];
  onAddGrowthRecord: (childId: number, record: GrowthRecord) => void;
  onDeleteGrowthRecord: (childId: number, recordDate: string) => void;
  caregivers: Caregiver[];
  onAddCaregiver: (childId: number, name: string, email: string, permission: 'read' | 'read_write') => void;
  onRemoveCaregiver: (caregiverId: number) => void;
}

const toDateInputString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onSave, onCancel, doctors, onLinkDoctor, onUnlinkDoctor, foodItems, onAddGrowthRecord, onDeleteGrowthRecord, caregivers, onAddCaregiver, onRemoveCaregiver }) => {
  const [formData, setFormData] = useState<ChildProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [doctorCode, setDoctorCode] = useState('');
  const [newRecord, setNewRecord] = useState({ date: toDateInputString(new Date()), weight: '', height: '' });
  const [newCaregiver, setNewCaregiver] = useState({ name: '', email: '', permission: 'read' as 'read' | 'read_write' });


  const isNewProfile = profile.id === 0;

  useEffect(() => {
    setFormData(profile);
  }, [profile]);
  
  const linkedDoctor = useMemo(() => {
    return doctors.find(d => d.id === formData.linkedDoctorId);
  }, [formData.linkedDoctorId, doctors]);
  
  const handleLink = () => {
    if (!doctorCode.trim()) return;
    const success = onLinkDoctor(formData.id, doctorCode);
    if (success) {
      setDoctorCode('');
      // The parent component (App.tsx) will update the profile, which will re-render this component
    } else {
      alert('كود الطبيب غير صحيح. يرجى التحقق منه والمحاولة مرة أخرى.');
    }
  };

  const handleUnlink = () => {
    if (window.confirm(`هل أنت متأكد من إلغاء ربط ملف ${formData.name} بالطبيب ${linkedDoctor?.name}؟`)) {
      onUnlinkDoctor(formData.id);
    }
  };

  const handleAddCaregiver = (e: React.FormEvent) => {
      e.preventDefault();
      if(newCaregiver.name && newCaregiver.email) {
          onAddCaregiver(formData.id, newCaregiver.name, newCaregiver.email, newCaregiver.permission);
          setNewCaregiver({ name: '', email: '', permission: 'read' });
      }
  };

  const handleRemoveCaregiverClick = (caregiver: Caregiver) => {
    if (window.confirm(`هل أنت متأكد من حذف مقدم الرعاية "${caregiver.name}"؟`)) {
        onRemoveCaregiver(caregiver.id);
    }
  };

  const toUserUnit = useCallback((valueInMgdl: number) => {
    if (formData.glucoseUnit === 'mmol/L') {
        return (valueInMgdl / MG_DL_PER_MMOL_L);
    }
    return valueInMgdl;
  }, [formData.glucoseUnit]);

  const toMgdl = useCallback((valueInUserUnit: number) => {
    if (formData.glucoseUnit === 'mmol/L') {
        return (valueInUserUnit * MG_DL_PER_MMOL_L);
    }
    return valueInUserUnit;
  }, [formData.glucoseUnit]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, glucoseUnit: e.target.value as 'mg/dL' | 'mmol/L' }));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isGlucoseField = [
        'correctionFactor', 'hypoglycemiaLevel', 'severeHypoglycemiaLevel', 
        'hyperglycemiaLevel', 'severeHyperglycemiaLevel', 'criticalHyperglycemiaLevel'
    ].includes(name);

    let finalValue: string | number = value;
    if('type' in e.target && e.target.type === 'number') {
        const numValue = parseFloat(value) || 0;
        finalValue = isGlucoseField ? toMgdl(numValue) : numValue;
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleCarbRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        carbRatios: {
            ...prev.carbRatios,
            [name]: parseFloat(value) || 0,
        }
    }));
  };

  const handleMealTimeChange = (meal: keyof ChildProfile['mealTimes'], value: string) => {
    setFormData(prev => ({
      ...prev,
      mealTimes: {
        ...prev.mealTimes,
        [meal]: value,
      },
    }));
  };

  const handleCarbRangeChange = (meal: keyof ChildProfile['carbRanges'], field: 'min' | 'max', value: string) => {
    setFormData(prev => ({
      ...prev,
      carbRanges: {
        ...prev.carbRanges,
        [meal]: {
          ...prev.carbRanges[meal],
          [field]: parseInt(value, 10) || 0,
        },
      },
    }));
  };

  const handleAlertChange = (
      alertType: keyof AlertSettings,
      field: 'enabled' | 'delayMinutes',
      value: boolean | number
  ) => {
      setFormData(prev => ({
          ...prev,
          alertSettings: {
              ...prev.alertSettings,
              [alertType]: {
                  ...prev.alertSettings[alertType],
                  [field]: value
              }
          }
      }));
  };

  const handleAllergyChange = (allergen: Allergen, checked: boolean) => {
      setFormData(prev => {
          const currentAllergies = prev.allergies || [];
          if (checked) {
              return { ...prev, allergies: [...currentAllergies, allergen] };
          } else {
              return { ...prev, allergies: currentAllergies.filter(a => a !== allergen) };
          }
      });
  };
  
  const handlePreferenceChange = (foodId: string, preference: 'preferred' | 'disliked') => {
      setFormData(prev => {
          const { preferred, disliked } = prev.foodPreferences;
          const newPreferences = {
              preferred: [...preferred],
              disliked: [...disliked],
          };

          const targetArray = preference === 'preferred' ? newPreferences.preferred : newPreferences.disliked;
          const oppositeArray = preference === 'preferred' ? newPreferences.disliked : newPreferences.preferred;
          
          const itemIndex = targetArray.indexOf(foodId);
          if (itemIndex > -1) {
              // Toggle off
              targetArray.splice(itemIndex, 1);
          } else {
              // Toggle on
              targetArray.push(foodId);
              // Ensure it's not in the opposite list
              const oppositeIndex = oppositeArray.indexOf(foodId);
              if (oppositeIndex > -1) {
                  oppositeArray.splice(oppositeIndex, 1);
              }
          }
          
          return { ...prev, foodPreferences: newPreferences };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    onSave(formData);
    setShowConfirmDialog(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCancelSave = () => {
    setShowConfirmDialog(false);
  };

  const bmi = useMemo(() => {
    if (formData.height > 0 && formData.weight > 0) {
      const heightInMeters = formData.height / 100;
      return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  }, [formData.height, formData.weight]);

  const calculatedAge = useMemo(() => {
    if (!formData.dateOfBirth) return 'غير محدد';
    return `${calculateAge(formData.dateOfBirth)} سنة`;
  }, [formData.dateOfBirth]);
  
  const handleNewRecordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = () => {
      const weight = parseFloat(newRecord.weight);
      const height = parseFloat(newRecord.height);
      if (newRecord.date && !isNaN(weight) && !isNaN(height) && weight > 0 && height > 0) {
          onAddGrowthRecord(formData.id, {
              date: new Date(newRecord.date).toISOString(),
              weight,
              height
          });
          setNewRecord({ date: toDateInputString(new Date()), weight: '', height: '' });
      } else {
        alert("يرجى إدخال بيانات صحيحة للسجل.");
      }
  };
  
  const handleDeleteRecord = (recordDate: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
          onDeleteGrowthRecord(formData.id, recordDate);
      }
  };

  const FormInput: React.FC<{label: string, id: string, name?: string, type: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, unit?: string, step?: string}> = 
  ({ label, id, name, type, value, onChange, unit, step }) => (
      <div>
          <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
          <div className="flex items-center">
              <input
                  type={type}
                  id={id}
                  name={name || id}
                  value={value}
                  onChange={onChange}
                  step={step || "any"}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              />
              {unit && <span className="mr-3 text-slate-500">{unit}</span>}
          </div>
      </div>
  );

  return (
    <>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <ChildIcon className="w-10 h-10 text-teal-500" />
          <h1 className="text-3xl font-bold text-slate-800">
            {isNewProfile ? 'إضافة طفل جديد' : `تعديل بيانات ${profile.name}`}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-3">المعلومات الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <FormInput label="الاسم" id="name" type="text" value={formData.name} onChange={handleChange} />
              <div>
                <FormInput label="تاريخ الميلاد" id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                <p className="text-xs text-slate-500 mt-1">العمر الحالي: {calculatedAge}</p>
              </div>
              <FormInput label="الوزن" id="weight" type="number" value={formData.weight} onChange={handleChange} unit="كجم"/>
              <FormInput label="الطول" id="height" type="number" value={formData.height} onChange={handleChange} unit="سم"/>
            </div>
          </div>
            
          {/* Unit Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-3">إعدادات الوحدات</h2>
            <p className="block text-sm font-medium text-slate-600 mb-2">وحدة قياس السكر</p>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-teal-50 has-[:checked]:border-teal-400 cursor-pointer">
                    <input type="radio" name="glucoseUnit" value="mg/dL" checked={formData.glucoseUnit === 'mg/dL'} onChange={handleUnitChange} className="accent-teal-500"/>
                    <span>mg/dL</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-teal-50 has-[:checked]:border-teal-400 cursor-pointer">
                    <input type="radio" name="glucoseUnit" value="mmol/L" checked={formData.glucoseUnit === 'mmol/L'} onChange={handleUnitChange} className="accent-teal-500"/>
                    <span>mmol/L</span>
                </label>
            </div>
          </div>


          {/* Growth & Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                   <h3 className="text-lg font-semibold text-slate-600 mb-2">مؤشر كتلة الجسم (BMI)</h3>
                   <p className="text-4xl font-bold text-teal-600">{bmi}</p>
                   <p className="text-sm text-slate-400">معدل النمو</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                   <h3 className="text-lg font-semibold text-slate-600 mb-2">النطاق المستهدف للسكر</h3>
                   <p className="text-4xl font-bold text-teal-600">{toUserUnit(formData.hypoglycemiaLevel).toFixed(formData.glucoseUnit === 'mmol/L' ? 1: 0)} - {toUserUnit(formData.hyperglycemiaLevel).toFixed(formData.glucoseUnit === 'mmol/L' ? 1: 0)}</p>
                   <p className="text-sm text-slate-400">{formData.glucoseUnit}</p>
              </div>
          </div>

          {/* Allergies & Diet */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4 border-b pb-3">الحساسية والنظام الغذائي</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><BanIcon className="w-5 h-5 text-red-500"/> مسببات الحساسية</h3>
                        <div className="space-y-2">
                            {ALLERGENS.map(allergen => (
                                <label key={allergen} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.allergies.includes(allergen)}
                                        onChange={e => handleAllergyChange(allergen, e.target.checked)}
                                        className="w-5 h-5 rounded accent-teal-500"
                                    />
                                    <span>{ALLERGEN_NAMES[allergen]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><LeafIcon className="w-5 h-5 text-green-500"/> الخطة الغذائية</h3>
                        <select
                            name="diet"
                            value={formData.diet || ''}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md bg-white"
                        >
                            <option value="">بدون حمية محددة</option>
                            {DIETS.map(diet => (
                                <option key={diet} value={diet}>{DIET_NAMES[diet]}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
          
          {/* Food Preferences */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-3">تفضيلات الطعام</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {foodItems.map(item => {
                    const isPreferred = formData.foodPreferences.preferred.includes(item.id);
                    const isDisliked = formData.foodPreferences.disliked.includes(item.id);
                    return (
                        <div key={item.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />}
                                <p className="font-semibold">{item.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handlePreferenceChange(item.id, 'preferred')} className={`p-2 rounded-full transition-colors ${isPreferred ? 'bg-red-100 text-red-500' : 'text-slate-400 hover:bg-slate-100'}`}>
                                    <HeartIcon className={`w-5 h-5 ${isPreferred ? 'fill-current' : ''}`} />
                                </button>
                                <button type="button" onClick={() => handlePreferenceChange(item.id, 'disliked')} className={`p-2 rounded-full transition-colors ${isDisliked ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                                    <ThumbsDownIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Diabetes Management Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-3">إعدادات إدارة السكري</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <FormInput label="معامل التصحيح" id="correctionFactor" type="number" value={toUserUnit(formData.correctionFactor)} onChange={handleChange} unit={`${formData.glucoseUnit} لكل وحدة`} step={formData.glucoseUnit === 'mmol/L' ? '0.1' : '1'} />
              </div>

              <h3 className="md:col-span-2 font-semibold text-slate-700 mt-4 -mb-2 border-t pt-4">معامل الكربوهيدرات (لكل وجبة)</h3>
              <FormInput label="الفطور" id="breakfast" name="breakfast" type="number" value={formData.carbRatios.breakfast} onChange={handleCarbRatioChange} unit="جرام لكل وحدة"/>
              <FormInput label="الغداء" id="lunch" name="lunch" type="number" value={formData.carbRatios.lunch} onChange={handleCarbRatioChange} unit="جرام لكل وحدة"/>
              <FormInput label="العشاء" id="dinner" name="dinner" type="number" value={formData.carbRatios.dinner} onChange={handleCarbRatioChange} unit="جرام لكل وحدة"/>
              <FormInput label="وجبة خفيفة" id="snack" name="snack" type="number" value={formData.carbRatios.snack} onChange={handleCarbRatioChange} unit="جرام لكل وحدة"/>

              <div className="md:col-span-2 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-slate-700 mb-2">مواعيد الوجبات التقريبية</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                          <label htmlFor="breakfastTime" className="block text-sm font-medium text-slate-600 mb-1">الفطور</label>
                          <input type="time" id="breakfastTime" value={formData.mealTimes.breakfast} onChange={(e) => handleMealTimeChange('breakfast', e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition" />
                      </div>
                      <div>
                          <label htmlFor="lunchTime" className="block text-sm font-medium text-slate-600 mb-1">الغداء</label>
                          <input type="time" id="lunchTime" value={formData.mealTimes.lunch} onChange={(e) => handleMealTimeChange('lunch', e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition" />
                      </div>
                      <div>
                          <label htmlFor="dinnerTime" className="block text-sm font-medium text-slate-600 mb-1">العشاء</label>
                          <input type="time" id="dinnerTime" value={formData.mealTimes.dinner} onChange={(e) => handleMealTimeChange('dinner', e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition" />
                      </div>
                  </div>
              </div>

              <h3 className="md:col-span-2 font-semibold text-slate-700 mt-4 -mb-2 border-t pt-4">نطاق الكربوهيدرات المستهدف (جرام)</h3>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
                <div key={meal} className="md:col-span-2 grid grid-cols-3 items-end gap-2">
                  <label className="text-sm font-medium text-slate-600 pt-3 col-span-3 sm:col-span-1">
                    { {breakfast: 'الفطور', lunch: 'الغداء', dinner: 'العشاء', snack: 'وجبة خفيفة'}[meal] }
                  </label>
                  <div className="col-span-3 sm:col-span-2 grid grid-cols-2 gap-2">
                    <FormInput label="الحد الأدنى" id={`${meal}-min`} type="number" value={formData.carbRanges[meal].min} onChange={(e) => handleCarbRangeChange(meal, 'min', e.target.value)} />
                    <FormInput label="الحد الأقصى" id={`${meal}-max`} type="number" value={formData.carbRanges[meal].max} onChange={(e) => handleCarbRangeChange(meal, 'max', e.target.value)} />
                  </div>
                </div>
              ))}
              
              <h3 className="md:col-span-2 font-semibold text-slate-700 mt-4 -mb-2 border-t pt-4">حدود مستويات السكر ({formData.glucoseUnit})</h3>
              <FormInput label="مستوى الارتفاع" id="hyperglycemiaLevel" type="number" value={toUserUnit(formData.hyperglycemiaLevel)} onChange={handleChange} step={formData.glucoseUnit === 'mmol/L' ? '0.1' : '1'}/>
              <FormInput label="مستوى الارتفاع الحاد" id="severeHyperglycemiaLevel" type="number" value={toUserUnit(formData.severeHyperglycemiaLevel)} onChange={handleChange} step={formData.glucoseUnit === 'mmol/L' ? '0.1' : '1'}/>
              <FormInput label="مستوى الارتفاع الحرج" id="criticalHyperglycemiaLevel" type="number" value={toUserUnit(formData.criticalHyperglycemiaLevel)} onChange={handleChange} step={formData.glucoseUnit === 'mmol/L' ? '0.1' : '1'}/>
              <FormInput label="مستوى الهبوط" id="hypoglycemiaLevel" type="number" value={toUserUnit(formData.hypoglycemiaLevel)} onChange={handleChange} step={formData.glucoseUnit === 'mmol/L' ? '0.1' : '1'}/>
              <FormInput label="مستوى الهبوط الحاد" id="severeHypoglycemiaLevel" type="number" value={toUserUnit(formData.severeHypoglycemiaLevel)} onChange={handleChange} step={formData.glucoseUnit === 'mmol/L' ? '0.1' : '1'}/>

              {/* Automatic Alerts Section */}
              <h3 className="md:col-span-2 font-semibold text-slate-700 mt-4 -mb-2 border-t pt-4">التنبيهات التلقائية</h3>
                <div className="md:col-span-2 space-y-4">
                    {/* Hypo Alert */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 rounded-lg gap-4">
                        <div>
                            <label htmlFor="hypoAlertEnabled" className="font-medium text-slate-800">تفعيل تنبيه هبوط السكر</label>
                            <p className="text-xs text-slate-500">
                                إرسال تنبيه عند تسجيل قراءة أقل من {toUserUnit(formData.hypoglycemiaLevel).toFixed(formData.glucoseUnit === 'mmol/L' ? 1: 0)} {formData.glucoseUnit}
                            </p>
                        </div>
                        <input
                            id="hypoAlertEnabled"
                            type="checkbox"
                            checked={formData.alertSettings.hypoAlert.enabled}
                            onChange={(e) => handleAlertChange('hypoAlert', 'enabled', e.target.checked)}
                            className="w-6 h-6 rounded-md accent-teal-500 flex-shrink-0"
                        />
                    </div>
                    {formData.alertSettings.hypoAlert.enabled && (
                        <div className="pl-4">
                            <label htmlFor="hypoAlertDelay" className="block text-sm font-medium text-slate-600 mb-1">إرسال التنبيه بعد:</label>
                            <select
                                id="hypoAlertDelay"
                                value={formData.alertSettings.hypoAlert.delayMinutes}
                                onChange={(e) => handleAlertChange('hypoAlert', 'delayMinutes', parseInt(e.target.value, 10))}
                                className="w-full sm:w-auto p-2 border rounded-md bg-white"
                            >
                                <option value={0}>فورًا</option>
                                <option value={5}>5 دقائق</option>
                                <option value={15}>15 دقيقة</option>
                            </select>
                        </div>
                    )}

                    {/* Severe Hyper Alert */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 rounded-lg gap-4">
                        <div>
                            <label htmlFor="severeHyperAlertEnabled" className="font-medium text-slate-800">تفعيل تنبيه الارتفاع الحاد</label>
                            <p className="text-xs text-slate-500">
                                إرسال تنبيه عند تسجيل قراءة أعلى من {toUserUnit(formData.severeHyperglycemiaLevel).toFixed(formData.glucoseUnit === 'mmol/L' ? 1: 0)} {formData.glucoseUnit}
                            </p>
                        </div>
                         <input
                            id="severeHyperAlertEnabled"
                            type="checkbox"
                            checked={formData.alertSettings.severeHyperAlert.enabled}
                            onChange={(e) => handleAlertChange('severeHyperAlert', 'enabled', e.target.checked)}
                            className="w-6 h-6 rounded-md accent-teal-500 flex-shrink-0"
                        />
                    </div>
                    {formData.alertSettings.severeHyperAlert.enabled && (
                         <div className="pl-4">
                            <label htmlFor="severeHyperAlertDelay" className="block text-sm font-medium text-slate-600 mb-1">إرسال التنبيه بعد:</label>
                            <select
                                id="severeHyperAlertDelay"
                                value={formData.alertSettings.severeHyperAlert.delayMinutes}
                                onChange={(e) => handleAlertChange('severeHyperAlert', 'delayMinutes', parseInt(e.target.value, 10))}
                                className="w-full sm:w-auto p-2 border rounded-md bg-white"
                            >
                                <option value={0}>فورًا</option>
                                <option value={5}>5 دقائق</option>
                                <option value={15}>15 دقيقة</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Growth Log Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-3">سجل النمو</h2>
            
            {!isNewProfile && (
                <>
                    <div className="p-4 bg-slate-50 rounded-lg mb-6">
                        <h3 className="font-semibold mb-3 text-slate-700">إضافة سجل تاريخي</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <div className="sm:col-span-1">
                                <label htmlFor="newRecordDate" className="block text-sm font-medium text-slate-600 mb-1">التاريخ</label>
                                <input type="date" id="newRecordDate" name="date" value={newRecord.date} onChange={handleNewRecordChange} className="w-full p-2 border rounded-md" />
                            </div>
                            <div className="sm:col-span-1">
                                <label htmlFor="newRecordWeight" className="block text-sm font-medium text-slate-600 mb-1">الوزن (كجم)</label>
                                <input type="number" id="newRecordWeight" name="weight" value={newRecord.weight} onChange={handleNewRecordChange} className="w-full p-2 border rounded-md" step="0.1" placeholder="e.g. 25.5" />
                            </div>
                            <div className="sm:col-span-1">
                                <label htmlFor="newRecordHeight" className="block text-sm font-medium text-slate-600 mb-1">الطول (سم)</label>
                                <input type="number" id="newRecordHeight" name="height" value={newRecord.height} onChange={handleNewRecordChange} className="w-full p-2 border rounded-md" placeholder="e.g. 125" />
                            </div>
                            <div className="sm:col-span-1">
                                <button type="button" onClick={handleAddRecord} className="w-full bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition">إضافة سجل</button>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-semibold mb-3 text-slate-700">السجلات المحفوظة</h3>
                </>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {[...(formData.growthLog || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).length > 0 ? (
                    [...(formData.growthLog || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                        <div key={record.date} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                            <div className="flex items-center gap-4 sm:gap-8 text-sm">
                                <p><span className="font-semibold text-slate-600">التاريخ:</span> {new Date(record.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p><span className="font-semibold text-slate-600">الوزن:</span> {record.weight.toFixed(1)} كجم</p>
                                <p><span className="font-semibold text-slate-600">الطول:</span> {record.height.toFixed(0)} سم</p>
                            </div>
                            <button onClick={() => handleDeleteRecord(record.date)} className="text-red-500 hover:text-red-700 p-1" aria-label="حذف السجل">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4">لا توجد سجلات نمو محفوظة.</p>
                )}
            </div>
          </div>
          
          {/* Caregivers Section */}
            {!isNewProfile && (
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-6 border-b pb-3 flex items-center gap-2"><UsersIcon className="w-6 h-6 text-teal-500"/> دائرة الرعاية</h2>
                    <div className="space-y-4">
                        {caregivers.map(cg => (
                            <div key={cg.id} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                                <div>
                                    <p className="font-semibold">{cg.name}</p>
                                    <p className="text-sm text-slate-500">{cg.email} - <span className="font-medium text-slate-600">{cg.permission === 'read' ? 'اطلاع فقط' : 'صلاحيات كاملة'}</span></p>
                                </div>
                                <button onClick={() => handleRemoveCaregiverClick(cg)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddCaregiver} className="mt-6 p-4 bg-slate-50 rounded-lg">
                         <h3 className="font-semibold mb-3 text-slate-700">دعوة مقدم رعاية جديد</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <input value={newCaregiver.name} onChange={e => setNewCaregiver(p => ({...p, name: e.target.value}))} type="text" placeholder="الاسم" className="w-full p-2 border rounded-md" required />
                            <input value={newCaregiver.email} onChange={e => setNewCaregiver(p => ({...p, email: e.target.value}))} type="email" placeholder="البريد الإلكتروني" className="w-full p-2 border rounded-md" required />
                            <select value={newCaregiver.permission} onChange={e => setNewCaregiver(p => ({...p, permission: e.target.value as any}))} className="w-full p-2 border rounded-md bg-white">
                                <option value="read">اطلاع فقط</option>
                                <option value="read_write">صلاحيات كاملة</option>
                            </select>
                         </div>
                         <button type="submit" className="mt-4 bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition">إرسال دعوة</button>
                    </form>
                </div>
            )}


          {/* Doctor Linking Section */}
          {!isNewProfile && (
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-6 border-b pb-3">ربط بحساب الطبيب</h2>
                {formData.linkedDoctorId && linkedDoctor ? (
                    <div>
                        <p className="text-slate-600 mb-2">هذا الملف مربوط بالطبيب:</p>
                        <div className="bg-green-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <p className="font-bold text-lg text-green-800">{linkedDoctor.name}</p>
                                <p className="text-sm text-slate-500">{linkedDoctor.specialty}</p>
                            </div>
                            <button onClick={handleUnlink} type="button" className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition self-end sm:self-center">
                                إلغاء الربط
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-slate-600 mb-2">أدخل كود الربط الذي حصلت عليه من طبيبك لتمكينه من متابعة بيانات طفلك.</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                                type="text"
                                value={doctorCode}
                                onChange={(e) => setDoctorCode(e.target.value)}
                                placeholder="مثال: DOC-XYZ-12345"
                                className="flex-grow p-2 border rounded-md"
                            />
                            <button onClick={handleLink} type="button" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition" disabled={!doctorCode.trim()}>
                                ربط
                            </button>
                        </div>
                    </div>
                )}
            </div>
          )}
          
          <div className="flex justify-end items-center gap-4">
              {isSaved && <p className="text-green-600 transition-opacity duration-300">تم حفظ التغييرات بنجاح!</p>}
              <button type="button" onClick={onCancel} className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold border hover:bg-slate-50 transition">
                إلغاء
              </button>
              <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
                حفظ التغييرات
              </button>
          </div>
        </form>
      </div>
      
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full m-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
                <AlertTriangleIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg leading-6 font-bold text-slate-900 mt-4" id="modal-title">
                تأكيد حفظ التغييرات
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500">
                  هل أنت متأكد من رغبتك في حفظ هذه التغييرات؟ سيتم تحديث بيانات الطفل.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
                onClick={handleConfirmSave}
              >
                تأكيد
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={handleCancelSave}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
