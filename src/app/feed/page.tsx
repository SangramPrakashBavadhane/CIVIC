'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Author {
    _id: string;
    name: string;
}

interface Post {
    _id: string;
    title: string;
    description: string;
    agrees: number;
    disagrees: number;
    status: string;
    trendingScore: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'none';
    author?: Author;
    postedIn: string;
}

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState<'area' | 'state'>('area');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    const fetchPosts = async (currentPage: number, currentTab: string) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        
        try {
            const res = await fetch(`/api/feed?tab=${currentTab}&page=${currentPage}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(prev => currentPage === 1 ? data.posts : [...prev, ...data.posts]);
                setHasMore(data.hasMore);
            }
        } catch (err) {
            console.error('Failed to fetch posts');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchPosts(1, activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page, activeTab);
        }
    }, [page]);

    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        }, { root: null, rootMargin: '0px', threshold: 0.5 });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const handleVote = async (postId: string, type: 'agree' | 'disagree') => {
        try {
            const res = await fetch(`/api/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(currentPosts => 
                    currentPosts.map(p => 
                        p._id === postId 
                            ? { ...p, agrees: data.agrees, disagrees: data.disagrees } 
                            : p
                    )
                );
            }
        } catch (err) {
            console.error('Failed to vote');
        }
    };

    const handleStatusChange = async (postId: string, newStatus: string) => {
        if (!confirm(`Change status to ${newStatus}?`)) return;
        try {
            const res = await fetch(`/api/posts/${postId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setPosts(currentPosts => 
                    currentPosts.map(p => 
                        p._id === postId 
                            ? { ...p, status: newStatus } 
                            : p
                    )
                );
                setActiveDropdown(null);
            } else {
                alert("You don't have permission to do this.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-black flex justify-center relative overflow-hidden">
            <div className="absolute top-4 left-0 right-0 z-50 flex justify-center space-x-6 text-white font-semibold drop-shadow-md">
                <button 
                    onClick={() => setActiveTab('area')} 
                    className={`transition-all ${activeTab === 'area' ? 'text-white border-b-2 border-white' : 'text-white/60 hover:text-white'}`}
                >
                    Area
                </button>
                <button 
                    onClick={() => setActiveTab('state')} 
                    className={`transition-all ${activeTab === 'state' ? 'text-white border-b-2 border-white' : 'text-white/60 hover:text-white'}`}
                >
                    State
                </button>
            </div>

            <div className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-zinc-900 relative">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white p-8 text-center space-y-4">
                        <p className="text-xl font-bold">No issues reported here.</p>
                        <Link href="/create" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold">
                            Report an Issue
                        </Link>
                    </div>
                ) : (
                    posts.map((post, index) => {
                        const isAuthorizedOfficer = (userRole === 'offl1' && post.postedIn === 'area') || (userRole === 'offl2' && post.postedIn === 'state');
                        return (
                        <div 
                            key={post._id} 
                            ref={index === posts.length - 1 ? lastPostElementRef : null} 
                            className="w-full h-full snap-start snap-always relative flex-shrink-0"
                        >
                            {post.mediaType === 'video' && post.mediaUrl ? (
                                <video 
                                    src={post.mediaUrl} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="absolute inset-0 w-full h-full object-cover" 
                                />
                            ) : post.mediaType === 'image' && post.mediaUrl ? (
                                <img 
                                    src={post.mediaUrl} 
                                    className="absolute inset-0 w-full h-full object-cover" 
                                    alt="Issue media"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                    <span className="text-zinc-600 font-bold text-4xl">CIVIC</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                            <div className="absolute bottom-0 left-0 right-16 p-4 pb-6 text-white z-10 flex flex-col justify-end pointer-events-auto">
                                <div className="flex items-center gap-2 mb-1">
                                    <Link href={`/profile/${post.author?._id}`} className="font-bold text-lg hover:underline drop-shadow-md">
                                        @{post.author?.name || 'Anonymous'}
                                    </Link>
                                    <div className="relative">
                                        <button 
                                            onClick={() => isAuthorizedOfficer && setActiveDropdown(activeDropdown === post._id ? null : post._id)}
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/90 text-primary-foreground ${isAuthorizedOfficer ? 'cursor-pointer hover:bg-primary' : 'cursor-default'}`}
                                        >
                                            {post.status} {isAuthorizedOfficer && '▼'}
                                        </button>

                                        {isAuthorizedOfficer && activeDropdown === post._id && (
                                            <div className="absolute bottom-full left-0 mb-2 w-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50">
                                                <button onClick={() => handleStatusChange(post._id, 'NotSeen')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-white border-b border-zinc-800">Not Seen</button>
                                                <button onClick={() => handleStatusChange(post._id, 'TakenIntoConsideration')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-blue-400 border-b border-zinc-800">In Consideration</button>
                                                <button onClick={() => handleStatusChange(post._id, 'WorkStarted')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-yellow-400 border-b border-zinc-800">Work Started</button>
                                                <button onClick={() => handleStatusChange(post._id, 'Declined')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-red-400">Declined</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <h2 className="font-bold text-xl leading-tight mb-2 drop-shadow-md">{post.title}</h2>
                                <p className="text-sm text-gray-200 line-clamp-3 drop-shadow-md">{post.description}</p>
                            </div>

                            <div className="absolute bottom-6 right-2 w-14 flex flex-col items-center justify-end space-y-6 z-10 pointer-events-auto pb-4">
                                
                                <button onClick={() => handleVote(post._id, 'agree')} className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform">
                                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-green-500/80 transition-colors">
                                        <img src="/SVGrepo/thumbs-up-svgrepo-com.svg" alt="Agree" className="w-6 h-6 drop-shadow-lg pointer-events-none invert" />
                                    </div>
                                    <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{post.agrees}</span>
                                </button>

                                <button onClick={() => handleVote(post._id, 'disagree')} className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform">
                                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-red-500/80 transition-colors">
                                        <img src="/SVGrepo/thumbs-down-svgrepo-com.svg" alt="Disagree" className="w-6 h-6 drop-shadow-lg pointer-events-none invert" />
                                    </div>
                                    <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{post.disagrees}</span>
                                </button>

                                <Link href={`/post/${post._id}`} className="flex flex-col items-center group">
                                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                        <img src="/SVGrepo/message-square-svgrepo-com.svg" alt="Discuss" className="w-5 h-5 drop-shadow-lg invert" />
                                    </div>
                                    <span className="text-white text-[10px] font-bold mt-1 drop-shadow-md">Discuss</span>
                                </Link>

                            </div>
                        </div>
                    )})
                )}
                {loadingMore && (
                    <div className="w-full h-20 snap-start flex items-center justify-center flex-shrink-0 py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
