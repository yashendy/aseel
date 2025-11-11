
import { GoogleGenAI, Type } from "@google/genai";
import { MealLog, ChildProfile, SugarReading, InsulinLog, ExerciseLog, SicknessLog, ProactiveInsight, FoodItem, GlucosePrediction, VoiceCommand, MealTemplateItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeHealthData = async (data: object, query: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-pro';
    
    const dataString = JSON.stringify(data, null, 2);
    
    const prompt = `
      أنت خبير في تحليل بيانات مرض السكري للأطفال. بصفتك مساعدًا، قم بتحليل البيانات التالية لطفل.
      البيانات تشمل قراءات السكر، الوجبات، جرعات الأنسولين، التمارين، وأيام المرض.
      لا تقدم أي نصيحة طبية مباشرة أو تشخيص. بدلاً من ذلك، قم بتلخيص الاتجاهات والأنماط التي تلاحظها في البيانات.
      عند التحليل، اربط بين الأحداث المختلفة (مثال: "لوحظ ارتفاع في السكر بعد وجبة الغداء بالرغم من جرعة الأنسولين، قد يكون النشاط الرياضي القليل في ذلك اليوم عاملاً مساهماً").
      
      البيانات:
      \`\`\`json
      ${dataString}
      \`\`\`
      
      استعلام المستخدم: "${query}"
      
      قدم تحليلك باللغة العربية في شكل نقاط واضحة ومنظمة.
      ابدأ بملخص عام ثم أجب على استعلام المستخدم المحدد.
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing health data:", error);
    return "عذراً، حدث خطأ أثناء تحليل البيانات. يرجى المحاولة مرة أخرى.";
  }
};

export const getQuickNutritionAdvice = async (question: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
        model: model,
        contents: question,
        config: {
            systemInstruction: `أنت مساعد تغذية متخصص في سكري الأطفال. قدم إجابات قصيرة ومفيدة باللغة العربية. 
            لا تقدم نصيحة طبية مخصصة. تحدث بصفة عامة عن الأطعمة وتأثيرها.
            على سبيل المثال، إذا سئلت "هل التفاح جيد؟"، يمكنك الإجابة "التفاح خيار جيد لأنه يحتوي على ألياف تساعد على إبطاء امتصاص السكر، ولكن يجب دائمًا حساب الكربوهيدرات ضمن الخطة الغذائية".`
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error getting nutrition advice:", error);
    return "عذراً، حدث خطأ أثناء الحصول على النصيحة. يرجى المحاولة مرة أخرى.";
  }
};

export const getNutritionTipsFromMeals = async (mealLogs: MealLog[]): Promise<string> => {
  if (mealLogs.length === 0) {
    return "لا توجد وجبات مسجلة لتقديم نصائح بشأنها. يرجى إضافة بعض الوجبات أولاً.";
  }
  try {
    const model = 'gemini-2.5-flash';
    
    const dataString = JSON.stringify(mealLogs.slice(0, 10), null, 2); // Send recent 10 meals
    
    const prompt = `
      أنت مساعد تغذية أطفال متخصص وودود، خبير في مرض السكري من النوع الأول.
      هدفك هو تقديم نصائح غذائية إيجابية وعملية بناءً على سجل وجبات الطفل الأخيرة.
      لا تقدم أي نصيحة طبية أو تشخيص أو حسابات للأنسولين.
      ركز على الأنماط الإيجابية واقتراح تحسينات صحية صغيرة.
      استخدم لهجة داعمة ومشجعة وسهلة الفهم للآباء.
      قدم 2-3 نصائح قصيرة وواضحة على شكل نقاط باللغة العربية.

      هذه هي الوجبات الأخيرة للطفل:
      \`\`\`json
      ${dataString}
      \`\`\`
      
      بناءً على هذه الوجبات، يرجى تقديم نصائحك.
      أمثلة على النصائح: "من الرائع رؤية هذا التنوع في الأطعمة! في الوجبة الخفيفة القادمة، يمكن تجربة إضافة مصدر بروتين مع التفاح مثل الزبادي اليوناني للمساعدة في استقرار سكر الدم." أو "الدجاج المشوي في الغداء خيار بروتين ممتاز. إضافة المزيد من الخضروات الملونة مثل الفلفل الملون أو البروكلي يمكن أن يزيد من الألياف والفيتامينات."
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error getting nutrition tips:", error);
    return "عذراً، حدث خطأ أثناء إنشاء النصائح. يرجى المحاولة مرة أخرى.";
  }
};

export const analyzeReportData = async (readings: SugarReading[], profile: ChildProfile): Promise<string> => {
  if (readings.length === 0) {
    return "لا توجد بيانات كافية للتحليل في الفترة المحددة. يرجى اختيار نطاق زمني يحتوي على قراءات.";
  }
  try {
    const model = 'gemini-2.5-pro';
    
    const dataSummary = readings.map(r => ({
      date: new Date(r.date).toLocaleString('ar-EG'),
      value: r.value,
      context: `${r.timeContext}${r.mealType ? ` (${r.mealType})` : ''}`
    }));

    const prompt = `
      أنت مساعد ذكي متخصص في تحليل بيانات سكر الدم للأطفال المصابين بالسكري من النوع الأول.
      مهمتك هي تحليل البيانات التالية وتقديم تقرير منظم وموجز لمساعدة ولي الأمر على فهم الأنماط.
      **لا تقدم أي نصيحة طبية أو تعديلات على جرعات الأنسولين.** ركز فقط على تلخيص البيانات والأنماط.

      **بيانات الطفل (النطاقات المستهدفة بـ mg/dL):**
      - اسم الطفل: ${profile.name}
      - هبوط السكر: أقل من ${profile.hypoglycemiaLevel}
      - النطاق الطبيعي: من ${profile.hypoglycemiaLevel} إلى ${profile.hyperglycemiaLevel}
      - ارتفاع السكر: أعلى من ${profile.hyperglycemiaLevel}
      - ارتفاع حاد: أعلى من ${profile.severeHyperglycemiaLevel}
      - ارتفاع حرج: أعلى من ${profile.criticalHyperglycemiaLevel}

      **قراءات السكر للفترة المحددة (mg/dL):**
      \`\`\`json
      ${JSON.stringify(dataSummary.slice(0, 100), null, 2)}
      \`\`\`

      **المطلوب:**
      قم بإنشاء تقرير باللغة العربية باستخدام التنسيق التالي تمامًا:

      ### ملخص عام
      [اكتب هنا فقرة قصيرة تلخص حالة التحكم في السكر خلال هذه الفترة.]

      ### المؤشرات الرئيسية
      - **متوسط سكر الدم:** [احسب متوسط القراءات]
      - **نسبة الوقت في النطاق (TIR):** [احسب النسبة المئوية للقراءات ضمن النطاق الطبيعي]
      - **إجمالي قراءات الهبوط:** [اذكر عدد مرات الهبوط]
      - **إجمالي قراءات الارتفاع:** [اذكر عدد مرات الارتفاع]

      ### أنماط ملحوظة
      [اذكر 2-3 أنماط رئيسية لاحظتها. على سبيل المثال: "لوحظ ميل لارتفاع السكر بعد وجبات الغداء." أو "قراءات الصباح كانت مستقرة في معظم الأيام."]

      ### نقاط إيجابية
      [اذكر نقطة إيجابية واحدة على الأقل، مثل "استقرار السكر خلال الليل" أو "قلة نوبات الهبوط الحاد."]
      
      ### نقاط للمتابعة
      [اذكر نقطة أو اثنتين يمكن لولي الأمر مناقشتها مع الطبيب، مثل "تكرار الارتفاعات في فترة المساء."]
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing report data:", error);
    return "عذراً، حدث خطأ أثناء تحليل البيانات. يرجى المحاولة مرة أخرى.";
  }
};


export const generateProactiveInsights = async (data: object): Promise<ProactiveInsight[]> => {
  try {
    const model = 'gemini-2.5-pro';
    const dataString = JSON.stringify(data, null, 2);

    const prompt = `
      أنت محلل بيانات متخصص في سكري الأطفال. مهمتك هي تحليل البيانات الصحية التالية للطفل بشكل استباقي وتحديد 1-2 من الأنماط أو الملاحظات الأكثر أهمية التي يجب على ولي الأمر الانتباه إليها.
      لا تقدم نصائح طبية مباشرة. ركز على تسليط الضوء على الأنماط التي قد تحتاج إلى مزيد من الاهتمام أو المناقشة مع الطبيب.
      كن إيجابيًا وداعمًا في لهجتك.
      
      البيانات (آخر 7 أيام):
      \`\`\`json
      ${dataString}
      \`\`\`
      
      الأنماط التي يجب البحث عنها:
      - ارتفاعات متكررة بعد وجبة معينة (فطور، غداء، عشاء).
      - هبوطات متكررة في وقت معين من اليوم (مثلاً، بعد الظهر، أثناء الليل).
      - استقرار جيد ومستمر في مستويات السكر.
      - تأثير واضح للتمارين الرياضية على مستويات السكر.
      - عدم وجود بيانات كافية ليوم معين.

      المطلوب:
      قم بإرجاع مصفوفة JSON تحتوي على 1 أو 2 من أهم الملاحظات.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'معرف فريد للملاحظة' },
              message: { type: Type.STRING, description: 'الرسالة التي ستعرض لولي الأمر' },
              type: { type: Type.STRING, description: 'نوع الملاحظة: warning, info, or success' },
            },
            required: ['id', 'message', 'type'],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    if (jsonText) {
        return JSON.parse(jsonText);
    }
    return [];

  } catch (error) {
    console.error("Error generating proactive insights:", error);
    return [{
        id: 'error_insight',
        message: 'لم نتمكن من تحليل البيانات للحصول على رؤى ذكية في الوقت الحالي.',
        type: 'warning'
    }];
  }
};


export const analyzeNutritionLabel = async (base64Image: string): Promise<Partial<FoodItem>> => {
    try {
        const model = 'gemini-2.5-flash';
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = {
            text: 'Analyze this nutrition label image and extract the nutritional information. The label is in Arabic. Provide the response in a structured JSON format. Focus on values per 100g if available, otherwise specify the serving size you are using.',
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        servingSize: { type: Type.STRING, description: "Serving size in grams or ml, e.g., '100g' or '240ml'. Find the value for 100g if possible." },
                        calories: { type: Type.NUMBER },
                        totalFat: { type: Type.NUMBER },
                        sodium: { type: Type.NUMBER },
                        totalCarbohydrate: { type: Type.NUMBER },
                        dietaryFiber: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) return {};

        const parsedData = JSON.parse(jsonText);
        // Try to figure out if the data is per 100g or per serving and scale accordingly.
        const servingGrams = parseFloat(parsedData.servingSize?.match(/(\d+)/)?.[0] || '100') || 100;
        const scale = 100 / servingGrams;

        // If scale is 1, data is already per 100g.
        // If scale is not 1, we scale the values up/down to be per 100g.
        return {
            carbs: (parsedData.totalCarbohydrate || 0) * scale,
            calories: (parsedData.calories || 0) * scale,
            fiber: (parsedData.dietaryFiber || 0) * scale,
            sodium: (parsedData.sodium || 0) * scale,
            protein: (parsedData.protein || 0) * scale,
            fat: (parsedData.totalFat || 0) * scale,
        };

    } catch (error) {
        console.error("Error analyzing nutrition label:", error);
        return {};
    }
};

export const generateGlucosePrediction = async (recentData: object): Promise<GlucosePrediction> => {
    try {
        const model = 'gemini-2.5-pro';
        const prompt = `
            أنت خبير في التنبؤ بمستويات سكر الدم للأطفال. بناءً على البيانات الصحية الأخيرة (آخر 3-6 ساعات)، قم بتوقع الاتجاه العام لسكر الدم خلال الساعة القادمة.
            
            البيانات:
            \`\`\`json
            ${JSON.stringify(recentData, null, 2)}
            \`\`\`

            المطلوب:
            قم بإرجاع كائن JSON يصف الاتجاه المتوقع، ورسالة نصية قصيرة وواضحة باللغة العربية، ومصفوفة من 4 نقاط بيانات متوقعة للـ 60 دقيقة القادمة (عند 15, 30, 45, 60 دقيقة).
            ابدأ من آخر قيمة سكر مسجلة.
            الاتجاهات الممكنة هي: 'rising', 'falling', 'stable'.
            الرسالة يجب أن تكون سهلة الفهم لولي الأمر، مثل "من المتوقع أن يظل مستوى السكر مستقرًا." أو "هناك ميل لارتفاع السكر، قد يحتاج الأمر للمراقبة.".
        `;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trend: { type: Type.STRING, description: "The predicted trend: 'rising', 'falling', or 'stable'." },
                        message: { type: Type.STRING, description: "A user-friendly message in Arabic." },
                        predictedValues: {
                            type: Type.ARRAY,
                            description: "An array of 4 predicted glucose values in mg/dL for the next 60 minutes at 15-minute intervals.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "ISO string for the future time" },
                                    value: { type: Type.NUMBER, description: "Predicted glucose value in mg/dL" }
                                },
                                required: ['time', 'value']
                            }
                        }
                    },
                    required: ['trend', 'message', 'predictedValues'],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating glucose prediction:", error);
        return { trend: 'stable', message: 'تعذر التنبؤ بالاتجاه حاليًا.', predictedValues: [] };
    }
};

export const suggestMeal = async (
    profile: ChildProfile, 
    foodItems: FoodItem[], 
    carbRange: { min: number, max: number },
    mealType: string
): Promise<MealTemplateItem[]> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
            أنت خبير تغذية متخصص في سكري الأطفال. مهمتك هي اقتراح وجبة (${mealType}) لطفل بناءً على بياناته ومكتبة الطعام المتاحة.

            بيانات الطفل:
            - الحساسية: ${profile.allergies.join(', ') || 'لا يوجد'}
            - الحمية المتبعة: ${profile.diet || 'لا يوجد'}
            - أطعمة مفضلة (IDs): ${profile.foodPreferences.preferred.join(', ')}
            - أطعمة غير مفضلة (IDs): ${profile.foodPreferences.disliked.join(', ')}

            نطاق الكربوهيدرات المستهدف للوجبة: من ${carbRange.min} إلى ${carbRange.max} جرام.

            مكتبة الأصناف الغذائية المتاحة (JSON):
            \`\`\`json
            ${JSON.stringify(foodItems.map(f => ({id: f.id, name: f.name, carbs: f.carbs, servingOptions: f.servingOptions, allergens: f.allergens, suitableDiets: f.suitableDiets, protein: f.protein, fat: f.fat})) , null, 2)}
            \`\`\`

            المطلوب:
            1. اختر 2-4 أصناف من المكتبة لتكوين وجبة متوازنة.
            2. يجب أن تكون الوجبة خالية من مسببات الحساسية المسجلة للطفل.
            3. يجب أن تتوافق مع الحمية الغذائية للطفل (إن وجدت).
            4. حاول تضمين صنف واحد مفضل على الأقل.
            5. تجنب تمامًا الأصناف غير المفضلة.
            6. احسب الكميات بدقة بحيث يكون إجمالي الكربوهيدرات ضمن النطاق المستهدف.
            7. قم بإرجاع النتيجة كـ JSON array فقط، بدون أي نص إضافي.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            foodId: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            servingName: { type: Type.STRING },
                        },
                        required: ['foodId', 'quantity', 'servingName'],
                    },
                },
            },
        });
        
        return JSON.parse(response.text.trim());

    } catch (error) {
        console.error("Error suggesting meal:", error);
        return [];
    }
};

export const processVoiceCommand = async (command: string): Promise<VoiceCommand> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
            حلل الأمر الصوتي التالي باللغة العربية وحدد النية والكيانات.
            الأمر: "${command}"

            النيات الممكنة هي 'log' (لتسجيل البيانات) و 'query' (لطرح سؤال).
            الكيانات الممكنة هي نوع السجل (sugar, insulin)، القيمة الرقمية، الوحدات، نوع الأنسولين، أو نص السؤال.

            أمثلة:
            - "سجل سكر 120" -> {"intent": "log", "logType": "sugar", "value": 120}
            - "جرعة 5 وحدات أنسولين سريع" -> {"intent": "log", "logType": "insulin", "units": 5, "insulinType": "bolus"}
            - "ما هو متوسط السكر أمس؟" -> {"intent": "query", "query": "ما هو متوسط السكر أمس؟"}

            إذا لم تكن النية واضحة، أرجع {"intent": "unknown"}.
            قم بإرجاع النتيجة ككائن JSON فقط.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intent: { type: Type.STRING },
                        logType: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                        units: { type: Type.NUMBER },
                        insulinType: { type: Type.STRING },
                        query: { type: Type.STRING },
                    },
                    required: ['intent'],
                },
            },
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error processing voice command:", error);
        return { intent: 'unknown' };
    }
};
