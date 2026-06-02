import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle, FaAward, FaBuilding, FaThLarge, FaCalendarAlt, FaFileExport } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const { events } = useEvents();
  const navigate = useNavigate();

  // Export Analytics Reports as CSV download in browser
  const handleExportCSVReport = () => {
    try {
      const csvHeader = 'Event Title,Category,Date,Time,Status,Organizer Roll,Registered Students Count,Satisfaction Percentage\n';
      const csvRows = events.map(evt => {
        let percentage = 'N/A';
        if (evt.status === 'Completed' && evt.feedbacks?.length > 0) {
          const totalStars = evt.feedbacks.reduce((sum, f) => sum + f.rating, 0);
          percentage = Math.round((totalStars / (evt.feedbacks.length * 5)) * 100) + '%';
        }
        return `"${evt.title}","${evt.category}","${evt.date}","${evt.time}","${evt.status}","${evt.organizerRoll || 'none'}",${evt.registeredStudents?.length || 0},"${percentage}"`;
      }).join('\n');

      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Apex_College_Event_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Event analytics CSV report downloaded successfully!');
    } catch (err) {
      toast.error('Error generating report.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col antialiased relative overflow-hidden p-6 md:p-12">
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 z-50 bg-[#080b11]/80 border border-white/5 rounded-full px-4 py-2 text-xs font-bold text-white flex items-center gap-2 hover:bg-neon-purple hover:border-neon-purple hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer select-none"
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      <div className="max-w-4xl w-full mx-auto mt-16 flex flex-col gap-8 z-10">
        
        {/* Profile Header Widget */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
          <FaUserCircle className="text-6xl text-neon-purple shrink-0 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.2)]" />
          <div className="text-center md:text-left flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold font-title tracking-tight text-white mb-1">
              {user.name}
            </h2>
            <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded">
              {user.role}
            </span>
          </div>

          {(user.role === 'superadmin' || user.role === 'coordinator') && (
            <button 
              onClick={handleExportCSVReport}
              className="py-2.5 px-4 bg-neon-cyan hover:bg-[#0097b2] rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <FaFileExport /> Export CSV Report
            </button>
          )}
        </div>

        {/* Dynamic Parameter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Student Profile Specs */}
          {user.role === 'student' && (
            <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col gap-4">
              <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase font-title border-b border-white/5 pb-3">
                Academic Student Record
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide">Roll Number</span>
                  <span className="font-bold text-white font-title">{user.rollNo}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide">Email Address</span>
                  <span className="font-bold text-white font-title">{user.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide flex items-center gap-1"><FaBuilding className="text-neon-cyan" /> Department</span>
                  <span className="font-bold text-white font-title">{user.department}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide flex items-center gap-1"><FaThLarge className="text-neon-cyan" /> Section</span>
                  <span className="font-bold text-white font-title">Section {user.section}</span>
                </div>
                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide flex items-center gap-1"><FaCalendarAlt className="text-neon-purple" /> BTech Admission Year</span>
                  <span className="font-bold text-white font-title">{user.admissionYear}</span>
                </div>
                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide flex items-center gap-1"><FaCalendarAlt className="text-neon-purple" /> Graduation Year Expiry</span>
                  <span className="font-bold text-neon-cyan font-title">{user.gradYear}</span>
                </div>
              </div>
            </div>
          )}

          {/* Organizer Badges collection */}
          {user.role === 'student' && (
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase font-title border-b border-white/5 pb-3 flex items-center gap-1">
                <FaAward className="text-neon-purple" /> Organizer Awards
              </h3>
              
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {!user.badges || user.badges.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 py-10 font-semibold italic">
                    No badges earned yet.
                  </div>
                ) : (
                  user.badges.map((b, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-gradient-to-r from-violet-600/5 to-cyan-500/5 border border-white/5 rounded-xl flex justify-between items-center text-xs"
                    >
                      <span className="font-bold text-white truncate max-w-[180px]">{b.badgeName}</span>
                      <span className="font-extrabold text-neon-cyan font-title shrink-0">{b.rating}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Coordinator / Super Admin Profile Specs */}
          {user.role !== 'student' && (
            <div className="glass-panel p-6 rounded-2xl col-span-full flex flex-col gap-4">
              <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase font-title border-b border-white/5 pb-3">
                Academic Staff Record
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide">Username</span>
                  <span className="font-bold text-white font-title text-sm">{user.username || 'admin'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-semibold uppercase text-[9px] tracking-wide">Staff Name</span>
                  <span className="font-bold text-white font-title text-sm">{user.name}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
