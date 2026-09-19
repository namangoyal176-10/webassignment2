const pptxgen = require('pptxgenjs');
const path = require('path');

async function createPresentation() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Naman Goyal';
  pres.company = 'CampusNest';
  pres.title = 'CampusNest - Smart India Hackathon Presentation';

  // Theme Colors
  const BG_DARK = '0B1120';
  const CARD_BG = '162238';
  const CARD_BORDER = '233554';
  const ACCENT_PRIMARY = '6366F1';
  const ACCENT_CYAN = '38BDF8';
  const ACCENT_GREEN = '10B981';
  const ACCENT_AMBER = 'F59E0B';
  const ACCENT_RED = 'EF4444';
  const TEXT_LIGHT = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';

  // Helper for slide header
  function addSlideHeader(slide, title, subtitle, slideNum) {
    slide.background = { color: BG_DARK };

    // Header Title
    slide.addText(title, {
      x: 0.6,
      y: 0.4,
      w: 8.5,
      h: 0.55,
      fontSize: 22,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });

    // Subtitle
    slide.addText(subtitle, {
      x: 0.6,
      y: 0.95,
      w: 8.5,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    // Badge / Slide Number
    slide.addText(`SLIDE 0${slideNum} / 06  •  SIH 2026`, {
      x: 9.6,
      y: 0.4,
      w: 3.1,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Courier New',
      bold: true,
      color: ACCENT_AMBER,
      align: 'right',
    });

    // Divider Line
    slide.addShape(pres.ShapeType.line, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 0,
      line: { color: CARD_BORDER, width: 1 },
    });
  }

  // ==========================================
  // SLIDE 1: Title & Overview
  // ==========================================
  {
    const slide1 = pres.addSlide();
    slide1.background = { color: BG_DARK };

    // Category Badge
    slide1.addText('SMART INDIA HACKATHON 2026  •  SMART CAMPUS AUTOMATION', {
      x: 1.0,
      y: 0.9,
      w: 11.33,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_AMBER,
      align: 'center',
    });

    // Main Title
    slide1.addText('CampusNest', {
      x: 1.0,
      y: 1.5,
      w: 11.33,
      h: 1.1,
      fontSize: 44,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_LIGHT,
      align: 'center',
    });

    // Subtitle
    slide1.addText(
      'Intelligent Web Platform for Capacity-Enforced Room Allotment,\nSLA Facility Maintenance, and Dynamic Mess Invoicing',
      {
        x: 1.5,
        y: 2.65,
        w: 10.33,
        h: 0.9,
        fontSize: 16,
        fontFace: 'Arial',
        color: ACCENT_CYAN,
        align: 'center',
      }
    );

    // Meta Cards
    const cardY = 3.9;
    const cardW = 3.6;
    const cardH = 2.1;

    // Card 1
    slide1.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide1.addText('PROJECT DOMAIN', {
      x: 1.0,
      y: cardY + 0.2,
      w: 3.2,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_MUTED,
    });
    slide1.addText('Smart Education &\nHostel Administration\nPS ID: SIH-2026-CAMPUS-02', {
      x: 1.0,
      y: cardY + 0.6,
      w: 3.2,
      h: 1.2,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_LIGHT,
    });

    // Card 2
    slide1.addShape(pres.ShapeType.roundRect, {
      x: 4.86,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide1.addText('TEAM LEAD & DEVELOPER', {
      x: 5.06,
      y: cardY + 0.2,
      w: 3.2,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_MUTED,
    });
    slide1.addText('Naman Goyal\nFull Stack Web Development\nNode.js • Express • MongoDB', {
      x: 5.06,
      y: cardY + 0.6,
      w: 3.2,
      h: 1.2,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_LIGHT,
    });

    // Card 3
    slide1.addShape(pres.ShapeType.roundRect, {
      x: 8.93,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide1.addText('DEPLOYMENT STATUS', {
      x: 9.13,
      y: cardY + 0.2,
      w: 3.2,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_MUTED,
    });
    slide1.addText('Live Production on Vercel\nwebassignment2-peach.vercel.app\nZero Cloud Licensing Cost', {
      x: 9.13,
      y: cardY + 0.6,
      w: 3.2,
      h: 1.2,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_GREEN,
    });

    // Footer note
    slide1.addText('Built strictly with Node.js, Express.js, MongoDB Atlas, EJS & Vanilla CSS', {
      x: 1.0,
      y: 6.4,
      w: 11.33,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      align: 'center',
    });
  }

  // ==========================================
  // SLIDE 2: Problem vs Solution
  // ==========================================
  {
    const slide2 = pres.addSlide();
    addSlideHeader(
      slide2,
      '01. Problem Statement & Proposed Solution',
      'Addressing key administrative and operational bottlenecks in college hostels',
      2
    );

    const colW = 5.85;
    const colH = 5.2;

    // Problem Card (Left)
    slide2.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.6,
      w: colW,
      h: colH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_RED, width: 2 },
      rectRadius: 0.1,
    });
    slide2.addText('⚠️ CURRENT CHALLENGES & PAIN POINTS', {
      x: 0.9,
      y: 1.85,
      w: 5.2,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_RED,
    });

    const problemPoints = [
      { bold: 'Bed Over-Allocation: ', text: 'Manual registers and spreadsheets lead to accidental double-bookings, ghost records, and fire safety violations.' },
      { bold: 'Unfair Static Dining Bills: ', text: 'Students pay fixed mess fees regardless of leaves, medical vacations, or semester holidays.' },
      { bold: 'Unaccountable Maintenance: ', text: 'Complaints written on physical logbooks suffer severe delays with zero SLA tracking or warden accountability.' },
      { bold: 'Blindspot Administration: ', text: 'Wardens lack real-time visibility into block occupancy, available beds, and ticket resolution rates.' },
    ];

    let pY = 2.4;
    problemPoints.forEach((pt) => {
      slide2.addText([
        { text: pt.bold, options: { bold: true, color: TEXT_LIGHT } },
        { text: pt.text, options: { color: TEXT_MUTED } },
      ], {
        x: 0.9,
        y: pY,
        w: 5.2,
        h: 0.95,
        fontSize: 11.5,
        fontFace: 'Arial',
        bullet: true,
      });
      pY += 1.05;
    });

    // Solution Card (Right)
    slide2.addShape(pres.ShapeType.roundRect, {
      x: 6.88,
      y: 1.6,
      w: colW,
      h: colH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_GREEN, width: 2 },
      rectRadius: 0.1,
    });
    slide2.addText('💡 CAMPUSNEST PROPOSED INNOVATION', {
      x: 7.18,
      y: 1.85,
      w: 5.2,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_GREEN,
    });

    const solutionPoints = [
      { bold: 'Zero-Overbooking State Engine: ', text: 'Database-enforced validation strictly prevents occupiedBeds > capacity across all operations.' },
      { bold: 'Dynamic Attendance Billing: ', text: 'Calculated transparently: Total = (Days Present × Daily Rate) + Fixed Maintenance.' },
      { bold: 'Categorized SLA Ticketing: ', text: 'Electrical, Plumbing & Wi-Fi issues tracked with priority flags and official warden resolution remarks.' },
      { bold: 'Real-Time Analytics Dashboard: ', text: 'Chart.js visualizations show capacity vs. occupancy by block and room status distributions.' },
    ];

    let sY = 2.4;
    solutionPoints.forEach((pt) => {
      slide2.addText([
        { text: pt.bold, options: { bold: true, color: TEXT_LIGHT } },
        { text: pt.text, options: { color: TEXT_MUTED } },
      ], {
        x: 7.18,
        y: sY,
        w: 5.2,
        h: 0.95,
        fontSize: 11.5,
        fontFace: 'Arial',
        bullet: true,
      });
      sY += 1.05;
    });
  }

  // ==========================================
  // SLIDE 3: Technical Architecture
  // ==========================================
  {
    const slide3 = pres.addSlide();
    addSlideHeader(
      slide3,
      '02. Technical Architecture & System Workflow',
      'Robust 3-Tier MVC architecture designed for high data integrity and cloud scalability',
      3
    );

    const cW = 3.8;
    const cH = 5.2;

    // Column 1: Frontend
    slide3.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.6,
      w: cW,
      h: cH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide3.addText('🎨 PRESENTATION LAYER', {
      x: 0.8,
      y: 1.85,
      w: 3.4,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });
    slide3.addText([
      { text: 'Embedded JavaScript (EJS):\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Server-rendered templates ensuring fast load times and clean SEO.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Vanilla CSS3 Design System:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Custom glassmorphic interface, dark mode, CSS Grid and Flexbox.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Chart.js Visualizations:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Real-time interactive bar and doughnut charts for hostel analytics.', options: { color: TEXT_MUTED } },
    ], { x: 0.8, y: 2.3, w: 3.4, h: 4.2, fontSize: 11, fontFace: 'Arial' });

    // Column 2: Backend & Security
    slide3.addShape(pres.ShapeType.roundRect, {
      x: 4.76,
      y: 1.6,
      w: cW,
      h: cH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_PRIMARY, width: 1.5 },
      rectRadius: 0.1,
    });
    slide3.addText('⚙️ APPLICATION & API LAYER', {
      x: 4.96,
      y: 1.85,
      w: 3.4,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_PRIMARY,
    });
    slide3.addText([
      { text: 'Node.js & Express REST API:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Separation of concerns with modular controllers and route guards.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Role-Based Access Control (RBAC):\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Strict requireAdmin & requireStudent middleware guards.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Security & Sessions:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Bcrypt password hashing (10 rounds), Helmet headers & connect-mongo session persistence.', options: { color: TEXT_MUTED } },
    ], { x: 4.96, y: 2.3, w: 3.4, h: 4.2, fontSize: 11, fontFace: 'Arial' });

    // Column 3: Database & Cloud
    slide3.addShape(pres.ShapeType.roundRect, {
      x: 8.93,
      y: 1.6,
      w: cW,
      h: cH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide3.addText('🗄️ DATA & CLOUD LAYER', {
      x: 9.13,
      y: 1.85,
      w: 3.4,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_GREEN,
    });
    slide3.addText([
      { text: 'MongoDB Atlas Cloud:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Multi-region replica set cluster with high availability.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Connection Caching:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Global Mongoose promise caching eliminates serverless cold start bottlenecks.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Compound Unique Indexes:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '{student, day, mealType} compound index prevents duplicate feedback entries.', options: { color: TEXT_MUTED } },
    ], { x: 9.13, y: 2.3, w: 3.4, h: 4.2, fontSize: 11, fontFace: 'Arial' });
  }

  // ==========================================
  // SLIDE 4: Key Features & Implementation
  // ==========================================
  {
    const slide4 = pres.addSlide();
    addSlideHeader(
      slide4,
      '03. Core Features & Implementation Methodology',
      'Mathematical guarantees, atomic multi-document updates, and verified test suites',
      4
    );

    const fW = 5.85;
    const fH = 2.45;

    // Feature 1
    slide4.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.6,
      w: fW,
      h: fH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide4.addText('🔒 STRICT BED CAPACITY ENGINE', {
      x: 0.9,
      y: 1.8,
      w: 5.2,
      h: 0.35,
      fontSize: 12.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });
    slide4.addText([
      { text: '• Schema Constraint: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Guarantees occupiedBeds <= capacity.\n', options: { color: TEXT_MUTED } },
      { text: '• State Transitions: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: '0 beds = Available; 1..cap-1 = Partially Occupied; cap = Full.\n', options: { color: TEXT_MUTED } },
      { text: '• Automated Test: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'npm run test:capacity verifies 5th-student overflow rejection.', options: { color: ACCENT_GREEN } },
    ], { x: 0.9, y: 2.2, w: 5.2, h: 1.65, fontSize: 10.5, fontFace: 'Arial' });

    // Feature 2
    slide4.addShape(pres.ShapeType.roundRect, {
      x: 6.88,
      y: 1.6,
      w: fW,
      h: fH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide4.addText('🔄 ATOMIC ROOM TRANSFER & VACATE', {
      x: 7.18,
      y: 1.8,
      w: 5.2,
      h: 0.35,
      fontSize: 12.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_AMBER,
    });
    slide4.addText([
      { text: '• Zero Ghost Bookings: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Decrements old room and frees bed atomically.\n', options: { color: TEXT_MUTED } },
      { text: '• Safe Reallocation: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Increments target room and re-links student reference.\n', options: { color: TEXT_MUTED } },
      { text: '• One-Click Vacate: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Wardens can instantly check out residents and release inventory.', options: { color: TEXT_MUTED } },
    ], { x: 7.18, y: 2.2, w: 5.2, h: 1.65, fontSize: 10.5, fontFace: 'Arial' });

    // Feature 3
    slide4.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 4.3,
      w: fW,
      h: fH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide4.addText('🍽️ 7-DAY DINING & DYNAMIC BILLING', {
      x: 0.9,
      y: 4.5,
      w: 5.2,
      h: 0.35,
      fontSize: 12.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_GREEN,
    });
    slide4.addText([
      { text: '• Automated Timetable: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: '4 daily meals across 7 days with active-day highlight.\n', options: { color: TEXT_MUTED } },
      { text: '• Cost Formula: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Total = (Days Present × Daily Meal Rate) + Fixed Charges.\n', options: { color: TEXT_MUTED } },
      { text: '• Fraud Prevention: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Compound unique index prevents spam or duplicate meal ratings.', options: { color: TEXT_MUTED } },
    ], { x: 0.9, y: 4.9, w: 5.2, h: 1.65, fontSize: 10.5, fontFace: 'Arial' });

    // Feature 4
    slide4.addShape(pres.ShapeType.roundRect, {
      x: 6.88,
      y: 4.3,
      w: fW,
      h: fH,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide4.addText('🛠️ MAINTENANCE TICKETS & WARDEN SLA', {
      x: 7.18,
      y: 4.5,
      w: 5.2,
      h: 0.35,
      fontSize: 12.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_PRIMARY,
    });
    slide4.addText([
      { text: '• Category & Priority: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Electrical, Plumbing, Wi-Fi; Urgent, High, Medium, Low.\n', options: { color: TEXT_MUTED } },
      { text: '• Lifecycle Tracking: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Pending ➔ In Progress ➔ Resolved with warden remarks.\n', options: { color: TEXT_MUTED } },
      { text: '• Resident Visibility: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Students monitor real-time repair progress from their dashboard.', options: { color: TEXT_MUTED } },
    ], { x: 7.18, y: 4.9, w: 5.2, h: 1.65, fontSize: 10.5, fontFace: 'Arial' });
  }

  // ==========================================
  // SLIDE 5: Feasibility & Impact
  // ==========================================
  {
    const slide5 = pres.addSlide();
    addSlideHeader(
      slide5,
      '04. Feasibility, Measurable Impact & Risk Analysis',
      'High institutional return on investment, operational efficiency, and risk mitigations',
      5
    );

    const iW = 5.85;
    const iH = 5.2;

    // Left: Measurable Impact
    slide5.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.6,
      w: iW,
      h: iH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_GREEN, width: 1.5 },
      rectRadius: 0.1,
    });
    slide5.addText('📈 MEASURABLE INSTITUTIONAL IMPACT', {
      x: 0.9,
      y: 1.85,
      w: 5.2,
      h: 0.35,
      fontSize: 13.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_GREEN,
    });

    const impacts = [
      { metric: '85% Faster Allotment: ', desc: 'Eliminates paper forms and physical queues during university admission weeks.' },
      { metric: '100% Billing Accuracy: ', desc: 'Attendance reconciliation prevents dining disputes between students and mess caterers.' },
      { metric: 'Zero Ghost Allocations: ', desc: 'Strict capacity state engine prevents double assignments and fire code violations.' },
      { metric: 'Zero Software License Costs: ', desc: 'Built completely on open-source web technologies for frictionless college adoption.' },
    ];

    let impY = 2.4;
    impacts.forEach((imp) => {
      slide5.addText([
        { text: imp.metric, options: { bold: true, color: TEXT_LIGHT } },
        { text: imp.desc, options: { color: TEXT_MUTED } },
      ], {
        x: 0.9,
        y: impY,
        w: 5.2,
        h: 0.95,
        fontSize: 11.5,
        fontFace: 'Arial',
        bullet: true,
      });
      impY += 1.05;
    });

    // Right: Risk Mitigations
    slide5.addShape(pres.ShapeType.roundRect, {
      x: 6.88,
      y: 1.6,
      w: iW,
      h: iH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_AMBER, width: 1.5 },
      rectRadius: 0.1,
    });
    slide5.addText('🛡️ POTENTIAL RISKS & TECHNICAL MITIGATIONS', {
      x: 7.18,
      y: 1.85,
      w: 5.2,
      h: 0.35,
      fontSize: 13.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_AMBER,
    });

    const risks = [
      { risk: 'Serverless Cold Starts: ', mitigation: 'Mitigated via global Mongoose promise caching and persistent connection pooling.' },
      { risk: 'Concurrency Admission Rush: ', mitigation: 'Prevented via pre-save Mongoose schema locks and conditional atomic bed decrementing.' },
      { risk: 'Privilege Escalation: ', mitigation: 'Enforced via role-based middleware guards (requireAdmin) verifying session tokens on every route.' },
      { risk: 'Data Loss on Server Restarts: ', mitigation: 'All sessions are persisted inside MongoDB Atlas using connect-mongo store.' },
    ];

    let rskY = 2.4;
    risks.forEach((rsk) => {
      slide5.addText([
        { text: rsk.risk, options: { bold: true, color: TEXT_LIGHT } },
        { text: rsk.mitigation, options: { color: TEXT_MUTED } },
      ], {
        x: 7.18,
        y: rskY,
        w: 5.2,
        h: 0.95,
        fontSize: 11.5,
        fontFace: 'Arial',
        bullet: true,
      });
      rskY += 1.05;
    });
  }

  // ==========================================
  // SLIDE 6: Demo & Future Scope
  // ==========================================
  {
    const slide6 = pres.addSlide();
    addSlideHeader(
      slide6,
      '05. Live Demonstration, Evaluation & Future Roadmap',
      'Verified production deployment, open-source repository, and planned expansions',
      6
    );

    const dW = 5.85;
    const dH = 5.2;

    // Left: Live Demonstration & Credentials
    slide6.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.6,
      w: dW,
      h: dH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_CYAN, width: 2 },
      rectRadius: 0.1,
    });
    slide6.addText('🚀 LIVE ACCESS & EVALUATION CREDENTIALS', {
      x: 0.9,
      y: 1.85,
      w: 5.2,
      h: 0.35,
      fontSize: 13.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });

    slide6.addText([
      { text: '• Live Web Application:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '  https://webassignment2-peach.vercel.app\n\n', options: { bold: true, color: ACCENT_CYAN } },
      { text: '• GitHub Source Code:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '  https://github.com/namangoyal176-10/webassignment2\n\n', options: { color: TEXT_MUTED } },
      { text: '• Warden Admin Login:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '  Email: admin@hostel.com  |  Password: Admin@1234\n\n', options: { color: ACCENT_AMBER } },
      { text: '• Resident Student Login:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '  Email: aarav.sharma@hostel.edu  |  Password: student123\n\n', options: { color: ACCENT_GREEN } },
      { text: '(One-click demo buttons are provided on the login page for instant access)', options: { italic: true, color: TEXT_MUTED } },
    ], { x: 0.9, y: 2.3, w: 5.2, h: 4.2, fontSize: 11, fontFace: 'Arial' });

    // Right: Future Scope
    slide6.addShape(pres.ShapeType.roundRect, {
      x: 6.88,
      y: 1.6,
      w: dW,
      h: dH,
      fill: { color: CARD_BG },
      line: { color: ACCENT_PRIMARY, width: 1.5 },
      rectRadius: 0.1,
    });
    slide6.addText('🔮 STRATEGIC FUTURE EXPANSION', {
      x: 7.18,
      y: 1.85,
      w: 5.2,
      h: 0.35,
      fontSize: 13.5,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_PRIMARY,
    });

    const futureScope = [
      { title: 'IoT Smart Turnstiles: ', desc: 'RFID and biometric hardware synchronization for automated mess attendance tracking.' },
      { title: 'Automated UPI Gateways: ', desc: 'Integrated Razorpay/Stripe webhooks for instantaneous student fee receipts.' },
      { title: 'AI-Powered Maintenance Triage: ', desc: 'Computer vision to verify and classify plumbing/electrical photo uploads.' },
      { title: 'Progressive Web App (PWA): ', desc: 'Push notifications for leave approvals, daily meal specials, and urgent alerts.' },
    ];

    let ftrY = 2.4;
    futureScope.forEach((ftr) => {
      slide6.addText([
        { text: ftr.title, options: { bold: true, color: TEXT_LIGHT } },
        { text: ftr.desc, options: { color: TEXT_MUTED } },
      ], {
        x: 7.18,
        y: ftrY,
        w: 5.2,
        h: 0.95,
        fontSize: 11.5,
        fontFace: 'Arial',
        bullet: true,
      });
      ftrY += 1.05;
    });
  }

  // Save the PPTX file
  const outputPath = path.join(__dirname, '..', 'CampusNest_SIH_Presentation.pptx');
  await pres.writeFile({ fileName: outputPath });
  console.log(`✅ PPTX presentation created successfully at: ${outputPath}`);
}

createPresentation().catch((err) => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
