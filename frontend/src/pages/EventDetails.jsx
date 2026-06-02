import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { FaArrowLeft, FaCalendar, FaUserPlus, FaUserMinus, FaBell, FaBookOpen, FaGoogle, FaShieldAlt, FaAward, FaImages, FaTrophy, FaStar, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    events, 
    registerForEvent, 
    toggleReminder, 
    updateEventOrganizer, 
    submitFeedback 
  } = useEvents();

  const [event, setEvent] = useState(null);
  const [activeFeedbackRating, setActiveFeedbackRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');

  // Organizer console inputs
  const [orgStatus, setOrgStatus] = useState('Upcoming');
  const [orgSummary, setOrgSummary] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [orgPoster, setOrgPoster] = useState('tech');
  const [orgPosterUrl, setOrgPosterUrl] = useState('');
  const [orgGForm, setOrgGForm] = useState('');
  const [orgNdli, setOrgNdli] = useState('');
  const [orgPhotoUrls, setOrgPhotoUrls] = useState('');
  const [orgWin1Name, setOrgWin1Name] = useState('');
  const [orgWin1Roll, setOrgWin1Roll] = useState('');
  const [orgWin2Name, setOrgWin2Name] = useState('');
  const [orgWin2Roll, setOrgWin2Roll] = useState('');
  const [orgWin3Name, setOrgWin3Name] = useState('');
  const [orgWin3Roll, setOrgWin3Roll] = useState('');
  const [galleryCheck1, setGalleryCheck1] = useState(false);
  const [galleryCheck2, setGalleryCheck2] = useState(false);
  const [galleryCheck3, setGalleryCheck3] = useState(false);

  // Sync event from events list context
  useEffect(() => {
    const found = events.find(e => e._id === id);
    if (found) {
      setEvent(found);
      setOrgStatus(found.status);
      setOrgSummary(found.summary || '');
      setOrgDesc(found.description || '');
      setOrgPoster(found.posterPreset);
      setOrgPosterUrl(found.posterUrl || '');
      setOrgGForm(found.gFormLink || '');
      setOrgNdli(found.ndliLink || '');
      setOrgPhotoUrls(found.photos?.join('\n') || '');
      
      // Load winners if available
      const w1 = found.winners?.find(w => w.rank === 1);
      const w2 = found.winners?.find(w => w.rank === 2);
      const w3 = found.winners?.find(w => w.rank === 3);
      if (w1) { setOrgWin1Name(w1.name); setOrgWin1Roll(w1.roll); }
      if (w2) { setOrgWin2Name(w2.name); setOrgWin2Roll(w2.roll); }
      if (w3) { setOrgWin3Name(w3.name); setOrgWin3Roll(w3.roll); }
    }
  }, [events, id]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center text-xs text-gray-500 font-bold uppercase tracking-wider font-title">
        Loading event page...
      </div>
    );
  }

  const isOrganizer = user && user.role === 'student' && event.organizerRoll === user.rollNo;
  const isRegistered = event.registeredStudents?.includes(user?.id);
  
  // Confetti burst
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Toggle register
  const handleRegisterToggle = async () => {
    await registerForEvent(event._id);
  };

  // Set Reminder preference
  const handleReminderToggle = async () => {
    const success = await toggleReminder(event._id);
    if (success) {
      // Simulates real-time notification alert card after 5 seconds
      setTimeout(() => {
        toast((t) => (
          <span className="flex items-center gap-2">
            🔔 <strong>REMINDER:</strong> "{event.title}" is starting in 30 minutes!
          </span>
        ), { duration: 5000 });
      }, 5000);
    }
  };

  // Submit star rating feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (activeFeedbackRating === 0) {
      toast.error('Please select a star rating first.');
      return;
    }
    const success = await submitFeedback(event._id, {
      rating: activeFeedbackRating,
      comment: commentInput
    });
    if (success) {
      setActiveFeedbackRating(0);
      setCommentInput('');
    }
  };

  const readImageAsDataUrl = (file, maxSize = 1200, quality = 0.82) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readImageAsDataUrl(file, 1400, 0.84);
    setOrgPosterUrl(dataUrl);
    toast.success('Poster ready. Save organizer settings to publish it.');
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const dataUrls = await Promise.all(files.map(file => readImageAsDataUrl(file, 1000, 0.78)));
    setOrgPhotoUrls(prev => [prev, ...dataUrls].filter(Boolean).join('\n'));
    toast.success('Photos ready. Save organizer settings to publish them.');
  };

  // Organizer: Save console modifications
  const handleSaveOrganizerDetails = async () => {
    if (!orgSummary.trim() || !orgDesc.trim()) {
      toast.error('Please keep the event summary and description filled.');
      return;
    }

    const winnersList = [];
    if (orgWin1Name && orgWin1Roll) {
      winnersList.push({ rank: 1, name: orgWin1Name, roll: orgWin1Roll.toUpperCase() });
    }
    if (orgWin2Name && orgWin2Roll) {
      winnersList.push({ rank: 2, name: orgWin2Name, roll: orgWin2Roll.toUpperCase() });
    }
    if (orgWin3Name && orgWin3Roll) {
      winnersList.push({ rank: 3, name: orgWin3Name, roll: orgWin3Roll.toUpperCase() });
    }

    const photosList = [];
    if (galleryCheck1) photosList.push('https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600');
    if (galleryCheck2) photosList.push('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600');
    if (galleryCheck3) photosList.push('https://images.unsplash.com/photo-1511578314322-379afb476865?w=600');
    orgPhotoUrls
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean)
      .forEach(url => photosList.push(url));

    const success = await updateEventOrganizer(event._id, {
      status: orgStatus,
      summary: orgSummary,
      description: orgDesc,
      posterPreset: orgPoster,
      posterUrl: orgPosterUrl,
      gFormLink: orgGForm,
      ndliLink: orgNdli,
      winners: winnersList,
      photos: photosList
    });

    if (success) {
      if (orgStatus === 'Completed' && winnersList.length > 0) {
        triggerConfetti();
      }
    }
  };

  // Poster Presets Mapping
  let posterPreset = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000';
  if (event.posterPreset === 'cultural') posterPreset = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000';
  if (event.posterPreset === 'sports') posterPreset = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000';
  if (event.posterUrl) posterPreset = event.posterUrl;

  let statusStyle = 'bg-neon-purple/10 text-neon-purple border-neon-purple/20';
  if (event.status === 'Live') statusStyle = 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20 animate-pulse';
  if (event.status === 'Completed') statusStyle = 'bg-white/5 text-gray-400 border-white/5';

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col antialiased">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 z-50 bg-[#080b11]/80 border border-white/5 rounded-full px-4 py-2 text-xs font-bold text-white flex items-center gap-2 hover:bg-neon-purple hover:border-neon-purple hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer select-none"
      >
        <FaArrowLeft /> Back to Hub
      </button>

      {/* Hero Banner */}
      <div 
        className="h-[350px] bg-cover bg-center relative flex items-end px-8 md:px-16 py-12 select-none"
        style={{ backgroundImage: `url('${posterPreset}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-black/40 to-black/20" />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-2">
            <span className={`w-fit text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${statusStyle}`}>
              {event.status}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-title tracking-tight text-white drop-shadow-md">
              {event.title}
            </h1>
            <p className="text-xs text-gray-300 font-semibold flex items-center gap-1.5 mt-1 opacity-90">
              <FaCalendar className="text-neon-cyan" /> Allotted: {event.date} @ {event.time}
            </p>
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 px-8 md:px-16 py-10 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Description, Winners list, Photo Gallery, Feedback Stars */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* About Card */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-md font-bold font-title text-neon-cyan mb-4 flex items-center gap-2">
              <FaInfoCircle /> About the Event
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Ranks Champions display */}
          {event.status === 'Completed' && event.winners && event.winners.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-neon-amber/5 to-orange-500/5 border border-neon-amber/20 rounded-2xl">
              <h3 className="text-md font-bold font-title text-neon-amber mb-4 flex items-center gap-2">
                <FaTrophy /> Event Champions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.winners.map(w => {
                  let medalColor = 'text-yellow-400';
                  if (w.rank === 2) medalColor = 'text-slate-300';
                  if (w.rank === 3) medalColor = 'text-amber-600';

                  return (
                    <div 
                      key={w.rank}
                      onClick={triggerConfetti}
                      className="p-4 bg-black/30 border border-white/5 hover:border-neon-amber/20 rounded-xl flex items-center gap-4 cursor-pointer transition-colors duration-300"
                    >
                      <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-extrabold text-sm ${medalColor} font-title`}>
                        {w.rank}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight">{w.name}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">{w.roll}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Gallery presets highlight */}
          {event.status === 'Completed' && event.photos && event.photos.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold font-title text-neon-purple mb-4 flex items-center gap-2">
                <FaImages /> Highlights Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.photos.map((p, idx) => (
                  <div 
                    key={idx}
                    className="aspect-[1.5] rounded-xl border border-white/5 bg-cover bg-center hover:scale-[1.03] transition-transform duration-300 cursor-pointer shadow-lg"
                    style={{ backgroundImage: `url('${p}')` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Participant Reviews ratings */}
          {event.status === 'Completed' && isRegistered && (
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold font-title text-neon-amber mb-1 flex items-center gap-2">
                Share Your Experience
              </h3>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-4">
                Your feedback affects the organizer's badging score
              </p>

              {event.feedbacks.some(f => f.studentRoll === user?.rollNo) ? (
                <div className="p-4 rounded-xl border border-neon-emerald/20 bg-neon-emerald/5 text-neon-emerald text-xs font-semibold flex items-center gap-2.5">
                  <FaCheckCircle className="text-lg" />
                  <span>Review logged successfully! Thank you for participating.</span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Star Review Score</label>
                    <div className="flex gap-1.5 text-xl text-gray-600">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FaStar 
                          key={star}
                          onClick={() => setActiveFeedbackRating(star)}
                          className={`cursor-pointer hover:scale-110 transition-transform ${star <= activeFeedbackRating ? 'text-neon-amber' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Optional Comments</label>
                    <textarea 
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Share what you liked or how we can improve..."
                      rows={3}
                      className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-xs outline-none text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-5 bg-neon-amber hover:bg-amber-600 rounded-xl text-xs font-bold text-black transition-colors self-end"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Actions, Google Forms, Reminders, and Organizer Console */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
            <h4 className="font-bold text-sm font-title text-white">Event Quick Actions</h4>
            
            {event.status !== 'Completed' ? (
              <>
                <button 
                  onClick={handleRegisterToggle}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isRegistered ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5' : 'bg-neon-purple hover:bg-violet-700 text-white'}`}
                >
                  {isRegistered ? (
                    <><FaUserMinus /> Cancel Registry</>
                  ) : (
                    <><FaUserPlus /> Register for Event</>
                  )}
                </button>
                <p className="text-[10px] text-gray-500 font-semibold text-center uppercase tracking-wider block">
                  {event.registeredStudents?.length} Students Registered
                </p>
                <button 
                  onClick={handleReminderToggle}
                  className="w-full py-2.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <FaBell className="text-neon-purple" /> Notify Me (30m Before)
                </button>
              </>
            ) : (
              <div className="text-center text-xs text-gray-500 font-semibold uppercase py-2">
                Registrations Closed
              </div>
            )}

            {event.gFormLink && (
              <a 
                href={event.gFormLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 bg-neon-emerald/10 border border-neon-emerald/20 hover:bg-neon-emerald hover:text-white text-neon-emerald rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all text-center"
              >
                <FaGoogle /> Fill Event Google Form
              </a>
            )}

            {event.ndliLink && (
              <a 
                href={event.ndliLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 bg-neon-cyan/10 border border-neon-cyan/20 hover:bg-neon-cyan hover:text-white text-neon-cyan rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all text-center"
              >
                <FaBookOpen /> Open NDLI Resource Link
              </a>
            )}
          </div>

          {/* Student Organizer Console Panel */}
          {isOrganizer && (
            <div className="glass-panel p-5 rounded-2xl border-neon-purple flex flex-col gap-4 relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-50%,rgba(139,92,246,0.06),transparent_60%)] pointer-events-none" />
              
              <h4 className="font-bold text-sm font-title text-neon-purple flex items-center gap-2">
                <FaShieldAlt className="text-neon-purple" /> Organizer Console
              </h4>
              <p className="text-[10px] text-gray-500 leading-normal">
                You are the assigned organizer for this event. Customize details, upload Presets, and post winners ranks.
              </p>

              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                {/* Status Toggles */}
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Event Stage</label>
                  <select 
                    value={orgStatus}
                    onChange={(e) => setOrgStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="Upcoming">Upcoming (Active Registry)</option>
                    <option value="Live">Live (Ongoing program)</option>
                    <option value="Completed">Completed (Concluded)</option>
                  </select>
                </div>

                {/* Poster Selectors */}
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-2">Select Theme Poster</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['tech', 'cultural', 'sports'].map(preset => (
                      <button 
                        key={preset}
                        onClick={() => setOrgPoster(preset)}
                        className={`py-1 rounded text-[9px] font-bold uppercase transition-all ${orgPoster === preset ? 'bg-neon-purple text-white' : 'bg-white/5 text-gray-400'}`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Custom Poster Image URL</label>
                  <input 
                    type="url" 
                    value={orgPosterUrl}
                    onChange={(e) => setOrgPosterUrl(e.target.value)}
                    placeholder="Upload an image or paste https://example.com/event-poster.jpg"
                    className="w-full bg-black/25 border border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="mt-2 block w-full text-[10px] text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-neon-purple file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-white"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Event Card Summary</label>
                  <input 
                    type="text" 
                    value={orgSummary}
                    onChange={(e) => setOrgSummary(e.target.value)}
                    placeholder="Short event summary for home page cards"
                    className="w-full bg-black/25 border border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Event Description</label>
                  <textarea 
                    value={orgDesc}
                    onChange={(e) => setOrgDesc(e.target.value)}
                    placeholder="Full event description, agenda, venue, rules, and responsibilities..."
                    rows={4}
                    className="w-full bg-black/25 border border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                </div>

                {/* Links */}
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Google Form Link</label>
                  <input 
                    type="url" 
                    value={orgGForm}
                    onChange={(e) => setOrgGForm(e.target.value)}
                    placeholder="https://forms.google.com/..."
                    className="w-full bg-black/25 border border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">NDLI Resource Link</label>
                  <input 
                    type="url" 
                    value={orgNdli}
                    onChange={(e) => setOrgNdli(e.target.value)}
                    placeholder="https://ndl.iitkgp.ac.in/..."
                    className="w-full bg-black/25 border border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                </div>

                {/* Concluded entries (Winners, highlights presets) */}
                {orgStatus === 'Completed' && (
                  <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                    <h5 className="font-bold text-[10px] text-neon-amber uppercase tracking-wider flex items-center gap-1">
                      <FaAward /> Champions Ranks (Roll numbers)
                    </h5>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-bold text-yellow-400 w-6">1st:</span>
                        <input type="text" value={orgWin1Name} onChange={(e) => setOrgWin1Name(e.target.value)} placeholder="Name" className="w-1/2 bg-black/25 border border-white/5 rounded-xl px-2 py-1 text-[10px] outline-none" />
                        <input type="text" value={orgWin1Roll} onChange={(e) => setOrgWin1Roll(e.target.value)} placeholder="Roll" className="w-1/2 bg-black/25 border border-white/5 rounded-xl px-2 py-1 text-[10px] outline-none" />
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-bold text-slate-300 w-6">2nd:</span>
                        <input type="text" value={orgWin2Name} onChange={(e) => setOrgWin2Name(e.target.value)} placeholder="Name" className="w-1/2 bg-black/25 border border-white/5 rounded-xl px-2 py-1 text-[10px] outline-none" />
                        <input type="text" value={orgWin2Roll} onChange={(e) => setOrgWin2Roll(e.target.value)} placeholder="Roll" className="w-1/2 bg-black/25 border border-white/5 rounded-xl px-2 py-1 text-[10px] outline-none" />
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-bold text-amber-600 w-6">3rd:</span>
                        <input type="text" value={orgWin3Name} onChange={(e) => setOrgWin3Name(e.target.value)} placeholder="Name" className="w-1/2 bg-black/25 border border-white/5 rounded-xl px-2 py-1 text-[10px] outline-none" />
                        <input type="text" value={orgWin3Roll} onChange={(e) => setOrgWin3Roll(e.target.value)} placeholder="Roll" className="w-1/2 bg-black/25 border border-white/5 rounded-xl px-2 py-1 text-[10px] outline-none" />
                      </div>
                    </div>

                    <h5 className="font-bold text-[10px] text-neon-cyan uppercase tracking-wider flex items-center gap-1 mt-2">
                      <FaImages /> Highlights Photo Gallery
                    </h5>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Event Photo URLs</label>
                      <textarea 
                        value={orgPhotoUrls}
                        onChange={(e) => setOrgPhotoUrls(e.target.value)}
                        placeholder="Upload event photos or paste one photo URL per line"
                        rows={4}
                        className="w-full bg-black/25 border border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="mt-2 block w-full text-[10px] text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-neon-cyan file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] flex items-center gap-2 cursor-pointer text-gray-400">
                        <input type="checkbox" checked={galleryCheck1} onChange={(e) => setGalleryCheck1(e.target.checked)} /> Presentation Deck
                      </label>
                      <label className="text-[10px] flex items-center gap-2 cursor-pointer text-gray-400">
                        <input type="checkbox" checked={galleryCheck2} onChange={(e) => setGalleryCheck2(e.target.checked)} /> Interactive Lab Coding
                      </label>
                      <label className="text-[10px] flex items-center gap-2 cursor-pointer text-gray-400">
                        <input type="checkbox" checked={galleryCheck3} onChange={(e) => setGalleryCheck3(e.target.checked)} /> Award Ceremony Stage
                      </label>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSaveOrganizerDetails}
                  className="w-full py-2 bg-neon-purple hover:bg-violet-700 text-xs font-bold text-white rounded-xl transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] mt-2"
                >
                  Save Organizer Settings
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
