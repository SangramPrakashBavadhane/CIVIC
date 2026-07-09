'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const postId = unwrappedParams.id;
    const router = useRouter();

    const { data: session } = useSession();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setPost(data.post);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText }),
            });
            if (res.ok) {
                setCommentText('');
                fetchPost();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchPost();
            } else {
                alert("You don't have permission to do this.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleVote = async (type: 'agree' | 'disagree') => {
        try {
            const res = await fetch(`/api/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });
            if (res.ok) {
                fetchPost();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this issue?')) return;
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push('/feed');
            } else {
                alert('Failed to delete post');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    );

    if (!post) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <p>Post not found</p>
        </div>
    );

    const userRole = session?.user?.role?.toLowerCase();
    const isOfficer = (userRole === 'offl1' && post.postedIn === 'area') || (userRole === 'offl2' && post.postedIn === 'state');

    return (
        <div className="min-h-screen bg-black text-white pb-20 pt-8 flex flex-col items-center px-4">

            {/* THE REELS CARD */}
            <div className="relative w-full max-w-md aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex-shrink-0">

                {/* Background Media */}
                {post.mediaType === 'video' && post.mediaUrl ? (
                    <video src={post.mediaUrl} controls autoPlay loop className="absolute inset-0 w-full h-full object-cover" />
                ) : post.mediaType === 'image' && post.mediaUrl ? (
                    <img src={post.mediaUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <span className="text-zinc-500 font-bold text-4xl mb-4">CIVIC</span>
                    </div>
                )}

                {/* Gradient Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom Info Section */}
                <div className="absolute bottom-0 left-0 right-16 p-4 pb-6 z-10 flex flex-col justify-end pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profile/${post.author?._id}`} className="font-bold text-lg hover:underline drop-shadow-md">
                            @{post.author?.name || 'Anonymous'}
                        </Link>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/90 text-primary-foreground">
                            {post.status}
                        </span>
                    </div>

                    <h2 className="font-bold text-xl leading-tight mb-2 drop-shadow-md">{post.title}</h2>
                    <p className="text-sm text-gray-200 line-clamp-3 drop-shadow-md">{post.description}</p>
                </div>

                {/* Right Side Buttons */}
                <div className="absolute bottom-6 right-2 w-14 flex flex-col items-center justify-end space-y-6 z-10 pointer-events-auto pb-4">
                    <div className="flex flex-col items-center">
                        <button onClick={() => handleVote('agree')} className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                            <img src="/SVGrepo/thumbs-up-svgrepo-com.svg" alt="Agree" className="w-6 h-6 drop-shadow-lg pointer-events-none invert" />
                        </button>
                        <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{post.agrees}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button onClick={() => handleVote('disagree')} className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                            <img src="/SVGrepo/thumbs-down-svgrepo-com.svg" alt="Disagree" className="w-6 h-6 drop-shadow-lg pointer-events-none invert" />
                        </button>
                        <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{post.disagrees}</span>
                    </div>
                </div>
            </div>

            {/* EVERYTHING UNDERNEATH THE CARD */}
            <div className="w-full max-w-md mt-6 space-y-6">

                {/* Officer Controls */}
                {isOfficer && (
                    <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-xl">
                        <h3 className="text-destructive font-bold mb-3 flex items-center gap-2">
                            <span>🛡️</span> Officer Status Update
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleStatusChange('NotSeen')} className="bg-zinc-900 text-xs py-2 rounded-lg border border-zinc-700">Not Seen</button>
                            <button onClick={() => handleStatusChange('TakenIntoConsideration')} className="bg-blue-900/40 text-xs py-2 rounded-lg border border-blue-700/50 text-blue-400">In Consideration</button>
                            <button onClick={() => handleStatusChange('WorkStarted')} className="bg-yellow-900/40 text-xs py-2 rounded-lg border border-yellow-700/50 text-yellow-400">Work Started</button>
                            <button onClick={() => handleStatusChange('Declined')} className="bg-red-900/40 text-xs py-2 rounded-lg border border-red-700/50 text-red-400">Declined</button>
                        </div>
                    </div>
                )}

                {/* Author Controls */}
                {session?.user?.id === post.author?._id && (
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center shadow-xl">
                        <span className="text-sm text-zinc-400 font-medium">You reported this issue</span>
                        <button 
                            onClick={handleDelete}
                            className="bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                            Delete Issue
                        </button>
                    </div>
                )}

                {/* Comments Section */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-lg mb-4">Discussion ({post.comments?.length || 0})</h3>

                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                        {!post.comments || post.comments.length === 0 ? (
                            <p className="text-zinc-500 italic text-center py-4">No comments yet. Be the first!</p>
                        ) : (
                            post.comments.map((c: any, i: number) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-zinc-400 mt-1">
                                        {c.authorName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="bg-zinc-950 p-3 rounded-2xl rounded-tl-sm text-sm border border-zinc-800 w-full">
                                        <span className="font-bold text-zinc-300 mr-2">@{c.authorName}</span>
                                        <span className="text-zinc-200">{c.text}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleComment} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !commentText.trim()}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold disabled:opacity-50"
                        >
                            {isSubmitting ? '...' : 'Post'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
