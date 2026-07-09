import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">

      <h1 className="text-6xl font-extrabold mb-4 tracking-tighter drop-shadow-md">
        Welcome to <span className="text-primary">CIVIC</span>
      </h1>

      <p className="text-zinc-400 text-lg mb-10 max-w-md">
        Make your voice heard. Report local issues, discuss with your community, and hold officials accountable.
      </p>

      <div className="flex gap-4">
        <Link
          href="/feed"
          className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
        >
          Enter the Feed
        </Link>

        <Link
          href="/login"
          className="bg-zinc-900 border border-zinc-700 text-white font-bold px-8 py-4 rounded-full hover:bg-zinc-800 transition-colors"
        >
          Login
        </Link>
      </div>

    </div>
  );
}
