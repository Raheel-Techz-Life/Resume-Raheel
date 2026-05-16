export default function Home() {
  return (
    <main>

{/*  Custom Cursor  */}



{/*  NAV  */}


{/*  HERO  */}
<section id="hero">
  <div className="scanline"></div>
  <div className="hero-main">
    <div className="hero-content">
      <p className="hero-eyebrow">
        <span>CS @ KLE Institute of Technology</span>
      </p>

      <h1 className="hero-name">
        <span className="first">RAHEEL</span>
        <span className="last glitch" data-text="HOSMANI">HOSMANI</span>
      </h1>

      <p className="hero-tagline">
        Building systems that matter — from 
        <span className="highlight">1.4B-scale identity intelligence</span> 
        to offline healthcare for rural India. AI/ML engineer, IEEE Computer Society Secretary, and a builder obsessed with national-scale impact.<span className="blink">_</span>
      </p>

      <div className="hero-actions">
        <a href="/projects" className="btn-primary">Open Project Dossier</a>
        <a href="/contact" className="btn-secondary">Open Contact Channel</a>
      </div>
    </div>
    <div className="hero-photo">
      <img src="/raheelxyz.jpeg" alt="Raheel Hosmani" />
    </div>
  </div>
  <div className="hero-stats">
    <div className="stat-item">
      <div className="stat-num">1.4B+</div>
      <div className="stat-label">Records Processed</div>
    </div>
    <div className="stat-item">
      <div className="stat-num">3×</div>
      <div className="stat-label">Hackathon Finalist</div>
    </div>
    <div className="stat-item">
      <div className="stat-num">6</div>
      <div className="stat-label">AI Frameworks Built</div>
    </div>
  </div>
</section>

<div className="divider"></div>

{/*  PROJECTS  */}
<section id="projects">
  <div className="section-header">
    <div className="section-tag">Selected Work</div>
    <h2 className="section-title">Projects that <em>scale</em></h2>
  </div>

  <div className="projects-grid">

    {/*  SAMVIDHAN — Featured  */}
    <div className="project-card featured">
      <div className="featured-content">
        <div>
          <div className="project-number">01 — FLAGSHIP</div>
          <h3 className="project-name">SAMVIDHAN</h3>
          <p className="project-desc">
            Enterprise-grade Aadhaar intelligence platform serving 1.4B+ citizens. 
            Six specialized AI frameworks for fraud detection, identity resolution, 
            and privacy-preserving governance analytics — all under 500ms response targets.
          </p>
          <div className="project-tags">
            <span className="tag accent">Next.js 16</span>
            <span className="tag accent">FastAPI</span>
            <span className="tag accent">Python 3.11</span>
            <span className="tag">40+ REST APIs</span>
            <span className="tag">Differential Privacy</span>
            <span className="tag">RBAC</span>
          </div>
          <div className="project-award">★ &nbsp;UIDAI Data Hackathon 2026 — UIDAI × NIC × MeitY</div>
          <div className="project-corner">01</div>
        </div>
        <div className="project-frameworks">
          <div className="framework-item"><span className="fw-id">ADIF</span> Data Integrity Framework</div>
          <div className="framework-item"><span className="fw-id">IRF</span> Identity Resolution Framework</div>
          <div className="framework-item"><span className="fw-id">AFIF</span> Fraud Intelligence Framework</div>
          <div className="framework-item"><span className="fw-id">PROF</span> Privacy Risk Optimization</div>
          <div className="framework-item"><span className="fw-id">AMF</span> Analytics & Monitoring</div>
          <div className="framework-item"><span className="fw-id">PPAF</span> Policy & Prediction Analysis</div>
        </div>
      </div>
      <div className="project-detail">
        {/*  Detailed content goes here  */}
        <h2>SAMVIDHAN — Aadhaar Intelligence Platform</h2>
        <p><strong>Team:</strong> 4 members | "Enterprise-grade analytics and fraud detection for India's Aadhaar identity system"</p>
        <p><strong>Event:</strong> UIDAI Data Hackathon 2026 | <a href="#" className="project-link">View Source Code</a></p>
        
        <h3>Overview</h3>
        <p>Powered by 6 AI frameworks for governance intelligence, citizen privacy, and policy optimization. Serves 1.4 billion+ citizens with fraud detection, data integrity verification, and privacy-preserving analytics. Features differential privacy, federated analytics, and real-time anomaly detection with 40+ API endpoints.</p>

        <h3>Impact</h3>
        <p>Securing identity, empowering governance, protecting citizens at scale</p>

        <h3>Role</h3>
        <p>Lead Developer (Team Vidyut)</p>

        <h3>Status</h3>
        <p>Ongoing Development</p>

        <h3>Key Features</h3>
        <ol>
            <li>6 Intelligence Frameworks (ADIF, IRF, AFIF, PROF, AMF, PPAF)</li>
            <li>40+ FastAPI endpoints with complete API documentation</li>
            <li>Fraud detection & anomaly analysis with geospatial tracking</li>
            <li>Differential privacy & federated analytics</li>
            <li>Real-time national dashboard with state-wise analytics</li>
            <li>Multi-factor verification & biometric aging assessment</li>
        </ol>

        <h3>Technology Stack</h3>
        <div className="project-tags">
            <span className="tag">Next.js 16</span>
            <span className="tag">React 19</span>
            <span className="tag">FastAPI</span>
            <span className="tag">Python</span>
            <span className="tag">TypeScript</span>
            <span className="tag">AI/ML</span>
            <span className="tag">Privacy Tech</span>
            <span className="tag">Government Tech</span>
        </div>

        <h3>Detailed Overview</h3>
        <h4>Overview</h4>
        <p>SAMVIDHAN is an enterprise-grade government analytics platform built for national-scale identity intelligence. It processes 1.4B+ Aadhaar records while preserving privacy, detecting fraud, and enabling policy optimization through 6 specialized AI frameworks.</p>

        <h4>The Problem</h4>
        <p>At Aadhaar scale, fraud detection, data integrity, and privacy must be solved together. Traditional analytics pipelines either do not scale or expose sensitive data. SAMVIDHAN bridges that gap with privacy-first intelligence and real-time monitoring.</p>

        <h4>The 6 Intelligence Frameworks</h4>
        <ol>
            <li>ADIF (Aadhaar Data Integrity Framework) - Validates data consistency and detects anomalies</li>
            <li>IRF (Identity Resolution Framework) - Resolves duplicates and biometric conflicts</li>
            <li>AFIF (Aadhaar Fraud Intelligence Framework) - Flags fraudulent enrollment patterns</li>
            <li>PROF (Privacy Risk Optimization Framework) - Enforces differential privacy</li>
            <li>AMF (Analytics & Monitoring Framework) - State and national analytics dashboards</li>
            <li>PPAF (Policy & Prediction Analysis Framework) - Predictive insights for policy teams</li>
        </ol>

        <h4>Technical Architecture</h4>
        <ul>
            <li><strong>Frontend:</strong> Next.js 16, React 19, TypeScript, Tailwind CSS</li>
            <li><strong>Backend:</strong> FastAPI, Python 3.11+, Pydantic</li>
            <li><strong>Scale:</strong> 40+ REST APIs, 6 dashboards, sub-500ms response targets</li>
            <li><strong>Privacy:</strong> Differential privacy, federated analytics, RBAC, audit logging</li>
        </ul>

        <h4>Quantified Impact</h4>
        <ul>
            <li>1.4B+ records at national scale</li>
            <li>40+ APIs and 6 role-based dashboards</li>
            <li>&lt;500ms response targets for high-throughput queries</li>
            <li>Real-time fraud detection and anomaly alerts</li>
        </ul>

        <h4>Team Vidyut</h4>
        <ul>
            <li><strong>Vishwanath Koliwad</strong> - Lead Developer</li>
            <li>Raheel Hosmani</li>
            <li>Bhumika Dalabhanjan</li>
            <li>Disha Raikar</li>
        </ul>

        <h4>Recognition</h4>
        <p>Built for the UIDAI Data Hackathon 2026 organized by the Unique Identification Authority of India (UIDAI) in association with National Informatics Centre (NIC) and Ministry of Electronics and Information Technology (MeitY).</p>
        <p>This hackathon focuses on data-driven innovation for Aadhaar, utilizing anonymised datasets of Aadhaar enrolment and updates to identify meaningful patterns, trends, anomalies, and predictive indicators that support informed decision-making and system improvements at national scale.</p>
      </div>
    </div>

    {/*  AQI  */}
    <div className="project-card">
      <div className="project-number">02 — SIH 2025</div>
      <h3 className="project-name">Delhi AQI Monitor</h3>
      <p className="project-desc">
        Real-time air quality dashboard for Delhi-NCR with 10 monitoring stations, 
        24-hour ML-powered forecasting, and source-level pollution attribution.
      </p>
      <div className="project-tags">
        <span className="tag">Next.js 14</span>
        <span className="tag">TypeScript</span>
        <span className="tag">Mapbox</span>
        <span className="tag">Recharts</span>
      </div>
      <a href="https://github.com/Raheel-Techz-Life" target="_blank" className="project-link">View on GitHub</a>
      <div className="project-corner">02</div>
    </div>

    {/*  ASHA Sync  */}
    <div className="project-card">
      <div className="project-number">03 — SIH 2025</div>
      <h3 className="project-name">ASHA Sync Pro</h3>
      <p className="project-desc">
        Offline-first PWA for rural healthcare workers. Full functionality 
        without internet, Hindi voice input, and background sync — built 
        for ASHA workers across India.
      </p>
      <div className="project-tags">
        <span className="tag">Next.js 14</span>
        <span className="tag">IndexedDB</span>
        <span className="tag">Service Workers</span>
        <span className="tag">Web Speech API</span>
      </div>
      <a href="https://github.com/Raheel-Techz-Life" target="_blank" className="project-link">View on GitHub</a>
      <div className="project-corner">03</div>
    </div>

    {/*  Zero Barrier Jobs  */}
    <div className="project-card">
      <div className="project-number">04 — ONEST 2025</div>
      <h3 className="project-name">Zero-Barrier Jobs</h3>
      <p className="project-desc">
        Voice-first job application platform on India's ONEST framework. 
        Apply in any of 22+ Indian languages, zero literacy required — 
        using only a missed call and IVR.
      </p>
      <div className="project-tags">
        <span className="tag">ONEST Framework</span>
        <span className="tag">BHASHINI</span>
        <span className="tag">IVR</span>
        <span className="tag">WhatsApp API</span>
      </div>
      <div className="project-award" style={{"marginTop":"16px", "fontSize":"10px"}}>🥉 3rd Place — ONEST Hackathon 2025</div>
      <div className="project-corner">04</div>
    </div>

  </div>
</section>

<div className="divider"></div>

{/*  EXPERIENCE  */}
<section id="experience">
  <div className="section-header">
    <div className="section-tag">Experience</div>
    <h2 className="section-title">Where I've <em>operated</em></h2>
    <a href="/experience" className="project-link" style={{"marginTop":"16px"}}>Open detailed experience page</a>
  </div>

  <div className="timeline">
    <div className="timeline-item">
      <div className="timeline-date">2026 — PRESENT</div>
      <div className="timeline-role">Secretary, IEEE Computer Society</div>
      <div className="timeline-org">IEEE CS Bangalore Chapter — KLE Institute of Technology</div>
      <div className="timeline-desc">
        Serving as technical lead for the Student Internship & Mentorship Program 2026 
        (April–September). Managing a team of four, leading architecture decisions, 
        GitHub reviews, mentor interactions, and program deliverables.
      </div>
    </div>

    <div className="timeline-item">
      <div className="timeline-date">2024 — 2025</div>
      <div className="timeline-role">Webmaster, IEEE Computer Society</div>
      <div className="timeline-org">IEEE CS Bangalore Chapter — KLE Institute of Technology</div>
      <div className="timeline-desc">
        Managed chapter's web presence and digital infrastructure. 
        Coordinated technical initiatives and web-related chapter activities.
      </div>
    </div>

    <div className="timeline-item">
      <div className="timeline-date">2024</div>
      <div className="timeline-role">Intern</div>
      <div className="timeline-org">Scaler School of Technology</div>
      <div className="timeline-desc">
        Gained structured exposure to industry-level software engineering 
        practices, CS fundamentals, and professional development 
        within Scaler's intensive tech-focused environment.
      </div>
    </div>

    <div className="timeline-item">
      <div className="timeline-date">ONGOING</div>
      <div className="timeline-role">CS Student — AI/ML Focus</div>
      <div className="timeline-org">KLE Institute of Technology, Hubli, Karnataka</div>
      <div className="timeline-desc">
        Computer Science engineering with specialization in AI/ML. 
        Active participant in national-level hackathons, IEEE chapter leadership, 
        and building production-grade AI systems.
      </div>
    </div>
  </div>
</section>

<div className="divider"></div>

{/*  ACHIEVEMENTS  */}
<section id="achievements">
  <div className="section-header">
    <div className="section-tag">Recognition</div>
    <h2 className="section-title">Built, competed, <em>delivered</em></h2>
    <a href="/achievements" className="project-link" style={{"marginTop":"16px"}}>Open detailed awards page</a>
  </div>

  <div className="achievements-grid">
    <div className="achievement-card">
      <div className="achievement-badge gold">3rd Place</div>
      <div className="achievement-title">ONEST Hackathon 2025</div>
      <div className="achievement-desc">
        Won 3rd place for Zero-Barrier Jobs — a voice-first platform for low-tech workers built on ONEST framework. Organized by Deshpande Startups, EkStep Foundation & Headstart Network.
      </div>
      <div className="achievement-year">25</div>
    </div>

    <div className="achievement-card">
      <div className="achievement-badge">National Finalist</div>
      <div className="achievement-title">Smart India Hackathon 2025</div>
      <div className="achievement-desc">
        Competed at national level on two problem statements: real-time AQI monitoring for Delhi-NCR and offline healthcare management PWA for ASHA workers in rural India.
      </div>
      <div className="achievement-year">25</div>
    </div>

    <div className="achievement-card">
      <div className="achievement-badge">Active</div>
      <div className="achievement-title">UIDAI Data Hackathon 2026</div>
      <div className="achievement-desc">
        Building SAMVIDHAN for UIDAI × NIC × MeitY — enterprise-grade Aadhaar intelligence platform with 6 AI frameworks processing identity data at 1.4B+ citizen scale.
      </div>
      <div className="achievement-year">26</div>
    </div>
  </div>
</section>

<div className="divider"></div>

{/*  WORK  */}
<section id="work">
  <div className="section-header">
    <div className="section-tag">Work</div>
    <h2 className="section-title">Things I've <em>shipped</em></h2>
    <a href="/work" className="project-link" style={{"marginTop":"16px"}}>Open detailed work page</a>
  </div>

  <div className="work-grid">
    <div className="work-card">
      <div className="work-type">Web Development</div>
      <div className="work-name">Real Estate Agency Website</div>
      <div className="work-desc">
        Full client website built for a real estate agency — complete with property listings, contact flows, and backend integration. Project was completed; rejected by client on backend grounds.
      </div>
      <span className="work-status status-locked">Unpublished</span>
    </div>

    <div className="work-card">
      <div className="work-type">Hackathon Volunteering</div>
      <div className="work-name">Multiple Hackathons</div>
      <div className="work-desc">
        Volunteered and contributed at several hackathons across the tech and startup ecosystem in Karnataka and beyond — organizing, mentoring, and coordinating.
      </div>
      <span className="work-status status-live">Active</span>
    </div>

    <div className="work-card">
      <div className="work-type">Open Source</div>
      <div className="work-name">GitHub Projects</div>
      <div className="work-desc">
        Collection of projects covering AI/ML experiments, web apps, Arduino/ESP embedded systems, Firebase integrations, and more — built across two years of active development.
      </div>
      <a href="https://github.com/Raheel-Techz-Life" target="_blank" style={{"display":"block","marginTop":"16px"}} className="project-link">github.com/Raheel-Techz-Life</a>
    </div>

    <div className="work-card">
      <div className="work-type">Portfolio Archives</div>
      <div className="work-name">Resume Sites & Design Work</div>
      <div className="work-desc">
        Multiple portfolio and resume pages built from scratch — each one an experiment in design systems, motion, and frontend craft. Unpublished, but they exist.
      </div>
      <span className="work-status status-locked">Unreleased</span>
    </div>
  </div>
</section>

<div className="divider"></div>

{/*  CONTACT  */}
<section id="contact">
  <div className="contact-glow"></div>
  <h2 className="contact-title">Let's build<br /><span>something real</span></h2>
  <a href="/contact" className="project-link" style={{"marginBottom":"24px","display":"inline-flex"}}>Open dedicated contact page</a>
  <p className="contact-subtitle">
    Open to collaborations, internships, research, and conversations worth having. 
    If it matters at scale, I want to hear about it.
  </p>
  <div className="contact-links">
    <a href="mailto:raheelhosmani05@gmail.com" className="contact-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
      raheelhosmani05@gmail.com
    </a>
    <a href="https://www.linkedin.com/in/raheel-hosmani-78ab92315/" target="_blank" className="contact-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2" /></svg>
      LinkedIn
    </a>
    <a href="https://github.com/Raheel-Techz-Life" target="_blank" className="contact-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
      GitHub
    </a>
  </div>
</section>

{/*  FOOTER  */}




    </main>
  );
}
