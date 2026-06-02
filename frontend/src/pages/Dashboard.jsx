import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import NoticeMarquee from '../components/NoticeMarquee';
import WinnersMarquee from '../components/WinnersMarquee';
import StatsSection from '../components/StatsSection';
import CalendarGrid from '../components/CalendarGrid';
import NotificationCenter from '../components/NotificationCenter';
import { FaGraduationCap, FaHome, FaCalendarAlt, FaPaperPlane, FaInbox, FaUsersCog, FaSignOutAlt, FaSearch, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout, getAuthHeaders } = useAuth();
  const { 
    events, 
    proposals, 
    submitProposal, 
    approveProposal, 
    rejectProposal, 
    createEventPage,
    postScrollingNotice, 
    fetchProposals,
    deleteEvent
  } = useEvents();

  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('home');

  // Search & Filtering States
  const [search, setSearch] = useState('');
  const [categoryTab, setCategoryTab] = useState('all');
  
  // Proposals submission state
  const [propTitle, setPropTitle] = useState('');
  const [propCategory, setPropCategory] = useState('Technical');
  const [propSummary, setPropSummary] = useState('');
  const [propDesc, setPropDesc] = useState('');

  // Coordinator scheduling state
  const [schedModalOpen, setSchedModalOpen] = useState(false);
  const [schedProposal, setSchedProposal] = useState(null);
  const [schedDate, setSchedDate] = useState('2026-06-10');
  const [schedTime, setSchedTime] = useState('10:00');

  // Coordinator notices input state
  const [noticeInput, setNoticeInput] = useState('');

  // Coordinator direct event creation state
  const [directTitle, setDirectTitle] = useState('');
  const [directCategory, setDirectCategory] = useState('Technical');
  const [directSummary, setDirectSummary] = useState('');
  const [directDesc, setDirectDesc] = useState('');
  const [directDate, setDirectDate] = useState('2026-06-10');
  const [directTime, setDirectTime] = useState('10:00');
  const [directRoll, setDirectRoll] = useState('');

  // Super Admin Staff creation states
  const [coordinators, setCoordinators] = useState([]);
  const [saName, setSaName] = useState('');
  const [saEmail, setSaEmail] = useState('');
  const [saUser, setSaUser] = useState('');
  const [saPass, setSaPass] = useState('');

  // Fetch coordinators for Super Admin
  const fetchCoordinators = async () => {
    if (user?.role !== 'superadmin') return;
    try {
      const res = await fetch('/api/calendar/admin/coordinators', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setCoordinators(data.coordinators);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin' && activeView === 'superadmin') {
      fetchCoordinators();
    }
  }, [user, activeView]);

  // Handle proposal submission
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!propTitle || !propSummary || !propDesc) {
      toast.error('Please complete all proposal inputs.');
      return;
    }
    const success = await submitProposal({
      title: propTitle,
      category: propCategory,
      summary: propSummary,
      description: propDesc
    });
    if (success) {
      setPropTitle('');
      setPropSummary('');
      setPropDesc('');
      setActiveView('home');
    }
  };

  // Open scheduling modal for approvals
  const handleOpenApprove = (prop) => {
    setSchedProposal(prop);
    setSchedModalOpen(true);
  };

  // Confirm Coordinator Approval
  const handleConfirmApproval = async () => {
    if (!schedDate || !schedTime) {
      toast.error('Date and Time fields required.');
      return;
    }
    const success = await approveProposal(schedProposal._id, {
      date: schedDate,
      time: schedTime
    });
    if (success) {
      setSchedModalOpen(false);
      setSchedProposal(null);
    }
  };

  // Post scrolling bulletin Notice
  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeInput.trim()) return;
    const success = await postScrollingNotice(noticeInput);
    if (success) {
      setNoticeInput('');
    }
  };

  // Coordinator: Create event page and assign student coordinator organizer access
  const handleDirectEventSubmit = async (e) => {
    e.preventDefault();
    if (!directTitle || !directSummary || !directDesc || !directDate || !directTime || !directRoll) {
      toast.error('Please complete event details and student coordinator roll number.');
      return;
    }

    const success = await createEventPage({
      title: directTitle,
      category: directCategory,
      summary: directSummary,
      description: directDesc,
      date: directDate,
      time: directTime,
      organizerRoll: directRoll
    });

    if (success) {
      setDirectTitle('');
      setDirectSummary('');
      setDirectDesc('');
      setDirectRoll('');
      setActiveView('home');
    }
  };

  // Super Admin: Create Coordinator Account
  const handleCreateCoordinator = async (e) => {
    e.preventDefault();
    if (!saName || !saEmail || !saUser || !saPass) {
      toast.error('Please complete coordinator credentials.');
      return;
    }
    try {
      const res = await fetch('/api/calendar/admin/coordinators', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: saName, email: saEmail, username: saUser, password: saPass })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coordinator account granted!');
        setSaName('');
        setSaEmail('');
        setSaUser('');
        setSaPass('');
        fetchCoordinators();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Server error.');
    }
  };

  // Super Admin: Toggle Coordinator Account Status
  const handleToggleCoordinator = async (coordId) => {
    try {
      const res = await fetch(`/api/calendar/admin/coordinators/${coordId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coordinator operational status toggled!');
        fetchCoordinators();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Server error.');
    }
  };

  // Coordinator: Delete an event with confirmation
  const handleDeleteEvent = async (e, eventId, eventTitle) => {
    e.stopPropagation(); // Prevent navigating to the event page
    if (!window.confirm(`Are you sure you want to permanently delete "${eventTitle}"? This cannot be undone.`)) return;
    await deleteEvent(eventId);
  };

  // Filters event cards
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(search.toLowerCase()) || 
                          evt.summary.toLowerCase().includes(search.toLowerCase());
    
    if (categoryTab === 'all') return matchesSearch;
    if (categoryTab === 'registered') return matchesSearch && evt.registeredStudents.includes(user?.id);
    return matchesSearch && evt.category === categoryTab;
  });

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col antialiased">
      
      {/* 1. Header Widget */}
      <header className="sticky top-0 z-[100] w-full px-6 py-4 border-b border-white/5 bg-[#080b11]/85 backdrop-blur-md flex justify-between items-center select-none">
        <div className="flex items-center gap-3 font-title text-lg font-black tracking-tight text-white">
          <FaGraduationCap className="text-neon-purple text-2xl filter drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" /> Apex Events
        </div>

        <div className="flex items-center gap-6">
          <NotificationCenter />
          
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer hover:border-white/10 transition-colors" onClick={() => navigate('/profile')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center font-bold text-xs font-title text-white">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">{user?.name}</span>
              <span className="text-[9px] font-semibold text-gray-500 uppercase leading-none mt-0.5">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notices scrolling marquee */}
      <NoticeMarquee />

      {/* 2. Primary layout grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5">
        
        {/* Left Navigation Sidebar */}
        <aside className="md:col-span-1 border-r border-white/5 bg-[#0a0e18]/40 p-6 flex flex-col justify-between select-none">
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase font-title block mb-4">Workspace views</span>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={() => setActiveView('home')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all ${activeView === 'home' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                >
                  <FaHome className="text-sm" /> Home Hub
                </button>
                <button 
                  onClick={() => setActiveView('calendar')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all ${activeView === 'calendar' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                >
                  <FaCalendarAlt className="text-sm" /> Academic Calendar
                </button>
                
                {/* Student specific routing */}
                {user?.role === 'student' && (
                  <button 
                    onClick={() => setActiveView('propose')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all ${activeView === 'propose' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                  >
                    <FaPaperPlane className="text-sm" /> Propose Event
                  </button>
                )}

                {/* Coordinator specific routing */}
                {user?.role === 'coordinator' && (
                  <>
                    <button 
                      onClick={() => setActiveView('inbox')}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all ${activeView === 'inbox' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                      <FaInbox className="text-sm" /> Proposals Inbox
                    </button>
                    <button 
                      onClick={() => setActiveView('createEvent')}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all ${activeView === 'createEvent' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                      <FaPlusCircle className="text-sm" /> Create Event Page
                    </button>
                  </>
                )}

                {/* Super Admin specific routing */}
                {user?.role === 'superadmin' && (
                  <button 
                    onClick={() => setActiveView('superadmin')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all ${activeView === 'superadmin' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                  >
                    <FaUsersCog className="text-sm" /> Staff Coordinators
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Student organizer badge section summary */}
            {user?.role === 'student' && user?.badges?.length > 0 && (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[9px] font-bold text-gray-500 block mb-2 font-title uppercase">Earned Badges</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.badges.map((b, idx) => (
                    <span key={idx} className="text-[8px] bg-gradient-to-r from-violet-600/30 to-cyan-500/30 border border-white/5 text-white px-2 py-1 rounded font-semibold font-title">
                      {b.badgeName} ({b.rating}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left text-neon-rose hover:bg-neon-rose/5 border border-transparent hover:border-neon-rose/10 flex items-center gap-3 transition-all duration-300"
            >
              <FaSignOutAlt className="text-sm" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Right main frame container */}
        <main className="md:col-span-4 p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            
            {/* VIEW: HOME Hub */}
            {activeView === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {/* Winners Carousel ticker */}
                <WinnersMarquee />

                {/* Dashboard Metrics grid */}
                <StatsSection />

                {/* Filters, Search & Categories layout */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 pb-4 border-b border-white/5 select-none">
                  <div className="flex flex-wrap gap-2">
                    {['all', 'Technical', 'Cultural', 'Sports', 'registered'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setCategoryTab(tab)}
                        className={`text-xs font-bold font-title px-4 py-2 rounded-xl border border-transparent transition-all capitalize ${categoryTab === tab ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}
                      >
                        {tab === 'registered' ? 'Registered' : tab === 'all' ? 'All Events' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Search query input */}
                  <div className="relative w-full md:w-64">
                    <input 
                      type="text" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search events..."
                      className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 pl-9 text-xs font-medium outline-none text-white transition-all"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  </div>
                </div>

                {/* Events Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {filteredEvents.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-xs text-gray-500 font-medium">
                      No matching events found.
                    </div>
                  ) : (
                    filteredEvents.map(evt => {
                      let statusBg = 'bg-neon-purple/10 text-neon-purple border-neon-purple/20';
                      if (evt.status === 'Live') statusBg = 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20 animate-pulse';
                      if (evt.status === 'Completed') statusBg = 'bg-white/5 text-gray-400 border-white/5';

                      let posterPreset = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600';
                      if (evt.posterPreset === 'cultural') posterPreset = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600';
                      if (evt.posterPreset === 'sports') posterPreset = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600';
                      if (evt.posterUrl) posterPreset = evt.posterUrl;

                      return (
                        <div 
                          key={evt._id}
                          onClick={() => navigate(`/event/${evt._id}`)}
                          className="glass-panel rounded-2xl overflow-hidden cursor-pointer relative hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 group"
                        >
                          <div 
                            className="h-40 bg-cover bg-center relative"
                            style={{ backgroundImage: `url('${posterPreset}')` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-transparent to-black/20" />
                            <span className={`absolute top-4 right-4 text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${statusBg}`}>
                              {evt.status}
                            </span>

                            {/* Coordinator Delete Button — top-left corner of poster */}
                            {user?.role === 'coordinator' && (
                              <button
                                onClick={(e) => handleDeleteEvent(e, evt._id, evt.title)}
                                title="Delete Event"
                                className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-lg bg-black/60 border border-neon-rose/30 text-neon-rose hover:bg-neon-rose hover:text-white hover:border-neon-rose transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                              >
                                <FaTrashAlt className="text-[10px]" />
                              </button>
                            )}
                          </div>

                          <div className="p-5 flex flex-col gap-2">
                            <h4 className="font-bold text-sm text-white group-hover:text-neon-cyan transition-colors leading-snug">
                              {evt.title}
                            </h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed truncate">
                              {evt.summary}
                            </p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                              <span>{evt.date}</span>
                              <span className="text-neon-cyan">{evt.registeredStudents?.length} Registered</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Testimonials section feedback */}
                <div className="bg-[#121829]/40 border border-white/5 rounded-2xl p-8 mb-8">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-gray-400 font-title block mb-6">
                    Real Feedback Testimonials
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl text-left">
                      <div className="flex gap-1 text-neon-amber mb-3">★★★★★</div>
                      <p className="text-xs text-gray-400 leading-relaxed italic">
                        "The robotics summit organized by Vikram was stellar! The drones demonstration was exceptionally detailed and production ready."
                      </p>
                      <span className="text-[9px] font-bold text-gray-500 block mt-3 font-title uppercase">
                        Meghana Sen (25481A1201)
                      </span>
                    </div>
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl text-left">
                      <div className="flex gap-1 text-neon-amber mb-3">★★★★☆</div>
                      <p className="text-xs text-gray-400 leading-relaxed italic">
                        "Excellent Department exams alerts setup on calendar. Prevented me from forgetting schedules clash items."
                      </p>
                      <span className="text-[9px] font-bold text-gray-500 block mt-3 font-title uppercase">
                        Amit Kumar (24481A0512)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footers */}
                <footer className="text-center py-6 border-t border-white/5 text-[10px] text-gray-600 font-semibold tracking-wide">
                  Apex Department of BTech Event Hub © 2026. Made by BTech 2nd Year.
                </footer>
              </motion.div>
            )}

            {/* VIEW: CALENDAR */}
            {activeView === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <CalendarGrid />
              </motion.div>
            )}

            {/* VIEW: Student Proposal Requests */}
            {activeView === 'propose' && (
              <motion.div 
                key="propose"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl"
              >
                <div className="glass-panel p-8 rounded-2xl">
                  <h3 className="text-md font-bold font-title text-white mb-2">Request Program Permission</h3>
                  <p className="text-xs text-gray-400 mb-6">Pitch your event plans directly to the Academic Coordinator. Once approved, you gain exclusive organizer control panel access.</p>

                  <form onSubmit={handleProposalSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Proposed Event Name</label>
                        <input 
                          type="text" 
                          value={propTitle}
                          onChange={(e) => setPropTitle(e.target.value)}
                          placeholder="e.g. Generative AI Codeathon"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Event Category</label>
                        <select 
                          value={propCategory}
                          onChange={(e) => setPropCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-xs outline-none"
                        >
                          <option value="Technical">Technical</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">One-line Summary</label>
                      <input 
                        type="text" 
                        value={propSummary}
                        onChange={(e) => setPropSummary(e.target.value)}
                        placeholder="e.g. Build generative AI software using Google Gemini APIs."
                        className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Execution Details</label>
                      <textarea 
                        value={propDesc}
                        onChange={(e) => setPropDesc(e.target.value)}
                        rows={4}
                        placeholder="Detail the target audience, laboratory equipment needed, schedule timelines, and how the program is conducted..."
                        className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-xs outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-neon-purple hover:bg-violet-700 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] text-xs font-bold text-white transition-all self-end"
                    >
                      Submit Proposal
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* VIEW: Proposals Inbox (Coordinator) */}
            {activeView === 'inbox' && (
              <motion.div 
                key="inbox"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-md font-bold font-title text-white mb-1">Student Requests Inbox</h3>
                    <p className="text-xs text-gray-400">Review student proposals, verify clashes, assign schedules, and auto-generate event pages.</p>
                  </div>
                  
                  {/* Create notices bulletins form */}
                  <form onSubmit={handlePostNotice} className="w-full md:w-96 flex gap-2">
                    <input 
                      type="text"
                      value={noticeInput}
                      onChange={(e) => setNoticeInput(e.target.value)}
                      placeholder="Post a scrolling bulletin announcement..."
                      className="flex-1 bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl px-3 py-1.5 text-xs outline-none"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-neon-purple text-xs font-bold text-white shrink-0"
                    >
                      Publish
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {proposals.filter(p => p.status === 'Pending').length === 0 ? (
                    <div className="col-span-full py-16 text-center text-xs text-gray-500 font-medium">
                      No pending event proposals.
                    </div>
                  ) : (
                    proposals.filter(p => p.status === 'Pending').map(p => (
                      <div key={p._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">{p.createdAt?.substring(0, 10)}</span>
                          </div>
                          <h4 className="font-bold text-sm text-white mb-2 leading-snug">{p.title}</h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{p.description}</p>
                          <div className="text-[10px] text-gray-500 font-semibold border-t border-white/5 pt-3">
                            Submitted by student: <strong className="text-gray-300">{p.studentName}</strong> ({p.studentRoll})
                          </div>
                        </div>

                        <div className="flex gap-2.5 mt-5">
                          <button 
                            onClick={() => rejectProposal(p._id)}
                            className="flex-1 py-2 text-xs font-bold text-neon-rose bg-neon-rose/5 border border-neon-rose/10 hover:bg-neon-rose hover:text-white rounded-xl transition-all"
                          >
                            Reject Proposal
                          </button>
                          <button 
                            onClick={() => handleOpenApprove(p)}
                            className="flex-1 py-2 text-xs font-bold bg-neon-cyan hover:bg-[#0097b2] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-white rounded-xl transition-all"
                          >
                            Approve & Schedule
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW: Coordinator Direct Event Creation */}
            {activeView === 'createEvent' && (
              <motion.div 
                key="createEvent"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl"
              >
                <div className="glass-panel p-8 rounded-2xl">
                  <h3 className="text-md font-bold font-title text-white mb-2">Create Event Page</h3>
                  <p className="text-xs text-gray-400 mb-6">Create an event immediately and grant Organizer Console access to the selected student coordinator.</p>

                  <form onSubmit={handleDirectEventSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Event Name</label>
                        <input 
                          type="text" 
                          value={directTitle}
                          onChange={(e) => setDirectTitle(e.target.value)}
                          placeholder="e.g. Web Dev Sprint"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Student Coordinator Roll No</label>
                        <input 
                          type="text" 
                          value={directRoll}
                          onChange={(e) => setDirectRoll(e.target.value.toUpperCase())}
                          placeholder="e.g. 24481A0501"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Category</label>
                        <select 
                          value={directCategory}
                          onChange={(e) => setDirectCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                        >
                          <option value="Technical">Technical</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Date</label>
                        <input 
                          type="date" 
                          value={directDate}
                          onChange={(e) => setDirectDate(e.target.value)}
                          min="2026-06-01"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Time</label>
                        <input 
                          type="time" 
                          value={directTime}
                          onChange={(e) => setDirectTime(e.target.value)}
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">One-line Summary</label>
                      <input 
                        type="text" 
                        value={directSummary}
                        onChange={(e) => setDirectSummary(e.target.value)}
                        placeholder="Short event card description."
                        className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-title">Event Details</label>
                      <textarea 
                        value={directDesc}
                        onChange={(e) => setDirectDesc(e.target.value)}
                        rows={5}
                        placeholder="Add agenda, venue, target audience, resources, and coordination details..."
                        className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-neon-cyan hover:bg-[#0097b2] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-bold text-white transition-all self-end"
                    >
                      Create Page & Grant Access
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* VIEW: Staff Coordinators (Super Admin Only) */}
            {activeView === 'superadmin' && (
              <motion.div 
                key="superadmin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Coordinator creation form */}
                  <div className="glass-panel p-6 rounded-2xl h-fit">
                    <h4 className="font-bold text-sm font-title text-white mb-4">Grant Coordinator Access</h4>
                    <form onSubmit={handleCreateCoordinator} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={saName}
                          onChange={(e) => setSaName(e.target.value)}
                          placeholder="e.g. Dr. Ramesh Prasad"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-3 py-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={saEmail}
                          onChange={(e) => setSaEmail(e.target.value)}
                          placeholder="ramesh@btech.edu"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-3 py-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Username</label>
                        <input 
                          type="text" 
                          value={saUser}
                          onChange={(e) => setSaUser(e.target.value)}
                          placeholder="coordinator2"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-3 py-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Password</label>
                        <input 
                          type="password" 
                          value={saPass}
                          onChange={(e) => setSaPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-3 py-2 text-xs outline-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="py-2 px-4 rounded-xl bg-neon-cyan text-xs font-bold text-white mt-2 hover:bg-[#0097b2] transition-colors"
                      >
                        Grant Access
                      </button>
                    </form>
                  </div>

                  {/* Coordinators overview list */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                    <h4 className="font-bold text-sm font-title text-white mb-4">Academic Coordinators Directory</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                            <th className="py-3 px-4 font-title">Name</th>
                            <th className="py-3 px-4 font-title">Username</th>
                            <th className="py-3 px-4 font-title">Status</th>
                            <th className="py-3 px-4 font-title">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coordinators.map(c => (
                            <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="py-4 px-4 font-semibold text-white">{c.name}</td>
                              <td className="py-4 px-4 text-gray-400">{c.username}</td>
                              <td className="py-4 px-4">
                                <span className={`font-bold ${c.status === 'active' ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                                  {c.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <button 
                                  onClick={() => handleToggleCoordinator(c._id)}
                                  className="px-3 py-1 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-[10px] font-bold text-gray-300"
                                >
                                  {c.status === 'active' ? 'Suspend' : 'Reactivate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* 3. Scheduling Approval Modal Overlay */}
      {schedModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animation-scaleIn">
            <h3 className="text-md font-bold font-title text-white mb-2">Schedule Approved Event</h3>
            <p className="text-xs text-gray-400 mb-6">Allocate date and time details. Event page creates instantly on submission, and grants student organizer rights.</p>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Event Name</label>
                <input 
                  type="text" 
                  value={schedProposal?.title || ''} 
                  readOnly 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-gray-400 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Allot Date</label>
                  <input 
                    type="date" 
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    min="2026-06-01"
                    className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Allot Time</label>
                  <input 
                    type="time" 
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl px-4 py-2 text-xs outline-none text-white" 
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  onClick={() => setSchedModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmApproval}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-neon-cyan hover:bg-[#0097b2] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all text-white"
                >
                  Approve & Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
