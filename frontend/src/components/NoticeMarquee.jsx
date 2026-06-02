import React from 'react';
import { useEvents } from '../context/EventContext';

export default function NoticeMarquee() {
  const { notices } = useEvents();

  if (!notices || notices.length === 0) return null;

  return (
    <div className="w-full bg-[#121829]/40 border-b border-white/5 py-2 px-6 flex items-center gap-4 overflow-hidden h-[40px]">
      <div className="bg-gradient-to-r from-violet-600 to-cyan-500 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded shadow-[0_0_10px_rgba(139,92,246,0.3)] shrink-0 font-title">
        bulletin board
      </div>
      <div className="overflow-hidden relative flex-1">
        <div className="inline-block whitespace-nowrap animate-marquee text-xs font-semibold tracking-wide text-gray-200">
          {notices.map((notice, idx) => (
            <span key={idx} className="mr-16 relative after:content-['✦'] after:absolute after:-right-9 after:text-cyan-400">
              {notice}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
