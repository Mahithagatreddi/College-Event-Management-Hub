import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaCheck, FaTimes, FaEnvelopeOpen } from 'react-icons/fa';

export default function NotificationCenter() {
  const { notifications, markAsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center relative hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
      >
        <FaBell className={`text-sm ${unreadCount > 0 ? 'text-neon-purple animate-swing' : 'text-gray-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-rose text-[9px] font-extrabold text-white rounded-full flex items-center justify-center font-title border border-[#080b10]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[340px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animation-fadeIn">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-title">
                Notifications Center
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] text-neon-purple font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                  <FaEnvelopeOpen className="text-xl text-gray-600" />
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n._id}
                    className={`p-4 border-b border-white/5 flex justify-between gap-3 items-start transition-colors duration-300 ${n.read ? 'opacity-60 bg-transparent' : 'bg-neon-purple/[0.02] hover:bg-white/[0.01]'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-neon-rose flex-shrink-0" />}
                        <h5 className="font-semibold text-xs text-white truncate">
                          {n.title}
                        </h5>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n._id)}
                        className="p-1 rounded bg-white/5 hover:bg-neon-emerald/20 text-gray-400 hover:text-neon-emerald transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck className="text-[9px]" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
