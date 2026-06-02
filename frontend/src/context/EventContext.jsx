import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const { getAuthHeaders, token } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Scrolling Bulletins Marquee
  const fetchNotices = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/notices');
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.error('Error loading bulletins notices:', err);
    }
  }, []);

  // Fetch Calendar Entries
  const fetchCalendarEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.success) {
        setCalendarEntries(data.entries);
      }
    } catch (err) {
      console.error('Error loading calendar entries:', err);
    }
  }, []);

  // Fetch Events Hub
  const fetchEvents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error retrieving events:', err);
      setLoading(false);
    }
  }, []);

  // Fetch proposals (Depends on role)
  const fetchProposals = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/events/proposals', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      console.error('Error loading proposals inbox:', err);
    }
  }, [token, getAuthHeaders]);

  // Sync basic global state components on load
  useEffect(() => {
    fetchNotices();
    fetchCalendarEntries();
    fetchEvents();
  }, [fetchNotices, fetchCalendarEntries, fetchEvents]);

  // Sync proposals if token activates
  useEffect(() => {
    if (token) {
      fetchProposals();
    }
  }, [token, fetchProposals]);

  // Submit Proposal (Student Only)
  const submitProposal = async (proposalData) => {
    try {
      const res = await fetch('/api/events/proposals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(proposalData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Proposal submitted to Coordinator successfully!');
        fetchProposals();
        return true;
      } else {
        toast.error(data.message || 'Error submitting proposal.');
        return false;
      }
    } catch (err) {
      toast.error('Network Error: Server offline.');
      return false;
    }
  };

  // Approve Proposal (Coordinator Only - with Clash protection warnings)
  const approveProposal = async (proposalId, scheduleDetails) => {
    try {
      const res = await fetch(`/api/events/proposals/${proposalId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(scheduleDetails)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Event approved and scheduled successfully!');
        fetchProposals();
        fetchEvents();
        fetchCalendarEntries();
        fetchNotices();
        return true;
      } else {
        toast.error(data.message || 'Error during approval.');
        return false;
      }
    } catch (err) {
      toast.error('Clash Protection Triggered or network error.');
      return false;
    }
  };

  // Reject Proposal (Coordinator Only)
  const rejectProposal = async (proposalId) => {
    try {
      const res = await fetch(`/api/events/proposals/${proposalId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Proposal rejected successfully.');
        fetchProposals();
        return true;
      } else {
        toast.error(data.message || 'Error rejecting proposal.');
        return false;
      }
    } catch (err) {
      toast.error('Server error.');
      return false;
    }
  };

  // Create event page directly and grant a student coordinator organizer access
  const createEventPage = async (eventDetails) => {
    try {
      const res = await fetch('/api/events/direct', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventDetails)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Event page created and access granted!');
        fetchEvents();
        fetchCalendarEntries();
        fetchNotices();
        return true;
      } else {
        toast.error(data.message || 'Error creating event page.');
        return false;
      }
    } catch (err) {
      toast.error('Network Error: Server offline.');
      return false;
    }
  };

  // Toggle Event registration
  const registerForEvent = async (eventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.registered ? 'Registered for Event!' : 'Registration cancelled.');
        fetchEvents();
        return true;
      } else {
        toast.error(data.message || 'Action failed.');
        return false;
      }
    } catch (err) {
      toast.error('Login session missing or offline.');
      return false;
    }
  };

  // Toggle 30m Notification reminder
  const toggleReminder = async (eventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}/notify`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notification reminder set for 30m before start!');
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error('Error toggling reminder.');
      return false;
    }
  };

  // Organizer modifies Event details (Preset posters, Google Form, winners, photos)
  const updateEventOrganizer = async (eventId, organizerDetails) => {
    try {
      const res = await fetch(`/api/events/${eventId}/organizer`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(organizerDetails)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Organizer console modifications saved!');
        fetchEvents();
        fetchNotices();
        return true;
      } else {
        toast.error(data.message || 'Save failed.');
        return false;
      }
    } catch (err) {
      toast.error('Network Error: Server offline.');
      return false;
    }
  };

  // Submit star rating feedback
  const submitFeedback = async (eventId, ratingData) => {
    try {
      const res = await fetch(`/api/events/${eventId}/feedback`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ratingData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Feedback review logged! Satisfaction score updated to ${data.percentage}%.`);
        fetchEvents();
        fetchNotices();
        return true;
      } else {
        toast.error(data.message || 'Feedback log failed.');
        return false;
      }
    } catch (err) {
      toast.error('Server offline.');
      return false;
    }
  };

  // Modify calendar days (holidays/exams)
  const saveCalendarDayAgenda = async (agendaDetails) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(agendaDetails)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Calendar agenda saved successfully!');
        fetchCalendarEntries();
        fetchNotices();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error('Error saving calendar entry.');
      return false;
    }
  };

  // Delete calendar entries
  const deleteCalendarDayAgenda = async (id) => {
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Calendar entry deleted.');
        fetchCalendarEntries();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error('Error deleting calendar item.');
      return false;
    }
  };

  // Post Global scrolling bulletin Notice
  const postScrollingNotice = async (noticeMessage) => {
    try {
      const res = await fetch('/api/calendar/notices', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: noticeMessage })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Announcement notice published!');
        fetchNotices();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error('Error posting bulletin.');
      return false;
    }
  };

  return (
    <EventContext.Provider value={{
      events,
      proposals,
      calendarEntries,
      notices,
      loading,
      fetchEvents,
      fetchProposals,
      fetchCalendarEntries,
      fetchNotices,
      submitProposal,
      approveProposal,
      rejectProposal,
      createEventPage,
      registerForEvent,
      toggleReminder,
      updateEventOrganizer,
      submitFeedback,
      saveCalendarDayAgenda,
      deleteCalendarDayAgenda,
      postScrollingNotice
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
