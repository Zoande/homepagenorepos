window.PROJECTS = [
  {
    id: "zoande-brokersim",
    title: "BrokerSIM",
    owner: "DH4410 & Zoande",
    repoUrl: "https://github.com/Zoande/BrokerSIM",
    liveUrl: "https://broker-sim-beige.vercel.app/",
    localPath: "repos/Zoande__BrokerSIM",
    tech: ["TypeScript", "Vite", "Browser Game"],
    stage: "Playable prototype",
    summary:
      "Hybrid broker roleplay prototype with a 2D deal desk and a 3D warehouse flow for sourcing, negotiating, and dispatch.",
    details: [
      "Daily cycle with supplier offers, customer requests, and deal outcomes.",
      "Warehouse mode with keyboard controls for package handling.",
      "README includes clear next build targets around persistence and negotiation depth."
    ],
    status:
      "Runs as a Vite app. Core loop is present; deeper systems like long-term progression are still in-progress.",
    deliverableSteps: [
      "Lock a stable gameplay loop for one full in-game day.",
      "Persist inventory/cash/reputation to local storage.",
      "Add balancing pass and issue tracking for next milestone."
    ]
  },
  {
    id: "zoande-ahhh",
    title: "Space Strategy Prototype (ahhh)",
    owner: "Zoande",
    repoUrl: "https://github.com/Zoande/ahhh",
    liveUrl: "https://spaceweb3dprototype.vercel.app/",
    localPath: "repos/Zoande__ahhh",
    tech: ["TypeScript", "Vite", "Babylon.js"],
    stage: "Core rendering prototype",
    summary:
      "Phase-1 browser prototype for galaxy-to-system transition with textured star and planets orbiting in system view.",
    details: [
      "Uses SceneManager architecture for scene lifecycle and switching.",
      "Target scope includes smooth zoom transition and clean disposal.",
      "Project todo documents a clear rendering-first roadmap."
    ],
    status:
      "Boot flow and scene setup exist; this is foundational work intended to be expanded into full strategy systems.",
    deliverableSteps: [
      "Validate transition stability under repeated zoom in/out.",
      "Add UI overlay for system metadata and debug stats.",
      "Package a scripted demo path for portfolio presentation."
    ]
  },
  {
    id: "zoande-onlineagent",
    title: "onlineagent",
    owner: "Zoande",
    repoUrl: "https://github.com/Zoande/onlineagent",
    liveUrl: "https://onlineagent-five.vercel.app/",
    localPath: "repos/Zoande__onlineagent",
    tech: ["Node.js", "Express", "WebSocket", "Dashboard UI"],
    stage: "Prototype service",
    summary:
      "Autonomous online agent prototype with Q-learning, persistent memory, and a real-time dashboard for observability.",
    details: [
      "Express server exposes task, planner, reward, and memory endpoints.",
      "WebSocket stream broadcasts internal events for monitoring.",
      "Auto-training loop cycles through key searches for iterative learning."
    ],
    status:
      "Runnable as a Node service plus dashboard. Better treated as a backend/tooling project than a pure static web app.",
    deliverableSteps: [
      "Split agent core and dashboard into explicit modules.",
      "Add auth/rate limiting before public deployment.",
      "Document safe hosted mode and expected resource usage."
    ]
  },
  {
    id: "zoande-call-of-idk",
    title: "Call-of-idk",
    owner: "Zoande",
    repoUrl: "https://github.com/Zoande/Call-of-idk",
    liveUrl: "https://call-of-idk.vercel.app/",
    localPath: "repos/Zoande__Call-of-idk",
    tech: ["TypeScript", "Vite", "PixiJS", "Map Pipeline"],
    stage: "Map engine in progress",
    summary:
      "Strategy map project inspired by Call of War/HOI4 with large-province rendering, layers, and performance-driven architecture.",
    details: [
      "Contains map-viewer app with pan/zoom, layer toggles, and selection UI.",
      "Project goal targets ~13k provinces and multiple overlays.",
      "Includes preprocessing roadmap for province/state extraction."
    ],
    status:
      "Map viewer app is structured and runnable, but full data preprocessing and multiplayer-ready state are ongoing.",
    deliverableSteps: [
      "Finalize preprocessing pipeline output format.",
      "Benchmark and optimize high-density province rendering.",
      "Add deterministic layer toggle + selection test cases."
    ]
  },
  {
    id: "dh-polymarket-bot",
    title: "Polymarket-Bot",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/Polymarket-Bot",
    liveUrl: "https://polymarket-bot-green.vercel.app/",
    localPath: "repos/DH4410__Polymarket-Bot",
    tech: ["React", "Vite", "JavaScript"],
    stage: "Feature-rich frontend prototype",
    summary:
      "Trading assistant-style frontend with market scanning, signal logic, news sentiment hooks, and portfolio-facing utilities.",
    details: [
      "Large App.jsx implements API fetch layers and decision heuristics.",
      "Includes CORS proxy fallback strategy and multi-source data pulls.",
      "Project is code-heavy and suitable for modularization into smaller services."
    ],
    status:
      "Substantial logic exists in one large file; functionality is broad but maintainability should be improved.",
    deliverableSteps: [
      "Split API, strategy, and UI concerns into separate modules.",
      "Move keys/secrets to environment variables only.",
      "Add deterministic tests for signal-confidence math."
    ]
  },
  {
    id: "dh-typing-platformer",
    title: "typing-platformer",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/typing-platformer",
    liveUrl: "https://typing-platformer.vercel.app/",
    localPath: "repos/DH4410__typing-platformer",
    tech: ["Next.js", "TypeScript", "Canvas"],
    stage: "Playable concept",
    summary:
      "Typing-based action runner where typed commands control jump/crouch/sprint and influence score/combo.",
    details: [
      "Canvas loop and keyboard handling are in place.",
      "Tutorial and restart behavior already implemented.",
      "Several systems are still marked as stubs for future expansion."
    ],
    status:
      "Good gameplay direction with clear mechanics; not yet fully production-tuned.",
    deliverableSteps: [
      "Replace placeholder obstacle logic with full word/action generation.",
      "Complete collision/game-over balancing.",
      "Add mobile-friendly input mode."
    ]
  },
  {
    id: "dh-citybuilder",
    title: "CityBuilder",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/CityBuilder",
    liveUrl: "https://city-builder-henna.vercel.app/",
    localPath: "repos/DH4410__CityBuilder",
    tech: ["Vanilla JS", "HTML5 Canvas", "CSS"],
    stage: "Browser prototype",
    summary:
      "Megacity simulation prototype featuring terrain generation, building categories, and camera controls.",
    details: [
      "Plain HTML/CSS/JS stack keeps it lightweight.",
      "README outlines economy/service systems and controls.",
      "Good candidate for quick static deployment demos."
    ],
    status:
      "Straightforward static project; easiest to package as a standalone playable demo.",
    deliverableSteps: [
      "Add save/load state in local storage.",
      "Surface in-game onboarding for controls.",
      "Create performance profile presets for low-end devices."
    ]
  },
  {
    id: "dh-task-sorter-app",
    title: "task-sorter-app",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/task-sorter-app",
    liveUrl: "https://v0-task-sorter-app-six.vercel.app/",
    localPath: "repos/DH4410__task-sorter-app",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui"],
    stage: "Advanced UI prototype",
    summary:
      "Planly-style productivity app with calendar, routines, file upload analysis flow, and task scheduling.",
    details: [
      "App shell and view system are already structured.",
      "Upload flow integrates API-based assignment analysis endpoint.",
      "Rich component set indicates strong design-system foundation."
    ],
    status:
      "Frontend is strong; backend/API integration hardening and deployment wiring are next for production readiness.",
    deliverableSteps: [
      "Implement robust /api/analyze processing with validation.",
      "Add persisted auth/user model if multi-user is required.",
      "Add end-to-end tests for scheduling flow."
    ]
  },
  {
    id: "dh-isrlo-ibdp-subject",
    title: "ISRLO-IBDP-subject",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/ISRLO-IBDP-subject",
    liveUrl: "https://isrlo-ibdp-subject.vercel.app/",
    localPath: "repos/DH4410__ISRLO-IBDP-subject",
    tech: ["HTML", "CSS", "Vanilla JS"],
    stage: "Static tool",
    summary:
      "Interactive IB Diploma subject selector with clash rules, grouped subjects, and visual validation summaries.",
    details: [
      "Single-page static app with polished UI styling.",
      "Designed for practical subject-combination planning.",
      "Great fit for direct static hosting."
    ],
    status:
      "Already close to deployable static utility.",
    deliverableSteps: [
      "Add export/share of chosen subject package.",
      "Persist selection state in local storage.",
      "Add keyboard navigation accessibility pass."
    ]
  },
  {
    id: "dh-sticky-notes-app",
    title: "sticky-notes-app",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/sticky-notes-app",
    liveUrl: "https://sticky-notes-app-five-gamma.vercel.app/",
    localPath: "repos/DH4410__sticky-notes-app",
    tech: ["Next.js", "TypeScript", "Tailwind"],
    stage: "Collaborative app prototype",
    summary:
      "Collaborative sticky notes board with color-coded notes, optional lock codes, and styled board interface.",
    details: [
      "Server actions and DB table initialization hooks are present.",
      "Board UI and note creation panel are fully styled.",
      "Likely needs production DB/env setup for hosted use."
    ],
    status:
      "Feature-rich frontend with server-side dependencies that need deployment-ready data configuration.",
    deliverableSteps: [
      "Switch to managed database provider for Vercel deployment.",
      "Add note ownership/auth boundaries.",
      "Implement rate-limiting and content validation."
    ]
  },
  {
    id: "dh-studymaster",
    title: "studymaster",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/studymaster",
    liveUrl: "https://studymaster-eight.vercel.app/",
    localPath: "repos/DH4410__studymaster",
    tech: ["React", "Vite", "Tailwind"],
    stage: "Multi-page frontend",
    summary:
      "Study efficiency app frontend with router-based pages for dashboard, practice, pricing, analytics, and support chat widget.",
    details: [
      "Router skeleton and key pages/components are wired.",
      "Visual and navigation structure are established.",
      "Can be matured with real data integrations."
    ],
    status:
      "Usable frontend shell with clear expansion path into a full product.",
    deliverableSteps: [
      "Connect dashboards to real analytics/state.",
      "Add auth and account-level persistence.",
      "Profile bundle and lazy-load heavier views."
    ]
  },
  {
    id: "dh-swapspot",
    title: "Swapspot",
    owner: "DH4410",
    repoUrl: "https://github.com/DH4410/Swapspot",
    localPath: "repos/DH4410__Swapspot",
    tech: ["React", "TypeScript", "Vite", "Tailwind"],
    stage: "Playable game prototype",
    summary:
      "Memory/swap game with difficulty progression, rounds, lives, scoring, settings, and audio feedback systems.",
    details: [
      "Typed game state model and round verification flow are in place.",
      "Includes dark mode and modal overlays.",
      "Code comments indicate iterative fixes and UI improvements."
    ],
    status:
      "Most complete game architecture among the game repos; good candidate for polishing into a standout demo.",
    deliverableSteps: [
      "Add session persistence and leaderboard storage.",
      "Finalize balancing across higher difficulty tiers.",
      "Add touch-first controls and QA for mobile."
    ]
  }
];
