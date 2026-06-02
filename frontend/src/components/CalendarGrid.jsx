import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';

export default function CalendarGrid() {
  const { user } = useAuth();
  const { calendarEntries, events, saveCalendarDayAgenda, deleteCalendarDayAgenda } = useEvents();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed = 5)
  const [selectedDate, setSelectedDate] = useState('2026-06-02');
  const [modalOpen, setModalOpen] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaType, setAgendaType] = useState('special');

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

  // Handle cell click
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    if (user?.role === 'coordinator') {
      const existing = calendarEntries.find(e => e.date === dateStr);
      if (existing) {
        setAgendaTitle(existing.title);
        setAgendaType(existing.type);
      } else {
        setAgendaTitle('');
        setAgendaType('special');
      }
      setModalOpen(true);
    }
  };

  const handleSaveAgenda = async () => {
    if (!agendaTitle.trim()) return;
    const success = await saveCalendarDayAgenda({
      date: selectedDate,
      title: agendaTitle,
      type: agendaType
    });
    if (success) {
      setModalOpen(false);
    }
  };

  const handleDeleteAgenda = async () => {
    const existing = calendarEntries.find(e => e.date === selectedDate);
    if (existing) {
      const success = await deleteCalendarDayAgenda(existing._id);
      if (success) {
        setModalOpen(false);
      }
    }
  };

  // Build grid blocks
  const dateCells = [];
  // 1. Offsets
  for (let i = 0; i < firstDayIndex; i++) {
    dateCells.push(<div key={`empty-${i}`} className="aspect-[1.2] border border-white/5 opacity-20" />);
  }
  // 2. Dates
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = day === 2 && currentMonth === 5 && currentYear === 2026;
    const isSelected = dateStr === selectedDate;

    // Fetch entries
    const dayAgenda = calendarEntries.find(e => e.date === dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    const agendaDotClass = dayAgenda?.type === 'holiday'
      ? 'bg-neon-rose'
      : dayAgenda?.type === 'exam'
        ? 'bg-neon-amber'
        : 'bg-neon-cyan';

    dateCells.push(
      <div 
        key={day}
        onClick={() => handleDateClick(dateStr)}
        className={`aspect-[1.2] p-2 border border-white/5 rounded-lg flex flex-col justify-between items-end cursor-pointer transition-all duration-300 hover:bg-white/[0.03] relative group ${isToday ? 'border-neon-cyan bg-neon-cyan/[0.02]' : ''} ${isSelected ? 'border-neon-purple bg-neon-purple/[0.04]' : ''}`}
      >
        <span className={`text-xs font-bold font-title ${isToday ? 'text-neon-cyan' : isSelected ? 'text-neon-purple' : 'text-gray-400'}`}>
          {day}
        </span>

        <div className="flex-1 w-full mt-2 overflow-hidden">
          {dayAgenda && (
            <div className={`text-[8px] font-bold leading-tight truncate ${dayAgenda.type === 'holiday' ? 'text-neon-rose' : dayAgenda.type === 'exam' ? 'text-neon-amber' : 'text-neon-cyan'}`}>
              {dayAgenda.title}
            </div>
          )}
          {dayEvents.slice(0, 2).map(e => (
            <div key={e._id} className="text-[8px] font-bold leading-tight truncate text-neon-cyan">
              {e.title}
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex gap-1 flex-wrap w-full justify-start mt-1">
          {dayAgenda && (
            <span className={`w-1.5 h-1.5 rounded-full ${agendaDotClass}`} />
          )}
          {dayEvents.map(e => (
            <span key={e._id} className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Agendas sidebar compile
  const activeDayAgenda = calendarEntries.find(e => e.date === selectedDate);
  const activeDayEvents = events.filter(e => e.date === selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-3 glass-panel p-6 rounded-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold font-title tracking-tight">{monthName} {currentYear}</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                else { setCurrentMonth(currentMonth - 1); }
              }}
              className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button 
              onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                else { setCurrentMonth(currentMonth + 1); }
              }}
              className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] uppercase font-bold text-gray-500 font-title py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dateCells}
        </div>
      </div>

      {/* Agenda Side view */}
      <div className="glass-panel rounded-2xl flex flex-col justify-between overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-slate-950/20">
          <h4 className="font-bold text-sm font-title text-gray-200">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>
          <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">
            Department Calendar Notes
          </p>
        </div>

        <div className="p-5 flex-1 overflow-y-auto max-h-[360px] flex flex-col gap-4">
          {!activeDayAgenda && activeDayEvents.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-10 flex flex-col items-center gap-2">
              <FaInfoCircle className="text-lg text-gray-600" />
              No schedules listed for this date.
            </div>
          ) : (
            <>
              {activeDayAgenda && (
                <div className={`p-4 rounded-xl border border-white/5 flex flex-col gap-1 ${activeDayAgenda.type === 'holiday' ? 'border-l-4 border-l-neon-rose bg-neon-rose/[0.01]' : activeDayAgenda.type === 'exam' ? 'border-l-4 border-l-neon-amber bg-neon-amber/[0.01]' : 'border-l-4 border-l-neon-cyan bg-neon-cyan/[0.01]'}`}>
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${activeDayAgenda.type === 'holiday' ? 'text-neon-rose' : activeDayAgenda.type === 'exam' ? 'text-neon-amber' : 'text-neon-cyan'}`}>
                    {activeDayAgenda.type === 'holiday' ? 'Department Holiday' : activeDayAgenda.type === 'exam' ? 'Mid-Terms / Exams' : 'Confirmed Event'}
                  </span>
                  <h5 className="font-semibold text-xs text-white leading-relaxed">{activeDayAgenda.title}</h5>
                </div>
              )}
              {activeDayEvents.map(evt => (
                <div key={evt._id} className="p-4 rounded-xl border border-white/5 border-l-4 border-l-neon-cyan bg-neon-cyan/[0.01] flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-neon-cyan">
                    College Program
                  </span>
                  <h5 className="font-semibold text-xs text-white leading-relaxed">{evt.title}</h5>
                  <span className="text-[10px] text-gray-400 mt-1">Timings: {evt.time}</span>
                  <span className="text-[10px] text-gray-500">Coordinator confirmed event page</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Coordinator date agenda modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animation-scaleIn">
            <h3 className="text-md font-bold font-title text-white mb-2">Modify Department Calendar</h3>
            <p className="text-xs text-gray-400 mb-6">Mark confirmed events, exams, or holidays for {selectedDate}. Everyone using the website can see these notes on the calendar.</p>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Agenda Item Title</label>
                <input 
                  type="text" 
                  value={agendaTitle}
                  onChange={(e) => setAgendaTitle(e.target.value)}
                  placeholder="e.g. Coding Workshop, Lab Exams, Public Holiday"
                  className="w-full bg-black/30 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-sm outline-none text-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Entry Category</label>
                <select 
                  value={agendaType}
                  onChange={(e) => setAgendaType(e.target.value)}
                  className="w-full bg-black/30 border border-white/5 focus:border-neon-purple rounded-xl px-4 py-2 text-sm outline-none text-white transition-colors"
                >
                  <option value="special">Confirmed Department Event</option>
                  <option value="exam">Mid-Term / Final Examination</option>
                  <option value="holiday">Official Department Holiday</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                {calendarEntries.some(e => e.date === selectedDate) && (
                  <button 
                    onClick={handleDeleteAgenda}
                    className="mr-auto px-4 py-2 rounded-xl text-xs font-semibold bg-neon-rose/10 hover:bg-neon-rose text-neon-rose hover:text-white border border-neon-rose/20 transition-all"
                  >
                    Delete Entry
                  </button>
                )}
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAgenda}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-neon-purple hover:bg-violet-700 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all text-white"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
