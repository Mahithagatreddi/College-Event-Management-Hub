/**
 * =========================================================================
 * BTECH HUB - COLLEGE EVENT MANAGEMENT APPLICATION ENGINE
 * -------------------------------------------------------------------------
 * This single-page application engine handles routing, authentication,
 * calendar calculations, proposal flows, feedback mechanisms, and high-fidelity
 * visual effects. Designed for student learning with highly-detailed comments.
 * =========================================================================
 */

// 1. GLOBAL STATE CONFIGURATION
const SYSTEM_YEAR = 2026; // Set as 2026 representing the target academic context
const SYSTEM_MONTH = 5;    // June (0-indexed, so 5 = June)

class AppState {
  constructor() {
    this.currentUser = null;       // Currently authenticated user object
    this.currentView = 'home';     // Currently visible dashboard view
    this.calendarYear = SYSTEM_YEAR;
    this.calendarMonth = SYSTEM_MONTH;
    this.selectedDateStr = "2026-06-02"; // Standard highlighted date on boot
    this.activeFeedbackRating = 0; // Temp holding variable for star rating
    this.selectedPresetPoster = 'tech'; // Temp holding variable for organizer preset poster
  }
}

// 2. MOCK PERSISTENT LOCAL STORAGE DATABASE
class MockDatabase {
  constructor() {
    this.initDatabase();
  }

  // Pre-seed mock data if empty
  initDatabase() {
    if (!localStorage.getItem('btech_db_initialized')) {
      const initialCoordinators = [
        { username: 'coordinator', password: 'coordinator', status: 'active', role: 'Academic Coordinator', createdAt: '2026-06-01' }
      ];

      const initialStudents = [
        {
          rollNo: '24481A1270',
          password: 'pass',
          name: 'Vikram Reddy',
          admissionYear: 2024,
          pursuingYear: 3, // Calculated dynamically: 2026 - 2024 + 1
          gradYear: 2028,
          badges: [
            { eventId: 'evt-1', badgeName: '🏆 Organizer: AI Summit', rating: 96 }
          ]
        },
        {
          rollNo: '25481A0512',
          password: 'pass',
          name: 'Meghana Sen',
          admissionYear: 2025,
          pursuingYear: 2,
          gradYear: 2029,
          badges: []
        },
        {
          rollNo: '23481A0401',
          password: 'pass',
          name: 'Rohan Sharma',
          admissionYear: 2023,
          pursuingYear: 4,
          gradYear: 2027,
          badges: []
        }
      ];

      const initialEvents = [
        {
          id: 'evt-1',
          title: 'AI & Robotics Summit',
          category: 'Technical',
          summary: 'A futuristic tech summit presenting automated model networks and physical robotic arms.',
          description: 'The AI & Robotics Summit brought top innovators from across the state. Handled fully by Vikram Reddy, the event featured hands-on workshops on LLM tuning, drone programming, and sensor setups.',
          date: '2026-05-28',
          time: '10:00',
          organizerRoll: '24481A1270',
          organizerName: 'Vikram Reddy',
          status: 'Completed',
          posterPreset: 'tech',
          gFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfD-tech/viewform',
          ndliLink: 'https://ndl.iitkgp.ac.in/document/AI-Summit-Tech',
          registeredStudents: ['25481A0512', '23481A0401'],
          photos: [
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600',
            'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600'
          ],
          winners: [
            { rank: 1, name: 'Siddharth Sen', roll: '24481A0540' },
            { rank: 2, name: 'Aditi Roy', roll: '24481A1211' },
            { rank: 3, name: 'Harish Rao', roll: '25481A0422' }
          ],
          feedbacks: [
            { studentRoll: '25481A0512', rating: 5, comment: 'Outstanding robotics demonstration! Very informative.' },
            { studentRoll: '23481A0401', rating: 4, comment: 'Great speaker sessions. Learned a lot about machine learning.' }
          ]
        },
        {
          id: 'evt-2',
          title: "Rhythm '26 Cultural Night",
          category: 'Cultural',
          summary: 'Annual department cultural festival celebrating dance, music, and dramatic arts.',
          description: 'A spectacular cultural explosion showcasing the finest artistic talents in classical fusion dance, battle of the bands, and theatrical dramas. Supported by modern acoustic engineering systems.',
          date: '2026-06-18',
          time: '17:30',
          organizerRoll: '25481A0512',
          organizerName: 'Meghana Sen',
          status: 'Upcoming',
          posterPreset: 'cultural',
          gFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfCultural/viewform',
          ndliLink: 'https://ndl.iitkgp.ac.in/document/Art-And-Culture',
          registeredStudents: ['24481A1270'],
          photos: [],
          winners: [],
          feedbacks: []
        },
        {
          id: 'evt-3',
          title: 'Badminton Championship',
          category: 'Sports',
          summary: 'Annual double-court badminton championship for BTech students.',
          description: 'Speed, reflex, and sheer endurance on the double court arena. Standard tournament format with mixed doubles and single knockouts.',
          date: '2026-06-15',
          time: '09:00',
          organizerRoll: '23481A0401',
          organizerName: 'Rohan Sharma',
          status: 'Live',
          posterPreset: 'sports',
          gFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfSports/viewform',
          ndliLink: 'https://ndl.iitkgp.ac.in/document/Sports-Science',
          registeredStudents: ['24481A1270', '25481A0512'],
          photos: [],
          winners: [],
          feedbacks: []
        }
      ];

      const initialProposals = [
        {
          id: 'prop-1',
          title: 'Cyber Security Hackathon',
          category: 'Technical',
          summary: '24-hour capture the flag tournament testing defensive and offensive cyber rules.',
          description: 'We propose a Capture the Flag hackathon where students will hack simulated servers, crack encryptions, and resolve secure networking flaws. This helps department students build cyber analytics skills.',
          studentRoll: '24481A1270',
          studentName: 'Vikram Reddy',
          status: 'Pending',
          submittedAt: '2026-06-02'
        }
      ];

      const initialCalendarAgendas = [
        { date: '2026-06-10', title: 'Mid-Term Examinations Start', type: 'exam' },
        { date: '2026-06-14', title: 'Preparation Holiday', type: 'holiday' },
        { date: '2026-06-25', title: 'Practical Lab External Exams', type: 'exam' }
      ];

      const initialNotices = [
        'Welcome to BTech Department Event Portal!',
        'Congratulations to Vikram Reddy for organizing the AI & Robotics Summit (96% Positive Feedback!).',
        'Academic Coordinator Notice: Mid-Term exams commence from June 10th. Calendar updated.',
        'Registration active for Rhythm \'26 Night! Google Forms provided.'
      ];

      localStorage.setItem('btech_coordinators', JSON.stringify(initialCoordinators));
      localStorage.setItem('btech_students', JSON.stringify(initialStudents));
      localStorage.setItem('btech_events', JSON.stringify(initialEvents));
      localStorage.setItem('btech_proposals', JSON.stringify(initialProposals));
      localStorage.setItem('btech_calendar_agendas', JSON.stringify(initialCalendarAgendas));
      localStorage.setItem('btech_notices', JSON.stringify(initialNotices));
      localStorage.setItem('btech_db_initialized', 'true');
    }
  }

  // Database helper actions
  get(key) {
    return JSON.parse(localStorage.getItem('btech_' + key)) || [];
  }

  set(key, data) {
    localStorage.setItem('btech_' + key, JSON.stringify(data));
  }
}

// 3. CORE CONTROLLER APPLICATION CLASS
class ApplicationController {
  constructor() {
    this.db = new MockDatabase();
    this.state = new AppState();
    
    // Automatically load session if existing
    const cachedUser = sessionStorage.getItem('btech_session');
    if (cachedUser) {
      this.state.currentUser = JSON.parse(cachedUser);
    }
    
    this.initDOM();
  }

  // Mount components and start event registers
  initDOM() {
    this.renderNoticesMarquee();
    this.updateUIState();
    
    // Add event listener for auto upper-casing roll numbers
    const rollInput = document.getElementById('student-roll');
    if (rollInput) {
      rollInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    }

    // Set clock in header
    document.getElementById('system-clock-date').textContent = new Date(SYSTEM_YEAR, SYSTEM_MONTH, 2).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // 4. AUTHENTICATION & SECURITY ENGINE
  // Parse roll number and calculate BTech age, bounds, and expiration
  parseRollNumber(rollNo) {
    const regex = /^[0-9]{2}[0-9A-Z]{8}$/;
    if (!regex.test(rollNo)) {
      return { valid: false, error: 'Invalid Roll Number structure. Use format: 24481A1270' };
    }

    // Extract admission year digits (first 2 characters)
    const yearDigits = parseInt(rollNo.substring(0, 2), 10);
    const admissionYear = 2000 + yearDigits;
    const graduationYear = admissionYear + 4; // BTech duration is 4 years

    // EXPIRED GRADUATED ACCESS REVOKED RULE
    // If the system year (2026) is greater than or equal to graduation year, block access.
    if (SYSTEM_YEAR >= graduationYear) {
      return {
        valid: false,
        error: `Access Expired! You graduated in ${graduationYear}. Your BTech student access is restricted to 4 active years.`
      };
    }

    // PURSUING STUDY YEAR CALCULATION
    // Formula: Current Year (2026) - Admission Year (e.g. 2024) + 1 = 3rd Year
    const pursuingYear = SYSTEM_YEAR - admissionYear + 1;
    let yearLabel = `${pursuingYear}rd Year BTech`;
    if (pursuingYear === 1) yearLabel = '1st Year BTech';
    if (pursuingYear === 2) yearLabel = '2nd Year BTech';
    if (pursuingYear === 4) yearLabel = '4th Year BTech';

    return {
      valid: true,
      admissionYear,
      graduationYear,
      pursuingYear,
      yearLabel
    };
  }

  // Student portal authentication: Login or Register
  authenticateStudent(isRegister = false) {
    const rollInput = document.getElementById('student-roll').value.trim();
    const passInput = document.getElementById('student-pass').value;
    const errorBox = document.getElementById('auth-error-alert');
    const errorText = document.getElementById('auth-error-text');

    errorBox.style.display = 'none';

    if (!rollInput || !passInput) {
      this.showAuthError('Please fill in both Roll Number and Password.');
      return;
    }

    // Validate structure and graduation eligibility
    const rollReport = this.parseRollNumber(rollInput);
    if (!rollReport.valid) {
      this.showAuthError(rollReport.error);
      return;
    }

    const students = this.db.get('students');
    const existingIndex = students.findIndex(s => s.rollNo === rollInput);

    if (isRegister) {
      if (existingIndex !== -1) {
        this.showAuthError('Roll Number already registered. Please Login instead.');
        return;
      }

      // Name generator based on roll number
      const names = ['Amit Kumar', 'Sanjana Roy', 'Tarun Dev', 'Kavya Sree', 'Pooja Naik', 'Rahul Varma'];
      const randomName = names[Math.floor(Math.random() * names.length)] + ` (${rollInput.substring(7)})`;

      const newStudent = {
        rollNo: rollInput,
        password: passInput,
        name: randomName,
        admissionYear: rollReport.admissionYear,
        pursuingYear: rollReport.pursuingYear,
        gradYear: rollReport.graduationYear,
        badges: []
      };

      students.push(newStudent);
      this.db.set('students', students);

      this.state.currentUser = {
        type: 'student',
        rollNo: rollInput,
        name: randomName,
        role: rollReport.yearLabel,
        gradYear: rollReport.graduationYear,
        admissionYear: rollReport.admissionYear
      };

      this.showToast('Registration successful! Welcome to the hub.', 'success');
    } else {
      // Login Routine
      if (existingIndex === -1) {
        this.showAuthError('Roll Number not registered. Please register first.');
        return;
      }

      const student = students[existingIndex];
      if (student.password !== passInput) {
        this.showAuthError('Incorrect Password. Please try again.');
        return;
      }

      this.state.currentUser = {
        type: 'student',
        rollNo: student.rollNo,
        name: student.name,
        role: rollReport.yearLabel, // Make sure pursuing year recalculates dynamically
        gradYear: student.gradYear,
        admissionYear: student.admissionYear
      };

      this.showToast(`Logged in successfully. Welcome back, ${student.name}!`, 'success');
    }

    // Save active session
    sessionStorage.setItem('btech_session', JSON.stringify(this.state.currentUser));
    this.updateUIState();
  }

  // Coordinator & Staff verification routine
  authenticateStaff() {
    const username = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const errorBox = document.getElementById('auth-error-alert');

    errorBox.style.display = 'none';

    if (!username || !pass) {
      this.showAuthError('Please enter credentials.');
      return;
    }

    // 1. Check Super Admin Credentials (Hardcoded)
    if (username === 'admin' && pass === 'superadmin') {
      this.state.currentUser = {
        type: 'superadmin',
        username: 'System Admin',
        role: 'Super Administrator',
        name: 'System Admin'
      };
      this.showToast('Super Admin verified!', 'info');
      sessionStorage.setItem('btech_session', JSON.stringify(this.state.currentUser));
      this.updateUIState();
      return;
    }

    // 2. Check Academic Coordinator credentials (Stored database)
    const coordinators = this.db.get('coordinators');
    const coord = coordinators.find(c => c.username === username);

    if (!coord || coord.password !== pass) {
      this.showAuthError('Access Denied. Invalid staff credentials.');
      return;
    }

    if (coord.status !== 'active') {
      this.showAuthError('Your Coordinator account has been suspended by the Super Admin.');
      return;
    }

    this.state.currentUser = {
      type: 'coordinator',
      username: coord.username,
      role: 'Academic Coordinator',
      name: 'Academic Coordinator'
    };

    this.showToast('Academic Coordinator verified!', 'success');
    sessionStorage.setItem('btech_session', JSON.stringify(this.state.currentUser));
    this.updateUIState();
  }

  // Handle Logout
  logoutUser() {
    sessionStorage.removeItem('btech_session');
    this.state.currentUser = null;
    this.state.currentView = 'home';
    this.updateUIState();
    this.showToast('Logged out successfully.', 'info');
  }

  showAuthError(msg) {
    const errorBox = document.getElementById('auth-error-alert');
    const errorText = document.getElementById('auth-error-text');
    errorText.textContent = msg;
    errorBox.style.display = 'flex';
  }

  toggleAuthTab(tab) {
    document.getElementById('tab-student').classList.toggle('active', tab === 'student');
    document.getElementById('tab-admin').classList.toggle('active', tab === 'admin');
    
    document.getElementById('student-auth-form').style.display = tab === 'student' ? 'block' : 'none';
    document.getElementById('admin-auth-form').style.display = tab === 'admin' ? 'block' : 'none';
    document.getElementById('auth-error-alert').style.display = 'none';
  }


  // 5. VIEW MANAGER & INTERFACE RENDERER
  // Switches visible sections based on user role authorizations
  switchView(viewName) {
    this.state.currentView = viewName;
    
    // Deactivate all nav buttons
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    
    // Hide all view screens
    document.getElementById('view-home').style.display = 'none';
    document.getElementById('view-calendar').style.display = 'none';
    document.getElementById('view-proposals').style.display = 'none';
    document.getElementById('view-inbox').style.display = 'none';
    document.getElementById('view-superadmin').style.display = 'none';

    // Show selected view
    const viewEl = document.getElementById(`view-${viewName}`);
    if (viewEl) viewEl.style.display = 'block';

    // Activate current menu-item button
    const navBtn = document.getElementById(`nav-${viewName}`);
    if (navBtn) navBtn.classList.add('active');

    // Run view specific initializers
    if (viewName === 'home') {
      this.renderWinnersWall();
      this.filterEvents('all');
    } else if (viewName === 'calendar') {
      this.renderCalendar();
      this.renderAgendaList();
    } else if (viewName === 'proposals') {
      this.renderStudentProposalsList();
    } else if (viewName === 'inbox') {
      this.renderCoordinatorInbox();
    } else if (viewName === 'superadmin') {
      this.renderSuperAdminPanel();
    }
  }

  // Controls UI layout based on authorization roles
  updateUIState() {
    const authPanel = document.getElementById('auth-panel');
    const appPanel = document.getElementById('app-panel');

    if (!this.state.currentUser) {
      authPanel.style.display = 'flex';
      appPanel.style.display = 'none';
      return;
    }

    authPanel.style.display = 'none';
    appPanel.style.display = 'block';

    const user = this.state.currentUser;

    // Header Profile updates
    document.getElementById('header-avatar').textContent = user.name.substring(0, 2).toUpperCase();
    document.getElementById('header-username').textContent = user.name;
    document.getElementById('header-role').textContent = user.role;

    // Navigation updates
    const navProposals = document.getElementById('nav-proposals');
    const navInbox = document.getElementById('nav-inbox');
    const navSuperadmin = document.getElementById('nav-superadmin');
    const profileBadges = document.getElementById('profile-organizer-pill-box');
    const calendarHint = document.getElementById('calendar-coordinator-hint');

    // Default configuration (all disabled)
    navProposals.style.display = 'none';
    navInbox.style.display = 'none';
    navSuperadmin.style.display = 'none';
    profileBadges.style.display = 'none';
    calendarHint.style.display = 'none';

    if (user.type === 'student') {
      navProposals.style.display = 'flex';
      profileBadges.style.display = 'block';
      this.renderOrganizerBadges();
    } else if (user.type === 'coordinator') {
      navInbox.style.display = 'flex';
      calendarHint.style.display = 'block';
      this.updateInboxCountBadge();
    } else if (user.type === 'superadmin') {
      navSuperadmin.style.display = 'flex';
    }

    // Switch view to home to start
    this.switchView('home');
  }


  // 6. WINNERS SCROLLER & CONFETTI CELEBRATIONS
  // Populates the top winners wall from completed events
  renderWinnersWall() {
    const scroller = document.getElementById('winners-scroller');
    scroller.innerHTML = '';

    const events = this.db.get('events');
    const completedEvents = events.filter(e => e.status === 'Completed' && e.winners && e.winners.length > 0);

    if (completedEvents.length === 0) {
      scroller.innerHTML = `
        <div class="agenda-empty-state" style="padding: 1rem 0; width: 100%;">
          No completed events listed yet. Winners will scroll here soon!
        </div>`;
      return;
    }

    completedEvents.forEach(evt => {
      // Add top 3 winners
      evt.winners.forEach(w => {
        const card = document.createElement('div');
        card.className = 'winner-card';
        card.setAttribute('title', 'Click to blast Confetti celebration!');
        
        let rankClass = 'winner-rank-3';
        if (w.rank === 1) rankClass = 'winner-rank-1';
        if (w.rank === 2) rankClass = 'winner-rank-2';

        card.innerHTML = `
          <div class="winner-rank ${rankClass}">${w.rank}</div>
          <div class="winner-details">
            <div class="winner-name">${w.name}</div>
            <div class="winner-roll">${w.roll}</div>
            <div class="winner-event"><i class="fa-solid fa-trophy"></i> ${evt.title}</div>
          </div>
        `;

        // Interactive confetti launch on hover or click
        card.addEventListener('click', () => this.triggerConfettiBlast());
        card.addEventListener('mouseenter', () => this.triggerConfettiStream());

        scroller.appendChild(card);
      });
    });
  }

  triggerConfettiBlast() {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }

  triggerConfettiStream() {
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
  }


  // 7. EVENTS BULLETIN HUB (FEED)
  filterEvents(category) {
    const container = document.getElementById('events-grid-view');
    container.innerHTML = '';

    const events = this.db.get('events');
    const user = this.state.currentUser;

    // Filter tabs toggle activation
    document.querySelectorAll('#event-filter-tabs .filter-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    let filtered = [];

    if (category === 'all') {
      filtered = events;
      document.querySelector('#event-filter-tabs .filter-tab:nth-child(1)').classList.add('active');
    } else if (category === 'registered') {
      filtered = events.filter(e => e.registeredStudents.includes(user.rollNo));
      document.getElementById('filter-reg-tab').classList.add('active');
    } else {
      filtered = events.filter(e => e.category === category);
      // Highlight exact category tab
      const tabIdx = category === 'Technical' ? 2 : category === 'Cultural' ? 3 : 4;
      document.querySelector(`#event-filter-tabs .filter-tab:nth-child(${tabIdx})`).classList.add('active');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="agenda-empty-state" style="grid-column: 1 / -1; padding: 4rem 0;">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2.5rem; margin-bottom: 1rem; display: block;"></i>
          No events found in this category.
        </div>`;
      return;
    }

    // Sort: Live events first, then Upcoming, then Completed
    filtered.sort((a, b) => {
      const order = { 'Live': 1, 'Upcoming': 2, 'Completed': 3 };
      return order[a.status] - order[b.status];
    });

    filtered.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card glass-panel glow-cyan-hover';
      card.onclick = () => this.openEventDetails(evt.id);

      let statusClass = 'status-upcoming';
      if (evt.status === 'Live') statusClass = 'status-live';
      if (evt.status === 'Completed') statusClass = 'status-completed';

      // Set poster backgrounds based on presets or defaults
      let posterUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'; // Tech standard
      if (evt.posterPreset === 'cultural') posterUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600';
      if (evt.posterPreset === 'sports') posterUrl = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600';

      card.innerHTML = `
        <div class="event-card-banner" style="background-image: url('${posterUrl}')">
          <span class="event-status-badge ${statusClass}">${evt.status}</span>
        </div>
        <div class="event-card-body">
          <h3 class="event-card-title">${evt.title}</h3>
          <p class="event-card-desc">${evt.summary}</p>
          <div class="event-card-meta">
            <div class="event-card-meta-item">
              <i class="fa-solid fa-calendar"></i> ${new Date(evt.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
            </div>
            <div class="event-card-meta-item">
              <i class="fa-solid fa-user-check"></i> ${evt.registeredStudents.length} Registered
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }


  // 8. EVENT DETAILED OVERLAY & ORGANIZER MANAGEMENT
  openEventDetails(id) {
    const events = this.db.get('events');
    const evt = events.find(e => e.id === id);
    if (!evt) return;

    this.state.currentEventId = id;
    this.state.activeFeedbackRating = 0;

    // Load overlays and UI fields
    const overlay = document.getElementById('event-page-overlay');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Stop background scrolling

    // Text & Headers
    document.getElementById('event-page-title').textContent = evt.title;
    document.getElementById('event-page-desc').textContent = evt.description;
    document.getElementById('event-page-time-meta').innerHTML = `<i class="fa-solid fa-clock"></i> Scheduled: ${evt.date} @ ${evt.time}`;

    // Badge styling
    const badge = document.getElementById('event-page-badge');
    badge.textContent = evt.status;
    badge.className = 'event-status-badge';
    if (evt.status === 'Upcoming') badge.classList.add('status-upcoming');
    if (evt.status === 'Live') badge.classList.add('status-live');
    if (evt.status === 'Completed') badge.classList.add('status-completed');

    // Poster background
    let posterUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000';
    if (evt.posterPreset === 'cultural') posterUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000';
    if (evt.posterPreset === 'sports') posterUrl = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000';
    document.getElementById('event-page-hero').style.backgroundImage = `url('${posterUrl}')`;

    // Reset details columns
    document.getElementById('event-page-winners-section').style.display = 'none';
    document.getElementById('event-page-gallery-section').style.display = 'none';
    document.getElementById('event-page-feedback-section').style.display = 'none';

    document.getElementById('event-gform-link').style.display = 'none';
    document.getElementById('event-ndli-link').style.display = 'none';

    // Show preset Google form and NDLI buttons if available
    if (evt.gFormLink) {
      document.getElementById('event-gform-link').style.display = 'block';
      document.getElementById('event-gform-link').href = evt.gFormLink;
    }
    if (evt.ndliLink) {
      document.getElementById('event-ndli-link').style.display = 'block';
      document.getElementById('event-ndli-link').href = evt.ndliLink;
    }

    // Dynamic state components based on status
    if (evt.status === 'Completed') {
      // 1. Winners Board Display
      if (evt.winners && evt.winners.length > 0) {
        document.getElementById('event-page-winners-section').style.display = 'block';
        const wList = document.getElementById('event-page-winners-list');
        wList.innerHTML = '';
        evt.winners.forEach(w => {
          const row = document.createElement('div');
          row.className = 'winner-row';
          row.innerHTML = `
            <div style="font-weight: 700; width: 30px; text-align: center; color: var(--color-warning);">${w.rank}</div>
            <div style="flex:1;">${w.name} (${w.roll})</div>
          `;
          wList.appendChild(row);
        });
      }

      // 2. Photo gallery highlights
      if (evt.photos && evt.photos.length > 0) {
        document.getElementById('event-page-gallery-section').style.display = 'block';
        const gGrid = document.getElementById('event-page-gallery-grid');
        gGrid.innerHTML = '';
        evt.photos.forEach(p => {
          const item = document.createElement('div');
          item.className = 'gallery-item';
          item.style.backgroundImage = `url('${p}')`;
          gGrid.appendChild(item);
        });
      }

      // 3. Feedback Form Activation
      // Visible for students who registered for this event
      const user = this.state.currentUser;
      if (user && user.type === 'student' && evt.registeredStudents.includes(user.rollNo)) {
        document.getElementById('event-page-feedback-section').style.display = 'block';
        
        // Check if student already left a review
        const reviewed = evt.feedbacks.some(f => f.studentRoll === user.rollNo);
        if (reviewed) {
          document.getElementById('feedback-form-container').style.display = 'none';
          document.getElementById('feedback-submitted-state').style.display = 'block';
        } else {
          document.getElementById('feedback-form-container').style.display = 'block';
          document.getElementById('feedback-submitted-state').style.display = 'none';
          this.setFeedbackRating(0); // Reset stars selection
        }
      }

      // Hide Registration box on completed events
      document.getElementById('event-action-register-box').style.display = 'none';
    } else {
      // Event is live or upcoming
      document.getElementById('event-action-register-box').style.display = 'block';
      this.renderRegistrationStatus(evt);
    }

    // 4. ORGANIZER CONSOLE VISIBILITY
    // Student sees this console if they are assigned as organizer for this event
    const organizerConsole = document.getElementById('organizer-control-console');
    organizerConsole.style.display = 'none';

    const user = this.state.currentUser;
    if (user && user.type === 'student' && evt.organizerRoll === user.rollNo) {
      organizerConsole.style.display = 'block';
      
      // Load event parameters into inputs
      document.getElementById('org-event-status').value = evt.status;
      document.getElementById('org-gform-input').value = evt.gFormLink || '';
      document.getElementById('org-ndli-input').value = evt.ndliLink || '';

      this.selectPresetPoster(evt.posterPreset || 'tech');
      this.toggleOrganizerCompletionInputs(evt.status === 'Completed');
    }
  }

  closeEventDetails() {
    document.getElementById('event-page-overlay').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable background scrolling
    this.filterEvents('all'); // Refresh feed
  }

  // Registration Button update
  renderRegistrationStatus(evt) {
    const user = this.state.currentUser;
    const btn = document.getElementById('event-register-btn');
    const countEl = document.getElementById('event-registered-count');

    countEl.textContent = `${evt.registeredStudents.length} Students Registered`;

    if (user && user.type === 'student') {
      const registered = evt.registeredStudents.includes(user.rollNo);
      btn.innerHTML = registered ? `<i class="fa-solid fa-user-minus"></i> Cancel Registration` : `<i class="fa-solid fa-user-plus"></i> Register for Event`;
      btn.className = registered ? "btn btn-outline" : "btn btn-primary";
    } else {
      btn.innerHTML = `<i class="fa-solid fa-lock"></i> Students Only`;
      btn.disabled = true;
    }
  }

  // Toggle dynamic registration state
  toggleEventRegistration() {
    const events = this.db.get('events');
    const evt = events.find(e => e.id === this.state.currentEventId);
    const user = this.state.currentUser;

    if (!user || user.type !== 'student') return;

    const index = evt.registeredStudents.indexOf(user.rollNo);
    if (index === -1) {
      evt.registeredStudents.push(user.rollNo);
      this.showToast('Registered successfully! Head to your Event Feed.', 'success');
    } else {
      evt.registeredStudents.splice(index, 1);
      this.showToast('Registration cancelled.', 'info');
    }

    this.db.set('events', events);
    this.renderRegistrationStatus(evt);
  }

  // Toggle notifier warning
  toggleNotificationReminder() {
    const btn = document.getElementById('event-notify-btn');
    const active = btn.classList.contains('btn-secondary');

    if (active) {
      btn.className = "btn btn-outline";
      btn.innerHTML = `<i class="fa-solid fa-bell"></i> Notify Me (30m Before)`;
      this.showToast('Reminder alert removed.', 'info');
    } else {
      btn.className = "btn btn-secondary";
      btn.innerHTML = `<i class="fa-solid fa-bell-slash"></i> Reminder Set`;
      this.showToast('Notification set! We will alert you 30m prior to start.', 'success');

      // Simulates real-time notification loop using in-app Toast after 5 seconds!
      setTimeout(() => {
        const events = this.db.get('events');
        const evt = events.find(e => e.id === this.state.currentEventId);
        if (evt) {
          this.showToast(`🔔 ALERT: ${evt.title} is starting in 30 minutes!`, 'info');
        }
      }, 5000);
    }
  }

  // 9. ORGANIZER DETAILS SAVES
  selectPresetPoster(preset) {
    this.state.selectedPresetPoster = preset;
    document.querySelectorAll('.preset-poster-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById(`poster-preset-${preset.substring(0, 4)}`).classList.add('selected');
    this.saveOrganizerLinks();
  }

  toggleOrganizerCompletionInputs(show) {
    const compInputs = document.getElementById('org-completion-inputs');
    compInputs.style.display = show ? 'block' : 'none';
  }

  updateEventStatus(status) {
    const events = this.db.get('events');
    const evt = events.find(e => e.id === this.state.currentEventId);
    evt.status = status;
    this.db.set('events', events);

    // Update overlay status badge
    const badge = document.getElementById('event-page-badge');
    badge.textContent = status;
    badge.className = 'event-status-badge';
    if (status === 'Upcoming') badge.classList.add('status-upcoming');
    if (status === 'Live') badge.classList.add('status-live');
    if (status === 'Completed') badge.classList.add('status-completed');

    this.toggleOrganizerCompletionInputs(status === 'Completed');
    this.showToast(`Event stage updated to: ${status}`, 'success');
  }

  saveOrganizerLinks() {
    const events = this.db.get('events');
    const evt = events.find(e => e.id === this.state.currentEventId);
    
    evt.gFormLink = document.getElementById('org-gform-input').value.trim();
    evt.ndliLink = document.getElementById('org-ndli-input').value.trim();
    evt.posterPreset = this.state.selectedPresetPoster;

    this.db.set('events', events);
  }

  // Publishes finalized winners list and photos
  submitOrganizerCompletion() {
    const events = this.db.get('events');
    const evt = events.find(e => e.id === this.state.currentEventId);

    // Fetch winner roll inputs
    const w1Name = document.getElementById('org-win-1-name').value.trim();
    const w1Roll = document.getElementById('org-win-1-roll').value.trim();
    const w2Name = document.getElementById('org-win-2-name').value.trim();
    const w2Roll = document.getElementById('org-win-2-roll').value.trim();
    const w3Name = document.getElementById('org-win-3-name').value.trim();
    const w3Roll = document.getElementById('org-win-3-roll').value.trim();

    if (!w1Name || !w1Roll) {
      this.showToast('Please enter at least the First Place Winner details.', 'error');
      return;
    }

    evt.winners = [
      { rank: 1, name: w1Name, roll: w1Roll },
      { rank: 2, name: w2Name || 'Not Awarded', roll: w2Roll || '' },
      { rank: 3, name: w3Name || 'Not Awarded', roll: w3Roll || '' }
    ];

    // Read selected photo presets (Standard Unsplash URLs)
    const gallery = [];
    if (document.getElementById('gallery-preset-1').checked) gallery.push('https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600');
    if (document.getElementById('gallery-preset-2').checked) gallery.push('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600');
    if (document.getElementById('gallery-preset-3').checked) gallery.push('https://images.unsplash.com/photo-1511578314322-379afb476865?w=600');

    evt.photos = gallery;
    this.db.set('events', events);

    // Refresh overlay page
    this.openEventDetails(evt.id);
    this.showToast('Winners list and photos published successfully!', 'success');
    this.triggerConfettiBlast();
  }


  // 10. STAR FEEDBACK ENGINE & RECTIFICATIONS
  setFeedbackRating(rating) {
    this.state.activeFeedbackRating = rating;
    const stars = document.querySelectorAll('#star-rating-select i');
    
    stars.forEach((star, idx) => {
      if (idx < rating) {
        star.classList.add('active');
        star.style.color = 'var(--color-warning)';
      } else {
        star.classList.remove('active');
        star.style.color = 'var(--text-dim)';
      }
    });
  }

  submitFeedback() {
    const rating = this.state.activeFeedbackRating;
    const comment = document.getElementById('feedback-comment-input').value.trim();
    const user = this.state.currentUser;

    if (rating === 0) {
      this.showToast('Please select a star rating first.', 'error');
      return;
    }

    const events = this.db.get('events');
    const evt = events.find(e => e.id === this.state.currentEventId);

    evt.feedbacks.push({
      studentRoll: user.rollNo,
      rating: rating,
      comment: comment
    });

    this.db.set('events', events);

    // RE-CALCULATE OVERALL FEEDBACK RATING % & ASSIGN ORGANIZER BADGES
    // Math: Sum of stars given / (total reviews * 5 stars) * 100
    const totalStars = evt.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const calculatedPercentage = Math.round((totalStars / (evt.feedbacks.length * 5)) * 100);

    // Load student organizer profiles to allocate badge
    const students = this.db.get('students');
    const organizer = students.find(s => s.rollNo === evt.organizerRoll);

    if (organizer) {
      // Check if organizer already has badge for this event, otherwise add it
      const badgeIndex = organizer.badges.findIndex(b => b.eventId === evt.id);
      const badgeData = {
        eventId: evt.id,
        badgeName: `🏆 Organizer: ${evt.title}`,
        rating: calculatedPercentage
      };

      if (badgeIndex !== -1) {
        organizer.badges[badgeIndex] = badgeData;
      } else {
        organizer.badges.push(badgeData);
      }

      this.db.set('students', students);

      // Add dynamic scrolling bulletin congratulating student!
      const notices = this.db.get('notices');
      const congratsNotice = `Kudos to ${organizer.name} (${organizer.rollNo})! Event "${evt.title}" finished with a stellar ${calculatedPercentage}% satisfaction score.`;
      notices.push(congratsNotice);
      this.db.set('notices', notices);
      this.renderNoticesMarquee();
    }

    // Toggle submission visual fields in review card
    document.getElementById('feedback-form-container').style.display = 'none';
    document.getElementById('feedback-submitted-state').style.display = 'block';

    this.showToast('Review submitted successfully!', 'success');
  }

  renderOrganizerBadges() {
    const list = document.getElementById('organizer-badges-list');
    list.innerHTML = '';

    const students = this.db.get('students');
    const student = students.find(s => s.rollNo === this.state.currentUser.rollNo);

    if (!student || !student.badges || student.badges.length === 0) {
      list.innerHTML = `<span style="font-size:0.7rem; color:var(--text-dim)">No badges earned yet. Pitch and execute an event to earn badges!</span>`;
      return;
    }

    student.badges.forEach(b => {
      const span = document.createElement('span');
      span.className = 'badge-pill';
      span.innerHTML = `${b.badgeName} (${b.rating}%)`;
      list.appendChild(span);
    });
  }


  // 11. INTERACTIVE DEPARTMENT CALENDAR GRID ENGINE
  renderCalendar() {
    const datesGrid = document.getElementById('calendar-dates-grid');
    // Clear dynamic grids (leave labels)
    document.querySelectorAll('.calendar-cell').forEach(cell => cell.remove());

    const year = this.state.calendarYear;
    const month = this.state.calendarMonth; // June = 5

    // Get number of days in chosen month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Get start day offset (0 = Sunday, 1 = Monday)
    const firstDayOffset = new Date(year, month, 1).getDay();

    document.getElementById('calendar-month-title').textContent = new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long', year: 'numeric'
    });

    const agendas = this.db.get('calendar_agendas');
    const events = this.db.get('events');

    // 1. Generate padding cells for initial offsets
    for (let i = 0; i < firstDayOffset; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell different-month';
      datesGrid.appendChild(cell);
    }

    // 2. Generate date cells
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cell.setAttribute('data-date', dateString);

      // Make cell active if today is June 2nd 2026
      if (day === 2 && month === 5 && year === 2026) {
        cell.classList.add('active-today');
      }

      cell.innerHTML = `<span class="calendar-date-number">${day}</span>`;

      // 3. Mark indicators inside calendar cells
      const cellIndicators = document.createElement('div');
      cellIndicators.className = 'calendar-event-indicators';

      // Check holidays and exams
      const dayAgendas = agendas.filter(a => a.date === dateString);
      dayAgendas.forEach(a => {
        const dot = document.createElement('span');
        dot.className = `calendar-indicator type-${a.type}`;
        cellIndicators.appendChild(dot);
      });

      // Check scheduled events
      const dayEvents = events.filter(e => e.date === dateString);
      dayEvents.forEach(e => {
        const dot = document.createElement('span');
        dot.className = 'calendar-indicator type-event';
        cellIndicators.appendChild(dot);
      });

      cell.appendChild(cellIndicators);

      // Handle date box clicking
      cell.onclick = () => this.handleCalendarCellClick(dateString);

      datesGrid.appendChild(cell);
    }
  }

  changeCalendarMonth(direction) {
    this.state.calendarMonth += direction;
    if (this.state.calendarMonth < 0) {
      this.state.calendarMonth = 11;
      this.state.calendarYear -= 1;
    } else if (this.state.calendarMonth > 11) {
      this.state.calendarMonth = 0;
      this.state.calendarYear += 1;
    }
    this.renderCalendar();
  }

  handleCalendarCellClick(dateStr) {
    this.state.selectedDateStr = dateStr;
    this.renderAgendaList();

    // Coordinator clicking triggers modal options
    const user = this.state.currentUser;
    if (user && user.type === 'coordinator') {
      this.openCalendarModal(dateStr);
    }
  }

  // Populate dynamic agendas checklist column on the right
  renderAgendaList() {
    const dateStr = this.state.selectedDateStr;
    const container = document.getElementById('agenda-items-container');
    
    // Header updates
    document.getElementById('agenda-selected-date-title').textContent = new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    container.innerHTML = '';

    const agendas = this.db.get('calendar_agendas');
    const events = this.db.get('events');

    const dayAgendas = agendas.filter(a => a.date === dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);

    if (dayAgendas.length === 0 && dayEvents.length === 0) {
      container.innerHTML = `
        <div class="agenda-empty-state">
          <i class="fa-solid fa-calendar-minus" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i>
          No items scheduled for this date.
        </div>`;
      return;
    }

    // Append Exams & Holidays
    dayAgendas.forEach(a => {
      const el = document.createElement('div');
      el.className = `agenda-item type-${a.type}`;
      el.innerHTML = `
        <div class="agenda-item-title">${a.title}</div>
        <div class="agenda-item-meta">
          <span><i class="fa-solid fa-flag"></i> ${a.type === 'holiday' ? 'Department Holiday' : 'Test / Exam'}</span>
        </div>
      `;
      container.appendChild(el);
    });

    // Append scheduled events
    dayEvents.forEach(e => {
      const el = document.createElement('div');
      el.className = 'agenda-item type-event';
      el.style.cursor = 'pointer';
      el.onclick = () => this.openEventDetails(e.id);
      el.innerHTML = `
        <div class="agenda-item-title"><i class="fa-solid fa-bullhorn"></i> ${e.title}</div>
        <div class="agenda-item-meta">
          <span><i class="fa-solid fa-clock"></i> Timings: ${e.time}</span>
          <span style="color: var(--color-secondary); font-weight:600;">View Details</span>
        </div>
      `;
      container.appendChild(el);
    });
  }

  // Calendar Modal details
  openCalendarModal(dateStr) {
    document.getElementById('calendar-date-modal').style.display = 'flex';
    document.getElementById('cal-selected-date').value = dateStr;
    document.getElementById('cal-modal-title').textContent = `Department Agenda for ${dateStr}`;

    // Prefill if agenda exists
    const agendas = this.db.get('calendar_agendas');
    const agenda = agendas.find(a => a.date === dateStr);
    const delBtn = document.getElementById('cal-modal-delete-btn');

    if (agenda) {
      document.getElementById('cal-agenda-title').value = agenda.title;
      document.getElementById('cal-agenda-type').value = agenda.type;
      delBtn.style.display = 'block';
    } else {
      document.getElementById('cal-agenda-title').value = '';
      document.getElementById('cal-agenda-type').value = 'exam';
      delBtn.style.display = 'none';
    }
  }

  closeCalendarModal() {
    document.getElementById('calendar-date-modal').style.display = 'none';
  }

  saveCalendarAgenda() {
    const dateStr = document.getElementById('cal-selected-date').value;
    const title = document.getElementById('cal-agenda-title').value.trim();
    const type = document.getElementById('cal-agenda-type').value;

    if (!title) {
      this.showToast('Please enter an agenda title.', 'error');
      return;
    }

    const agendas = this.db.get('calendar_agendas');
    const existingIdx = agendas.findIndex(a => a.date === dateStr);

    const agendaItem = { date: dateStr, title, type };

    if (existingIdx !== -1) {
      agendas[existingIdx] = agendaItem;
    } else {
      agendas.push(agendaItem);
    }

    this.db.set('calendar_agendas', agendas);
    this.closeCalendarModal();
    this.renderCalendar();
    this.renderAgendaList();
    this.showToast('Calendar agenda updated!', 'success');
  }

  deleteCalendarAgenda() {
    const dateStr = document.getElementById('cal-selected-date').value;
    const agendas = this.db.get('calendar_agendas');
    
    const filtered = agendas.filter(a => a.date !== dateStr);
    this.db.set('calendar_agendas', filtered);

    this.closeCalendarModal();
    this.renderCalendar();
    this.renderAgendaList();
    this.showToast('Agenda item deleted.', 'info');
  }


  // 12. STUDENT REQUESTS WORKFLOW (PROPOSALS)
  submitStudentProposal() {
    const title = document.getElementById('prop-title').value.trim();
    const category = document.getElementById('prop-category').value;
    const summary = document.getElementById('prop-summary').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();
    const user = this.state.currentUser;

    if (!title || !summary || !desc) {
      this.showToast('Please complete all proposal input fields.', 'error');
      return;
    }

    const proposals = this.db.get('proposals');
    const newProposal = {
      id: 'prop-' + Date.now(),
      title,
      category,
      summary,
      description: desc,
      studentRoll: user.rollNo,
      studentName: user.name,
      status: 'Pending',
      submittedAt: new Date(SYSTEM_YEAR, SYSTEM_MONTH, 2).toISOString().split('T')[0]
    };

    proposals.push(newProposal);
    this.db.set('proposals', proposals);

    // Reset inputs
    document.getElementById('prop-title').value = '';
    document.getElementById('prop-summary').value = '';
    document.getElementById('prop-desc').value = '';

    // Show dynamic success banner
    const banner = document.getElementById('proposal-success-box');
    banner.style.display = 'block';
    setTimeout(() => banner.style.display = 'none', 5000);

    this.renderStudentProposalsList();
    this.showToast('Event Proposal sent to Academic Coordinator!', 'success');
  }

  // Populate proposal status list for students
  renderStudentProposalsList() {
    const container = document.getElementById('student-proposals-status-list');
    container.innerHTML = '';

    const proposals = this.db.get('proposals');
    const myProposals = proposals.filter(p => p.studentRoll === this.state.currentUser.rollNo);

    if (myProposals.length === 0) {
      container.innerHTML = `<span style="font-size:0.85rem; color:var(--text-dim)">No proposals submitted yet. Write your request above!</span>`;
      return;
    }

    // Sort: Newest first
    myProposals.reverse();

    myProposals.forEach(p => {
      const card = document.createElement('div');
      card.className = 'glass-panel';
      card.style.padding = '1rem';
      
      let statusStyle = 'color: var(--color-warning)';
      if (p.status === 'Approved') statusStyle = 'color: var(--color-success)';
      if (p.status === 'Rejected') statusStyle = 'color: var(--color-danger)';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <h4 style="font-size:0.95rem; font-weight:600;">${p.title}</h4>
          <span style="font-size:0.75rem; font-weight:700; ${statusStyle}">${p.status}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">${p.summary}</p>
        <div style="font-size:0.65rem; color:var(--text-dim); margin-top:0.5rem; display:flex; justify-content:space-between;">
          <span>Category: ${p.category}</span>
          <span>Submitted: ${p.submittedAt}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }


  // 13. COORDINATOR APPROVAL PANEL (STAFF WORKSPACE)
  updateInboxCountBadge() {
    const badge = document.getElementById('inbox-count-badge');
    const proposals = this.db.get('proposals');
    const count = proposals.filter(p => p.status === 'Pending').length;

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  renderCoordinatorInbox() {
    const grid = document.getElementById('coordinator-proposals-grid');
    grid.innerHTML = '';

    const proposals = this.db.get('proposals');
    const pending = proposals.filter(p => p.status === 'Pending');

    this.updateInboxCountBadge();

    if (pending.length === 0) {
      grid.innerHTML = `
        <div class="agenda-empty-state" style="grid-column: 1 / -1; padding: 4rem 0;">
          <i class="fa-solid fa-thumbs-up" style="font-size: 2.5rem; color: var(--color-success); margin-bottom: 1rem; display: block;"></i>
          Inboxes clear! No pending student proposals.
        </div>`;
      return;
    }

    pending.forEach(p => {
      const card = document.createElement('div');
      card.className = 'proposal-card glass-panel glow-purple-hover';
      card.innerHTML = `
        <div>
          <div class="proposal-header">
            <span class="proposal-type-badge">${p.category}</span>
            <span style="font-size: 0.7rem; color: var(--text-dim);">${p.submittedAt}</span>
          </div>
          <h3 style="font-size:1.15rem; margin-bottom: 0.5rem; font-weight:700;">${p.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height:1.5;">${p.description}</p>
          <div class="proposal-student-info">
            <i class="fa-solid fa-user-pen"></i> By student: <strong>${p.studentName}</strong> (${p.studentRoll})
          </div>
        </div>
        <div class="proposal-actions">
          <button class="btn btn-danger btn-sm btn-outline" style="flex:1;" onclick="app.rejectStudentProposal('${p.id}')">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="app.openSchedulingModal('${p.id}')">
            <i class="fa-solid fa-check"></i> Approve & Schedule
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  rejectStudentProposal(id) {
    const proposals = this.db.get('proposals');
    const prop = proposals.find(p => p.id === id);
    prop.status = 'Rejected';
    this.db.set('proposals', proposals);
    this.renderCoordinatorInbox();
    this.showToast('Student proposal has been rejected.', 'info');
  }

  openSchedulingModal(id) {
    const proposals = this.db.get('proposals');
    const prop = proposals.find(p => p.id === id);
    if (!prop) return;

    document.getElementById('scheduling-modal').style.display = 'flex';
    document.getElementById('sched-proposal-id').value = id;
    document.getElementById('sched-event-name').value = prop.title;
    document.getElementById('sched-event-organizer').value = `${prop.studentName} (${prop.studentRoll})`;
    
    // Set default values (e.g. June 10, 2026 @ 10:00 AM)
    document.getElementById('sched-event-date').value = "2026-06-10";
    document.getElementById('sched-event-time').value = "10:00";
    document.getElementById('sched-alert-box').style.display = 'none';
  }

  closeSchedulingModal() {
    document.getElementById('scheduling-modal').style.display = 'none';
  }

  // Finalizes approval, assigns calendar grids and organizer authorization
  confirmApprovalAndScheduling() {
    const propId = document.getElementById('sched-proposal-id').value;
    const date = document.getElementById('sched-event-date').value;
    const time = document.getElementById('sched-event-time').value;
    const alertBox = document.getElementById('sched-alert-box');

    if (!date || !time) {
      alertBox.textContent = 'Please choose both scheduling Date and Time.';
      alertBox.style.display = 'block';
      return;
    }

    const proposals = this.db.get('proposals');
    const prop = proposals.find(p => p.id === propId);

    // 1. Double schedule clash warning
    const events = this.db.get('events');
    const duplicate = events.find(e => e.date === date);

    if (duplicate) {
      alertBox.innerHTML = `⚠️ <strong>Time Clash Alert!</strong> Event "${duplicate.title}" is already scheduled on this day. Please check parameters.`;
      alertBox.style.display = 'block';
      return;
    }

    // 2. Set proposal status as Approved
    prop.status = 'Approved';
    this.db.set('proposals', proposals);

    // 3. Create Event Page & Grant Student Organizer role
    const newEvent = {
      id: 'evt-' + Date.now(),
      title: prop.title,
      category: prop.category,
      summary: prop.summary,
      description: prop.description,
      date: date,
      time: time,
      organizerRoll: prop.studentRoll,
      organizerName: prop.studentName,
      status: 'Upcoming',
      posterPreset: 'tech', // Standard default preset poster
      gFormLink: '',
      ndliLink: '',
      registeredStudents: [],
      photos: [],
      winners: [],
      feedbacks: []
    };

    events.push(newEvent);
    this.db.set('events', events);

    // 4. Create Notice scrolling bulletin (3 days prior announcement)
    const eventDateObj = new Date(date);
    const announceDate = new Date(eventDateObj);
    announceDate.setDate(announceDate.getDate() - 3); // 3 days before
    
    const notices = this.db.get('notices');
    const noticeMsg = `📢 UPCOMING EVENT: "${newEvent.title}" is scheduled on ${date} @ ${time}. Registration form available on event page!`;
    notices.push(noticeMsg);
    this.db.set('notices', notices);

    this.closeSchedulingModal();
    this.renderCoordinatorInbox();
    this.renderNoticesMarquee();
    this.showToast('Event successfully scheduled and assigned to Student!', 'success');
  }


  // 14. SUPER ADMIN ACCESS MANAGEMENT PANEL
  renderSuperAdminPanel() {
    const list = document.getElementById('sa-coordinators-list');
    list.innerHTML = '';

    const coordinators = this.db.get('coordinators');

    coordinators.forEach(c => {
      const tr = document.createElement('tr');
      
      let statusStyle = 'color: var(--color-success)';
      let toggleIcon = '<i class="fa-solid fa-user-slash"></i> Suspend';
      if (c.status !== 'active') {
        statusStyle = 'color: var(--color-danger)';
        toggleIcon = '<i class="fa-solid fa-user-check"></i> Activate';
      }

      tr.innerHTML = `
        <td><strong>${c.username}</strong></td>
        <td style="color:var(--text-dim);">${c.createdAt}</td>
        <td><span style="font-weight:600; ${statusStyle}">${c.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="app.toggleCoordinatorStatus('${c.username}')">
            ${toggleIcon}
          </button>
        </td>
      `;
      list.appendChild(tr);
    });
  }

  createCoordinatorAccount() {
    const user = document.getElementById('sa-coord-user').value.trim();
    const pass = document.getElementById('sa-coord-pass').value;

    if (!user || !pass) {
      this.showToast('Please enter both Coordinator Username and Password.', 'error');
      return;
    }

    const coordinators = this.db.get('coordinators');
    const exists = coordinators.some(c => c.username === user);

    if (exists) {
      this.showToast('Coordinator username already exists.', 'error');
      return;
    }

    const newCoord = {
      username: user,
      password: pass,
      status: 'active',
      role: 'Academic Coordinator',
      createdAt: new Date(SYSTEM_YEAR, SYSTEM_MONTH, 2).toISOString().split('T')[0]
    };

    coordinators.push(newCoord);
    this.db.set('coordinators', coordinators);

    // Reset inputs
    document.getElementById('sa-coord-user').value = '';
    document.getElementById('sa-coord-pass').value = '';

    this.renderSuperAdminPanel();
    this.showToast('New Academic Coordinator account created successfully!', 'success');
  }

  toggleCoordinatorStatus(username) {
    // Cannot suspend primary coordinator for safety in seed testing
    if (username === 'coordinator') {
      this.showToast('Primary coordinator account cannot be modified.', 'error');
      return;
    }

    const coordinators = this.db.get('coordinators');
    const coord = coordinators.find(c => c.username === username);
    
    coord.status = coord.status === 'active' ? 'suspended' : 'active';
    
    this.db.set('coordinators', coordinators);
    this.renderSuperAdminPanel();
    this.showToast(`Coordinator "${username}" status toggled.`, 'info');
  }


  // 15. BULLETIN NOTICE TICKER MARQUEE
  renderNoticesMarquee() {
    const marquee = document.getElementById('bulletins-marquee-content');
    marquee.innerHTML = '';

    const notices = this.db.get('notices');
    
    if (notices.length === 0) {
      marquee.innerHTML = '<span>No bulletins posted this week.</span>';
      return;
    }

    notices.forEach(n => {
      const span = document.createElement('span');
      span.textContent = n;
      marquee.appendChild(span);
    });
  }


  // 16. TOAST MESSAGE TOASTER SYSTEM
  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const card = document.createElement('div');
    card.className = `toast-card ${type}`;

    let icon = '<i class="fa-solid fa-circle-info"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';

    card.innerHTML = `
      ${icon}
      <div class="toast-message">${msg}</div>
    `;

    container.appendChild(card);

    // Trigger auto slide out
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(50px)';
      setTimeout(() => card.remove(), 300);
    }, 4000);
  }
}

// 17. BOOTSTRAP INITIALIZATION ON PAGE LOAD
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new ApplicationController();
  
  // Expose to window object for inline HTML onclick binders
  window.app = app;
});
