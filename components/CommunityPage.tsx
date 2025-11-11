
import React, { useState, useMemo } from 'react';
import { CommunityPost, CommunityReply, ParentProfile } from '../types';
import { MessageCircleIcon, PlusCircleIcon } from './Icons';

interface CommunityPageProps {
    posts: CommunityPost[];
    replies: CommunityReply[];
    currentUser: ParentProfile;
    onAddPost: (title: string, content: string) => void;
    onAddReply: (postId: number, content: string) => void;
}

const PostCard: React.FC<{ 
    post: CommunityPost, 
    replies: CommunityReply[], 
    onSelect: () => void,
    onAddReply: (postId: number, content: string) => void,
    currentUser: ParentProfile,
}> = ({ post, replies, onSelect, onAddReply, currentUser }) => {
    const [replyContent, setReplyContent] = useState('');

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim()) {
            onAddReply(post.id, replyContent);
            setReplyContent('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-start gap-4 mb-4">
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-12 h-12 rounded-full" />
                <div>
                    <h3 className="text-lg font-bold text-slate-800 cursor-pointer hover:text-teal-600" onClick={onSelect}>
                        {post.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                        بواسطة {post.authorName} - {new Date(post.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
            
            <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-sm mb-3 text-slate-600">الردود ({replies.length})</h4>
                <div className="space-y-4">
                    {replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-3">
                            <img src={reply.authorAvatarUrl} alt={reply.authorName} className="w-8 h-8 rounded-full" />
                            <div className="bg-slate-50 p-3 rounded-lg flex-1">
                                <p className="font-semibold text-sm text-slate-800">{reply.authorName}</p>
                                <p className="text-sm text-slate-600">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <form onSubmit={handleReplySubmit} className="mt-4 flex items-start gap-3">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="أضف ردك..."
                            className="w-full p-2 border rounded-md"
                            rows={2}
                        />
                        <button type="submit" className="mt-2 bg-teal-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-teal-600 transition">إرسال الرد</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const CommunityPage: React.FC<CommunityPageProps> = ({ posts, replies, currentUser, onAddPost, onAddReply }) => {
    const [showForm, setShowForm] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPostTitle.trim() && newPostContent.trim()) {
            onAddPost(newPostTitle, newPostContent);
            setNewPostTitle('');
            setNewPostContent('');
            setShowForm(false);
        }
    };
    
    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <MessageCircleIcon className="w-10 h-10 text-teal-500" />
                    <h1 className="text-3xl font-bold text-slate-800">مجتمع الدعم</h1>
                </div>
                <button
                    onClick={() => setShowForm(prev => !prev)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>{showForm ? 'إغلاق النموذج' : 'إنشاء موضوع جديد'}</span>
                </button>
            </div>
            
            <p className="text-slate-600 max-w-3xl">
                مكان آمن لتبادل الخبرات والنصائح مع أولياء أمور آخرين يمرون بنفس التجربة. شارك قصتك، اطرح الأسئلة، واحصل على الدعم.
            </p>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">إنشاء موضوع جديد</h2>
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="postTitle" className="block text-sm font-medium text-slate-600 mb-1">عنوان الموضوع</label>
                            <input
                                id="postTitle"
                                type="text"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="postContent" className="block text-sm font-medium text-slate-600 mb-1">محتوى الموضوع</label>
                            <textarea
                                id="postContent"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows={5}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200">إلغاء</button>
                            <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">نشر الموضوع</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        replies={replies.filter(r => r.postId === post.id)}
                        onSelect={() => {}} // Placeholder for expanding post details view
                        onAddReply={onAddReply}
                        currentUser={currentUser}
                    />
                ))}
            </div>

        </div>
    );
};
