
import React, { useState, useEffect } from 'react';
import { FoodItem, ServingOption, Allergen, Diet } from '../types';
import { ChefHatIcon, PlusCircleIcon, SaveIcon, TrashIcon, EditIcon, XIcon } from './Icons';
import { ALLERGENS, ALLERGEN_NAMES, DIETS, DIET_NAMES } from '../constants';

interface ManageFoodItemsProps {
  foodItems: FoodItem[];
  onAdd: (item: Omit<FoodItem, 'id'>) => void;
  onUpdate: (item: FoodItem) => void;
  onDelete: (id: string) => void;
}

const EMPTY_FOOD_ITEM: Omit<FoodItem, 'id'> = {
  name: '',
  imageUrl: '',
  servingOptions: [{ name: '', grams: 0 }],
  carbs: 0,
  calories: 0,
  fiber: 0,
  sodium: 0,
  protein: 0,
  fat: 0,
  glycemicIndex: 0,
  allergens: [],
  suitableDiets: [],
};

const FoodForm: React.FC<{
  item: FoodItem | Omit<FoodItem, 'id'>;
  onSave: (item: FoodItem | Omit<FoodItem, 'id'>) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleServingChange = (index: number, field: 'name' | 'grams', value: string | number) => {
    const newServingOptions = [...formData.servingOptions];
    newServingOptions[index] = { ...newServingOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, servingOptions: newServingOptions }));
  };
  
  const addServingOption = () => {
    setFormData(prev => ({...prev, servingOptions: [...prev.servingOptions, {name: '', grams: 0}]}));
  };
  
  const removeServingOption = (index: number) => {
     setFormData(prev => ({...prev, servingOptions: prev.servingOptions.filter((_, i) => i !== index)}));
  };

    const handleAllergyChange = (allergen: Allergen, checked: boolean) => {
        setFormData(prev => {
            const currentAllergens = prev.allergens || [];
            if (checked) {
                return { ...prev, allergens: [...currentAllergens, allergen] };
            } else {
                return { ...prev, allergens: currentAllergens.filter(a => a !== allergen) };
            }
        });
    };
    
    const handleDietChange = (diet: Diet, checked: boolean) => {
        setFormData(prev => {
            const currentDiets = prev.suitableDiets || [];
            if (checked) {
                return { ...prev, suitableDiets: [...currentDiets, diet] };
            } else {
                return { ...prev, suitableDiets: currentDiets.filter(d => d !== diet) };
            }
        });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const isEditing = 'id' in item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
            <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
            <button onClick={onCancel} className="p-1 rounded-full hover:bg-slate-100"><XIcon className="w-6 h-6 text-slate-500"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="اسم الصنف" name="name" value={formData.name} onChange={handleChange} required/>
                <FormInput label="رابط الصورة (اختياري)" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} />
            </div>

            <fieldset className="border p-4 rounded-lg">
                <legend className="text-sm font-medium text-slate-600 px-2">وحدات التقديم</legend>
                <div className="space-y-2">
                    {formData.servingOptions.map((serving, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="text" placeholder="اسم الوحدة (مثل: كوب)" value={serving.name} onChange={e => handleServingChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md" required />
                            <input type="number" placeholder="الجرامات" value={serving.grams} onChange={e => handleServingChange(index, 'grams', parseFloat(e.target.value) || 0)} className="w-32 p-2 border rounded-md" required/>
                            <button type="button" onClick={() => removeServingOption(index)} disabled={formData.servingOptions.length <= 1} className="text-red-500 disabled:text-slate-300 p-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                 <button type="button" onClick={addServingOption} className="text-sm text-teal-600 font-semibold mt-2 flex items-center gap-1"><PlusCircleIcon className="w-4 h-4"/> إضافة وحدة</button>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <legend className="text-sm font-medium text-slate-600 px-2">المعلومات الغذائية (لكل 100 جرام)</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormInput label="الكربوهيدرات (جم)" name="carbs" type="number" value={formData.carbs} onChange={handleChange} />
                    <FormInput label="السعرات الحرارية" name="calories" type="number" value={formData.calories} onChange={handleChange} />
                    <FormInput label="الألياف (جم)" name="fiber" type="number" value={formData.fiber} onChange={handleChange} />
                    <FormInput label="البروتين (جم)" name="protein" type="number" value={formData.protein} onChange={handleChange} />
                    <FormInput label="الدهون (جم)" name="fat" type="number" value={formData.fat} onChange={handleChange} />
                    <FormInput label="الصوديوم (ملجم)" name="sodium" type="number" value={formData.sodium} onChange={handleChange} />
                    <FormInput label="المؤشر الجلايسيمي" name="glycemicIndex" type="number" value={formData.glycemicIndex} onChange={handleChange} />
                </div>
            </fieldset>
            
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-sm font-medium text-slate-600 px-2">تفاصيل الحساسية والحمية</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">مسببات الحساسية</h4>
                        <div className="space-y-1">
                            {ALLERGENS.map(allergen => (
                                <label key={allergen} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.allergens?.includes(allergen)} onChange={e => handleAllergyChange(allergen, e.target.checked)} className="w-4 h-4 accent-teal-500" />
                                    <span>{ALLERGEN_NAMES[allergen]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-700 mb-2">مناسب للحميات</h4>
                         <div className="space-y-1">
                            {DIETS.map(diet => (
                                <label key={diet} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.suitableDiets?.includes(diet)} onChange={e => handleDietChange(diet, e.target.checked)} className="w-4 h-4 accent-teal-500" />
                                    <span>{DIET_NAMES[diet]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </fieldset>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200">إلغاء</button>
                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-2">
                    <SaveIcon className="w-5 h-5"/>
                    <span>حفظ</span>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const FormInput: React.FC<{label: string, name: string, type?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean}> = 
  ({ label, name, type = 'text', value, onChange, required=false }) => (
      <div>
          <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
          <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition" step="any"/>
      </div>
  );


export const ManageFoodItems: React.FC<ManageFoodItemsProps> = ({ foodItems, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | Omit<FoodItem, 'id'>>(EMPTY_FOOD_ITEM);

  const handleAddNew = () => {
    setEditingItem(EMPTY_FOOD_ITEM);
    setShowForm(true);
  };
  
  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: FoodItem) => {
    if (window.confirm(`هل أنت متأكد من حذف "${item.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        onDelete(item.id);
    }
  };
  
  const handleSave = (item: FoodItem | Omit<FoodItem, 'id'>) => {
    if ('id' in item) {
        onUpdate(item);
    } else {
        onAdd(item);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <ChefHatIcon className="w-10 h-10 text-teal-500" />
          <h1 className="text-3xl font-bold text-slate-800">إدارة الأصناف الغذائية</h1>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">قائمة الأصناف ({foodItems.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="p-3 font-semibold">الصنف</th>
                <th className="p-3 font-semibold">الكربوهيدرات (لكل 100ج)</th>
                <th className="p-3 font-semibold">تفاصيل</th>
                <th className="p-3 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map(item => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl || 'https://via.placeholder.com/40'} alt={item.name} className="w-10 h-10 rounded-md object-cover bg-slate-200" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{item.carbs} جم</td>
                  <td className="p-3 text-xs text-slate-600">
                    <div className="flex flex-wrap gap-1">
                        {item.allergens?.map(a => <span key={a} className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{ALLERGEN_NAMES[a]}</span>)}
                        {item.suitableDiets?.map(d => <span key={d} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{DIET_NAMES[d]}</span>)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-sky-600 hover:text-sky-800 p-1" aria-label={`تعديل ${item.name}`}><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800 p-1" aria-label={`حذف ${item.name}`}><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showForm && <FoodForm item={editingItem} onSave={handleSave} onCancel={() => setShowForm(false)} />}
    </div>
  );
};
