import React, { useRef } from 'react';
import { useEvents } from '../context/EventContext';
import { FaCrown, FaTrophy } from 'react-icons/fa';
import confetti from 'canvas-confetti';

export default function WinnersMarquee() {
  const { events } = useEvents();
  const completedEvents = events.filter(e => e.status === 'Completed' && e.winners && e.winners.length > 0);
  const containerRef = useRef(null);

  // Multicolored confetti blasts
  const handleConfettiBlast = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Continuous streams
  const handleConfettiStream = () => {
    const duration = 0.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  if (completedEvents.length === 0) return null;

  return (
    <div className="mb-10 p-6 bg-gradient-to-br from-[#141a2a]/80 to-[#0a0c16]/80 border border-white/5 rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-50%,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-5 relative z-10">
        <h3 className="flex items-center gap-2 text-md font-bold text-neon-amber font-title">
          <FaCrown className="animate-bounce text-lg" /> BTech Event Champions Wall
        </h3>
        <span className="text-[10px] text-gray-500 font-semibold tracking-wide">
          Hover or click a card to celebrate!
        </span>
      </div>

      <div 
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin select-none"
      >
        {completedEvents.map(evt => 
          evt.winners.map((winner, idx) => {
            let rankBg = 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] text-black';
            if (winner.rank === 2) rankBg = 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-[0_0_10px_rgba(200,200,200,0.2)] text-white';
            if (winner.rank === 3) rankBg = 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-[0_0_10px_rgba(150,75,0,0.2)] text-white';

            return (
              <div 
                key={`${evt._id}-${idx}`}
                onClick={handleConfettiBlast}
                onMouseEnter={handleConfettiStream}
                className="flex-shrink-0 w-[280px] bg-white/[0.02] border border-white/5 hover:border-neon-amber/40 hover:bg-neon-amber/[0.04] p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)] relative group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm font-title ${rankBg}`}>
                  {winner.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate group-hover:text-neon-amber transition-colors">
                    {winner.name}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {winner.roll}
                  </div>
                  <div className="text-[10px] text-neon-amber font-semibold mt-1 flex items-center gap-1">
                    <FaTrophy className="text-xs" /> {evt.title}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
