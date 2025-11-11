import React from 'react';
import { DUMMY_AWARENESS_ARTICLES } from '../constants';
import { BookOpenIcon } from './Icons';

const ArticleCard: React.FC<{ article: (typeof DUMMY_AWARENESS_ARTICLES)[0] }> = ({ article }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
            <div className="p-6">
                <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-full">{article.category}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-3 mb-2">{article.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{article.excerpt}</p>
                <button className="text-teal-600 font-semibold mt-4 text-sm hover:underline">اقرأ المزيد...</button>
            </div>
        </div>
    );
};

export const AwarenessPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <BookOpenIcon className="w-10 h-10 text-teal-500" />
                <h1 className="text-3xl font-bold text-slate-800">مجلة التوعية</h1>
            </div>

            <p className="text-lg text-slate-600 max-w-3xl">
                مكتبة من المقالات والنصائح السريعة لمساعدتك في رحلة إدارة سكري طفلك. كلمات خفيفة ومعلومات مفيدة لتكون دائمًا على اطلاع.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {DUMMY_AWARENESS_ARTICLES.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
};