'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';


export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isOwnProfile = (session?.user as any)?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>User not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* USER INFO HEADER */}
      <div className="max-w-2xl mx-auto pt-12 px-4 sm:px-6 border-b border-zinc-800 pb-8 relative">
        {isOwnProfile && (
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="absolute top-4 right-4 text-xs font-bold text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors border border-zinc-700"
          >
            Sign Out
          </button>
        )}
        <div className="flex items-center space-x-6">
          {/* Default Avatar */}
          <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-4xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-3xl font-extrabold">{profile.name}</h1>
            <p className="text-zinc-400 mt-1">
              📍 {profile.location.area}, {profile.location.state}
            </p>
            <div className="mt-3 flex space-x-3">
              <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-semibold text-zinc-300">
                {profile.role.toUpperCase()}
              </span>
              <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-semibold text-zinc-300">
                {profile.posts?.length || 0} Posts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* USER'S POSTS GRID */}
      <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-6">Issues Reported</h2>

        {profile.posts && profile.posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {profile.posts.map((post: any) => (
              <Link key={post._id} href={`/post/${post._id}`} className="aspect-square relative group block overflow-hidden bg-zinc-900">
                {/* Thumbnail */}
                {post.mediaType === 'video' && post.mediaUrl ? (
                  <video src={post.mediaUrl} className="w-full h-full object-cover" />
                ) : post.mediaType === 'image' && post.mediaUrl ? (
                  <img src={post.mediaUrl} className="w-full h-full object-cover" alt={post.title} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <span className="text-zinc-500 font-bold text-lg mb-2">CIVIC</span>
                    <p className="text-xs text-zinc-400 line-clamp-3">{post.title}</p>
                  </div>
                )}

                {/* Hover Info */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <span className="font-bold text-sm mb-1">{post.agrees} 🔥</span>
                  <span className="text-xs">{post.status}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900 rounded-xl">
            <p className="text-zinc-500">This user hasn't posted anything yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}