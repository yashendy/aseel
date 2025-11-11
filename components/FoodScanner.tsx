
import React, { useState, useRef, useEffect } from 'react';
import { FoodItem } from '../types';
import { analyzeNutritionLabel } from '../services/geminiService';
import { CameraIcon, SaveIcon, XIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons';

interface FoodScannerProps {
    onClose: () => void;
    onAddFoodItem: (item: Omit<FoodItem, 'id'>) => void;
}

const EMPTY_FOOD_ITEM: Omit<FoodItem, 'id'> = {
  name: '',
  imageUrl: '',
  servingOptions: [{ name: '100 جرام', grams: 100 }],
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

export const FoodScanner: React.FC<FoodScannerProps> = ({ onClose, onAddFoodItem }) => {
    const [formData, setFormData] = useState<Omit<FoodItem, 'id'>>(EMPTY_FOOD_ITEM);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setCameraStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setError("تم رفض الوصول إلى الكاميرا. يرجى السماح بالوصول في إعدادات المتصفح.");
            }
        };

        startCamera();

        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsScanning(true);
        setError(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            setError("لا يمكن الوصول إلى سياق الرسم.");
            setIsScanning(false);
            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        
        try {
            const nutritionData = await analyzeNutritionLabel(base64Image);
            if (Object.keys(nutritionData).length === 0) {
                 setError("لم يتمكن الذكاء الاصطناعي من قراءة الملصق. حاول مرة أخرى بصورة أوضح.");
            } else {
                 setFormData(prev => ({ ...prev, ...nutritionData }));
            }
        } catch (err) {
             setError("حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsScanning(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddFoodItem(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full m-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-6 flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CameraIcon className="w-6 h-6"/> مسح صنف غذائي جديد</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><XIcon className="w-6 h-6 text-slate-500"/></button>
                </div>

                <div className="overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-slate-800" />
                            <button
                                onClick={captureAndAnalyze}
                                disabled={isScanning || !cameraStream}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-teal-600 rounded-full p-3 shadow-lg hover:bg-teal-50 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                aria-label="التقاط وتحليل الصورة"
                            >
                                <CameraIcon className="w-6 h-6"/>
                            </button>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-lg">
                           {isScanning ? (
                                <>
                                    <svg className="animate-spin h-8 w-8 text-teal-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="font-semibold text-slate-700">جاري تحليل الملصق الغذائي...</p>
                                </>
                           ) : error ? (
                               <div className="text-red-600">
                                   <AlertTriangleIcon className="w-8 h-8 mx-auto mb-2"/>
                                   <p className="font-semibold">خطأ!</p>
                                   <p className="text-sm">{error}</p>
                               </div>
                           ) : formData.carbs > 0 ? (
                                <div className="text-green-600">
                                   <CheckCircleIcon className="w-8 h-8 mx-auto mb-2"/>
                                   <p className="font-semibold">تم التحليل بنجاح!</p>
                                   <p className="text-sm">راجع البيانات أدناه وقم بتسمية الصنف ثم احفظه.</p>
                               </div>
                           ) : (
                                <>
                                    <p className="font-semibold text-slate-700">كيفية الاستخدام</p>
                                    <ol className="text-sm text-slate-600 list-decimal list-inside text-right">
                                        <li>وجّه الكاميرا إلى الملصق الغذائي.</li>
                                        <li>تأكد من أن النص واضح ومضاء جيدًا.</li>
                                        <li>اضغط على زر الكاميرا للالتقاط والتحليل.</li>
                                        <li>املأ اسم الصنف وراجع البيانات قبل الحفظ.</li>
                                    </ol>
                                </>
                           )}
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">اسم الصنف (مطلوب)</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">الكربوهيدرات (جم)</label><input type="number" name="carbs" value={formData.carbs} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">السعرات</label><input type="number" name="calories" value={formData.calories} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">الألياف (جم)</label><input type="number" name="fiber" value={formData.fiber} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">البروتين (جم)</label><input type="number" name="protein" value={formData.protein} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">الدهون (جم)</label><input type="number" name="fat" value={formData.fat} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">الصوديوم (ملجم)</label><input type="number" name="sodium" value={formData.sodium} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                        </div>
                        <p className="text-xs text-slate-500 text-center">المعلومات الغذائية أعلاه محسوبة لكل 100 جرام.</p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200">إلغاء</button>
                            <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-2 disabled:bg-slate-400" disabled={!formData.name}>
                                <SaveIcon className="w-5 h-5"/>
                                <span>إضافة للمكتبة</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};