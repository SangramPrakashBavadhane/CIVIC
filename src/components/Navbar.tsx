'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Hide the navbar on login/register pages
    if (pathname === '/login' || pathname === '/register' || pathname === '/') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-zinc-800 pb-safe">
            <div className="max-w-md mx-auto flex justify-around items-center h-16 px-6">

                {/* Home / Feed */}
                <Link href="/feed" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                    <img src="/SVGrepo/home-svgrepo-com.svg" alt="Home" className={`w-7 h-7 invert ${pathname === '/feed' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`} />
                    <span className={`text-[10px] font-bold ${pathname === '/feed' ? 'text-white' : 'text-zinc-500'}`}>Home</span>
                </Link>

                {/* Create Issue (The Big Button) */}
                <Link href="/create" className="flex flex-col items-center justify-center -mt-6">
                    <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                        <img src="/SVGrepo/plus-circle-svgrepo-com.svg" alt="Create" className="w-8 h-8 invert" />
                    </div>
                </Link>

                {/* Profile */}
                <Link
                    href={(session?.user as any)?.id ? `/profile/${(session?.user as any).id}` : '/login'}
                    className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                    <img src="/SVGrepo/user-round-svgrepo-com.svg" alt="Profile" className={`w-7 h-7 invert ${pathname.includes('/profile') ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`} />
                    <span className={`text-[10px] font-bold ${pathname.includes('/profile') ? 'text-white' : 'text-zinc-500'}`}>Profile</span>
                </Link>

            </div>
        </nav>
    );
}
