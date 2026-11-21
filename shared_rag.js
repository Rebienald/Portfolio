const fs = require("fs");

const FALLBACK_KNOWLEDGE = `Name: Carpio Rebienald Khei
Title: Full-Stack Web & Mobile Developer, Software Developer, IT Student
Address: Evangelista St., Talaba IV, Bacoor, Cavite
Email: rebkheicarpio@gmail.com
Phone: 09628489009
Portfolio: https://rebkhei.vercel.app/
GitHub: https://github.com/rebienalddev/Portfolio

Summary:
IT student at Cavite State University with 4+ years of experience building full-stack web applications, mobile applications, Discord bots, and AI-powered systems. Skilled in Java, JavaScript, C#, PHP, Node.js, ASP.NET, .NET MAUI, MySQL, SQLite, MongoDB, and Supabase. Focused on developing practical software that solves real-world problems.

Peer Testimonials & Endorsements (6 Teammates & Collaborators - All Rated 10/10):
1. Charles (10/10): "Reb is a highly skilled back-end developer, a reliable teammate, and a great friend. He communicates clearly, takes initiative on projects like our Discord bot and website, and always delivers quality work on time."
2. John (10/10): "Super smooth ng transaction and very easy to talk to. Maayos and mabilis yung service, and very transparent from start to finish. Highly recommended!"
3. Nuñez (10/10): "Very efficient that makes me strive to be efficient as well."
4. Engr. Jay (10/10): "Contributes majority of the ideas"
5. Nicole (10/10): "Very productive."
6. Eldrain (10/10): "Fantastic."

Verified Projects & Technical Specifications (Scanned Source Code & Documentation):

1. AI Integrated Gamified Programming Learning Platform (September 2025 - Flagship Best Capstone & Best System Award Winner):
- Overview: AI-powered gamified learning platform for computer programming education. Won Best in Capstone Development and Best in System Development among all SHS ICT students at STI College Bacoor.
- Core Purpose: Lowers the learning curve for beginner programmers learning Java, C#, PHP, and JavaScript through interactive simulations, automated code review, and live AI tutoring.
- Technical Architecture & Modules:
  * Backend: PHP 8 (MVC structured endpoints), MySQL database storing user progress, quiz banks, achievements, and code submission logs.
  * Interactive Coding Games: CheeseWhiz (Games/CheeseWhiz.php, GameScripts/CheeseWhiz.js - logic & maze puzzle mechanics), CodeDefuse (Games/CodeDefuse.php, GameScripts/CodeDefuse.js - timed bug fixing challenge), CodeQuest (Games/CodeQuest.php - client contract quests).
  * Built-in IDE & Sandbox (Pages/IDE.php): In-browser code editing with instant AJAX execution feedback.
  * AI Chatbot Assistant (Pages/ChatBot.php): Real-time AI debugging tutor providing targeted hints and explanations.
  * Learning Modules (Pages/ModulePage.php): Comprehensive modules for Java, C#, PHP, and JavaScript.
  * Progress & Time Tracking (Pages/ProgressPage.php, Functions/track_time.php): Logs time spent, module completion, and quiz scores.
  * Admin Dashboard (Pages/AdminPage.php, Pages/admin_handler.php, Pages/edit_user.php): User management and learning progress analytics.
  * Frontend: Semantic HTML5, Vanilla CSS3 (custom responsive styling), JavaScript ES6+ for AJAX code submission and real-time execution feedback loops.
  * Web Server: Apache web server via XAMPP / custom hosting.
  * Live URL: https://infowhiz.hstn.me/Pages/index

2. AI Document Tutoring & Quiz Platform (June - July 2026 - Flagship AI System):
- Overview: AI-powered study companion and document tutoring web application built for interactive PDF analysis, automated quiz generation, and Retrieval-Augmented Generation (RAG).
- Technical Architecture & Technical Specs:
  * Backend Architecture: PHP 8 structured with strict PSR-4 Object-Oriented Architecture (separated into Controllers, Services, Repositories, Models, Core, and Helpers) running on Apache.
  * Database & Storage: Embedded SQLite database (Server_env.php/samai.sqlite) accessed via PDO (PHP Data Objects) for zero-latency local caching of indexed document text chunks, generated quiz banks, and session states.
  * Composer Packages & Libraries: vlucas/phpdotenv (v5.6), smalot/pdfparser (v2.10 PDF text extraction), setasign/fpdi (v2.6 PDF manipulation), tecnickcom/tcpdf (v6.11 PDF creation), thiagoalessio/tesseract_ocr (v2.13 OCR for scanned document images).
  * Multi-LLM Orchestration: Custom API wrappers for Google Gemini (src/Helpers/GeminiClient.php) and Groq (src/Helpers/GroqClient.php) with automated key rotation, rate-limit cooldown management (Server_env.php/key_cooldowns.json), and model failover.
  * RAG Engine: Custom text chunking algorithm (PDFChunker - min 300 words, target 500 words, max 700 words), SearchService (SQLite FTS5 full-text search with BM25 ranking), PromptBuilder, and automated quiz generation engine (multiple-choice & identification).
  * Status: Private architecture & restricted web access for privacy and security.

3. Automated Cloud Database Keep-Alive System (August 2026):
- Overview: Automated cloud database keep-alive system built to prevent Supabase Cloud PostgreSQL databases from auto-pausing during periods of inactivity.
- Technical Infrastructure:
  * Core Script: Node.js HTTP/PostgREST ping client (ping.js).
  * Automation Engine: GitHub Actions scheduled workflow running automated daily/cron cycles (.github/workflows/main.yml).
  * Targeted Endpoint: HTTPS REST requests querying PostgREST system tables ('/rest/v1/comments?select=id&limit=1') to maintain active database I/O.
  * Smart History Inspection: Checks pings.json timestamp log before each cycle to evaluate 24-hour interval compliance.
  * CLI Flags: node ping.js (daily cycle), node ping.js --force (force immediate ping), node ping.js --loop (continuous local loop).
  * Live URL: https://rebienalddev.github.io/PortPing/

4. Campus Printing & Queue Management System (February - June 2026):
- Overview: Web-based print job submission and management system for campus printing centers featuring automated PDF analysis, dynamic color detection, payment verification, and live queue tracking.
- Technical Specifications:
  * Backend & DB: PHP 8, MySQL relational database (print_jobs table storing document_path, paper_size, copies, pages, color_pages, color_type, estimated_price, instructions, payment_mode, proof_of_payment, status, submission_date, is_archived).
  * PDF Analysis Pipeline: Multi-stage fallback page counting via pdfinfo (poppler-utils), qpdf, Ghostscript (gs), and regex structure parsing.
  * Color Detection Engine: Client-side pixel rendering via PDF.js + server-side Ghostscript rendering analyzed with PHP GD library (>3% color pixel sampling threshold).
  * Dynamic Pricing Algorithm: ₱3.00/page for B&W, ₱5.00/page for Color. Calculated as (BNW pages * ₱3.00 + Color pages * ₱5.00) * Copies.
  * Admin & Queue: Password-protected admin dashboard (admin.php), 30-second auto-refreshing public queue (queue.php), automated 7-day temp file cleanup (uploads/ and payment/), and downloadable PNG receipts (receipt.php via PHP GD).
  * Live URL: https://printportal.hstn.me/

5. Web-Based Digital Photobooth and Photo Customization System (2025 - 2026):
- Overview: Custom web-based photobooth application developed for STI College Bacoor student organization during Foundation Week.
- Technical Architecture:
  * Webcam Streaming: HTML5 MediaDevices API ('navigator.mediaDevices.getUserMedia') for real-time video capture.
  * Composition Engine: HTML5 Canvas API ('HTMLCanvasElement.getContext(2d)') for real-time frame overlay blending, sticker composition, image filters, and composite PNG rendering.
  * Frontend: JavaScript ES6+, HTML5, CSS3 micro-animations.
  * Live URL: https://rebienalddev.github.io/TechnoPhotobooth/

6. Web-Based Ordering and Management System (2026):
- Overview: Full-stack cafe ordering, barista kitchen fulfillment, and owner business management system built for specialty coffee shops.
- Technical Specifications:
  * Backend & Database: PHP 8, MySQL / MariaDB with PDO transactions and dual local/cloud environment connectivity.
  * Role Architecture: Customer Self-Ordering POS with real-time order lifecycle polling, Barista Kitchen Display System (KDS) with drink checklists and refund handling, and Owner Dashboard with product catalog controls and sales analytics.
  * Frontend & Styling: Vanilla JavaScript ES6+, HTML5, HTML2Canvas receipt engine, CSS3 Minimalist Paper Design System (#fbf9f5 canvas, #4a332a espresso accents, zero bloated frameworks or distracting gradients).
  * Live URL: https://cupofstory.hstn.me/cupofcoffee/user/index.php

7. Student Organization and Announcement Portal (April 2024):
- Overview: PHP-based web platform for managing student organization operations, member directories, and campus event announcements.
- Technical Specifications:
  * Role-Based Access Control (RBAC): Admin Dashboard (view/admin.php - approve/reject user registration, ticket management), Student Portal (view/student.php), Parent Portal (view/parent.php).
  * Student Clubs: Journalism (club/journ.php), Math (club/math.php), Science (club/science.php), Sports (club/sports.php), Teatro / Theater (club/teatro.php).
  * Announcements & Events: actions/add_announcement.php, actions/add_event.php, actions/delete_announcement.php, actions/delete_event.php.
  * Backend & Security: PHP, MySQL relational database (db.php, connection.php, config.php).
  * Frontend: HTML5, CSS3 (admin-style.css), JavaScript ES6+.
  * Live URL: https://spi-announcement-hub.free.nf/

8. On-Device Intelligent Voice Assistant (September 2026):
- Overview: Minimalist Python and GTK 3 desktop voice dictation and AI assistant controller built for Linux desktop automation and Antigravity pair programming. Note: This is a fast, agile desktop utility tool, NOT Rebienald's hardest project. His hardest and flagship systems are AI Integrated Gamified Programming Learning Platform and AI Document Tutoring & Quiz Platform.
- Technical Specifications:
  * Speech Recognition & Audio Pipeline: faster-whisper neural STT (int8 quantized small.en model running with VAD and phonetic auto-correction for developer terminology), FFmpeg PulseAudio capture pipeline.
  * Desktop Architecture: PyGObject / GTK 3 always-on-top dark floating window (#0c0c0e, zinc borders, monospace telemetry), background global shortcut daemon for instant push-to-talk workflows.
  * Multimodal & Vision Context: FreeDesktop ScreenCast Portal via DBus for instant desktop screenshots attached directly to voice queries.
  * Persistent Memory Engine: Embedded SQLite memory store with automated continuous synchronization, cross-session context persistence, developer preferences, and milestone audit logs with zero token bloat.
  * Telemetry & Agent Dispatch: Live token monitoring reading active session transcripts and visual warning gauges, Edge TTS speech synthesis for audio response playback, direct command routing to active CLI agents and system terminals.
  * Live Repository: https://github.com/Rebienald/Kaido

9. Personal Portfolio Website & Serverless RAG AI Assistant (August 2026):
- Overview: High-performance personal portfolio website integrated with a multi-LLM serverless AI assistant.
- Full Tech Stack & Architecture:
  * Frontend: Semantic HTML5, Vanilla CSS3 (custom HSL design system, Glassmorphism, CSS Grid/Flexbox, dynamic micro-interactions), Vanilla JavaScript ES6+. Zero heavy frontend framework dependencies for ultra-fast load times.
  * Serverless Backend: Node.js Vercel Serverless Functions ('/api/chat', '/api/guestbook').
  * AI Orchestration: Multi-LLM failover engine (Google Gemini 3.6 Flash & Groq LLaMA/Qwen) with prompt injection protection and thinking-token sanitization.
  * Database & RAG: Supabase Cloud PostgreSQL with portfolio_documents and portfolio_projects tables, keyword-assisted multi-table retrieval, and pgvector schema compatibility.
  * Infrastructure & Hosting: Vercel serverless hosting paired with GitHub Actions automated CI/CD pipeline.
  * Live URL: https://rebkhei.vercel.app/

Education:
- Cavite State University - Imus: Bachelor of Science in Information Technology (2026 - Present) - Status: Active / Ongoing
- STI College - Bacoor: TVL Track Major in Mobile App and Web Development (2024 - 2026) - Status: Completed. Awards: Graduated With Honors, Best in System Development, Best in Capstone Project.
- Binakayan National High School (2020 - 2024): Computer System Servicing - Status: Completed.

Technical Skills:
- Languages: Java, JavaScript, C#, PHP
- Front-End: HTML5, CSS3, Tailwind CSS, Bootstrap, JavaScript (ES6+)
- Back-End: PHP, Node.js, ASP.NET, .NET MAUI, C#, Java
- Databases: MySQL, MongoDB, SQLite, Supabase (pgvector)
- Tools & Environments: Git, GitHub, Antigravity CLI, Cursor, Devin, VS Code, Android Studio, Visual Studio, Ubuntu Linux, Windows 11, Zorin OS, Vercel, AWS, Netlify, Render, XAMPP

Key Awards & Recognition:
- Best in Capstone Project - STI College Bacoor
- Best in System Development - STI College Bacoor
- Tagisan ng Talino - CodeFest - STI College Bacoor
- TechTalk Ep. 2 Resource Speaker (Advanced Web Responsiveness & Deployment Pipelines) - STI College Bacoor
- TechTalk Ep. 1 Resource Speaker (HTML/CSS Fundamentals & Semantic Structuring) - STI College Bacoor
- 3rd Place Web Development & Design Competition - STI College Bacoor`;

const LEGACY_PROJECT_NAMES = [
    ["Kaido / OpenWhisper Desktop Voice Agent Interface", "On-Device Intelligent Voice Assistant"],
    ["OpenWhisper Desktop Voice Agent Interface", "On-Device Intelligent Voice Assistant"],
    ["Kaido Toggle", "Toggle"],
    ["Kaido Brain Memory Engine", "Persistent Memory Engine"],
    ["Kaido Brain", "Persistent Memory Engine"],
    ["Kaido", "On-Device Intelligent Voice Assistant"],
    ["Club Management System / Club Hub / ClubHub", "Student Organization and Announcement Portal"],
    ["Club Management System", "Student Organization and Announcement Portal"],
    ["Club Hub", "Student Organization and Announcement Portal"],
    ["ClubHub", "Student Organization and Announcement Portal"],
    ["PortPing / Keep-Alive Sentinel", "Automated Cloud Database Keep-Alive System"],
    ["Keep-Alive Sentinel", "Automated Cloud Database Keep-Alive System"],
    ["PortPing", "Automated Cloud Database Keep-Alive System"],
    ["Port Ping", "Automated Cloud Database Keep-Alive System"],
    ["PrintHub / Print Portal / PrintPortal", "Campus Printing & Queue Management System"],
    ["Print Portal", "Campus Printing & Queue Management System"],
    ["PrintPortal", "Campus Printing & Queue Management System"],
    ["PrintHub", "Campus Printing & Queue Management System"],
    ["TechnoBytes Photobooth", "Web-Based Digital Photobooth and Photo Customization System"],
    ["TechnoBytes", "Web-Based Digital Photobooth and Photo Customization System"],
    ["TechnoPhotobooth", "Web-Based Digital Photobooth and Photo Customization System"],
    ["Cup Of Story", "Web-Based Ordering and Management System"],
    ["Cup of Story", "Web-Based Ordering and Management System"],
    ["CupOfStory", "Web-Based Ordering and Management System"],
    ["cupofstory", "Web-Based Ordering and Management System"],
    ["Cup Of Coffee", "Web-Based Ordering and Management System"],
    ["Cup of Coffee", "Web-Based Ordering and Management System"],
    ["CupOfCoffee", "Web-Based Ordering and Management System"],
    ["cupofcoffee", "Web-Based Ordering and Management System"],
    ["AI Document Tutoring & Quiz Platform (SamAI)", "AI Document Tutoring & Quiz Platform"],
    ["AI Integrated Gamified Programming Learning Platform (InfoWhiz)", "AI Integrated Gamified Programming Learning Platform"],
    ["SAM AI", "AI Document Tutoring & Quiz Platform"],
    ["Sam AI", "AI Document Tutoring & Quiz Platform"],
    ["SamAI", "AI Document Tutoring & Quiz Platform"],
    ["InfoWhiz", "AI Integrated Gamified Programming Learning Platform"],
    ["Info Whiz", "AI Integrated Gamified Programming Learning Platform"],
    ["Nas.IO Bot", "Automated Cloud Database Keep-Alive System"],
    ["Nas.IO", "Automated Cloud Database Keep-Alive System"],
    ["NAS.IO", "Automated Cloud Database Keep-Alive System"],
    ["nas.io", "Automated Cloud Database Keep-Alive System"],
    ["OpenWhisper", "On-Device Intelligent Voice Assistant"],
    ["openwhisper", "On-Device Intelligent Voice Assistant"],
].sort((a, b) => b[0].length - a[0].length);

function normalizeKnowledge(text) {
    let normalized = String(text || "");
    for (const [legacyName, indexName] of LEGACY_PROJECT_NAMES) {
        const pattern = legacyName
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\//g, "\\s*\\/\\s*");
        normalized = normalized.replace(new RegExp(pattern, "gi"), indexName);
    }
    const matchCase = (match) => (match[0] === match[0].toUpperCase() ? "Developer" : "developer");
    return normalized
        .replace(/\s*\([^)]*(?:Kaido|OpenWhisper|SamAI|Sam\s*AI|InfoWhiz|Info\s*Whiz|PortPing|Sentinel|Keep-Alive|PrintHub|Print\s*Portal|ClubHub|Club\s*Hub|Cup\s*Of\s*Story|cupofstory|Cup\s*Of\s*Coffee|cupofcoffee|TechnoBytes|Nas\.IO)[^)]*\)/gi, "")
        .replace(/\s*\(formerly[^)]*\)/gi, "")
        .replace(/\b7\s+testimonials?\b/gi, "6 testimonials")
        .replace(/\bseven\s+testimonials?\b/gi, "6 testimonials")
        .replace(/\ban\s+(?:software\s+)?engineers?\b/gi, (m) => (m[0] === m[0].toUpperCase() ? "A developer" : "a developer"))
        .replace(/\ban\s+developer\b/gi, "a developer")
        .replace(/\bsoftware\s+engineers?\b/gi, matchCase)
        .replace(/\bengineers?\b/gi, matchCase)
        .replace(/\bengineering\b/gi, (match) => (match[0] === match[0].toUpperCase() ? "Development" : "development"));
}

const STOPWORDS = new Set([
    "what", "tell", "about", "your", "with", "from", "show", "help", "does", "have",
    "make", "this", "that", "more", "some", "like", "know", "when", "where", "which",
    "could", "would", "please", "describe", "explain", "give", "project", "details", "built", "the",
    "and", "for", "are", "was", "were", "been", "being", "how", "who", "whom",
    "why", "his", "her", "their", "its", "can", "will", "just", "any", "all",
    "each", "you", "they", "them", "our", "is"
]);

const ALIAS_MAP = {
    infowhiz: ["AI Integrated Gamified Programming Learning Platform", "CheeseWhiz", "CodeDefuse", "CodeQuest"],
    whiz: ["AI Integrated Gamified Programming Learning Platform", "CheeseWhiz"],
    samai: ["AI Document Tutoring & Quiz Platform", "PDFChunker", "SearchService"],
    sam: ["AI Document Tutoring & Quiz Platform"],
    portping: ["Automated Cloud Database Keep-Alive System", "ping.js"],
    ping: ["Automated Cloud Database Keep-Alive System"],
    nas: ["Automated Cloud Database Keep-Alive System"],
    printportal: ["Campus Printing & Queue Management System", "print_jobs"],
    printhub: ["Campus Printing & Queue Management System"],
    printer: ["Campus Printing & Queue Management System"],
    printing: ["Campus Printing & Queue Management System"],
    technobytes: ["Web-Based Digital Photobooth and Photo Customization System", "Photobooth"],
    photobooth: ["Web-Based Digital Photobooth and Photo Customization System", "Photobooth"],
    cupofstory: ["Web-Based Ordering and Management System", "barista"],
    cup: ["Web-Based Ordering and Management System"],
    story: ["Web-Based Ordering and Management System"],
    coffee: ["Web-Based Ordering and Management System"],
    cafe: ["Web-Based Ordering and Management System"],
    barista: ["Web-Based Ordering and Management System", "barista"],
    cupofcoffee: ["Web-Based Ordering and Management System"],
    clubhub: ["Student Organization and Announcement Portal"],
    club: ["Student Organization and Announcement Portal"],
    kaido: ["On-Device Intelligent Voice Assistant", "faster-whisper", "voice dictation"],
    kaidobrain: ["On-Device Intelligent Voice Assistant", "Persistent Memory Engine", "SQLite memory"],
    brain: ["On-Device Intelligent Voice Assistant", "Persistent Memory Engine", "SQLite memory"],
    whisper: ["On-Device Intelligent Voice Assistant", "faster-whisper", "voice dictation"],
    voice: ["On-Device Intelligent Voice Assistant", "faster-whisper", "voice dictation"],
    dictation: ["On-Device Intelligent Voice Assistant", "faster-whisper", "voice dictation"],
    openwhisper: ["On-Device Intelligent Voice Assistant", "faster-whisper"],
    portfolio: ["Portfolio", "Serverless RAG"],
    skills: ["Technical Skills", "Languages"],
    education: ["Cavite State University", "STI College"],
    awards: ["Best in Capstone", "Best in System Development"],
    testimonials: ["Peer Testimonials", "Charles", "John"],
};

function extractSearchTerms(userQuery) {
    const clean = String(userQuery || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ");
    const words = clean.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
    const terms = new Set();
    for (const w of words) {
        if (ALIAS_MAP[w]) {
            ALIAS_MAP[w].forEach((alias) => terms.add(alias));
        }
    }
    for (const w of words) {
        terms.add(w);
    }
    return Array.from(terms);
}

function postJSON(urlStr, headers, bodyObj) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const postData = JSON.stringify(bodyObj);
        const reqHeaders = {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            ...headers,
        };
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: "POST",
            headers: reqHeaders,
        };
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data),
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                    });
                }
            });
        });
        req.on("error", reject);
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error("Timeout"));
        });
        req.write(postData);
        req.end();
    });
}

async function saveToGeneralBrain(sessionId, userMessage, assistantReply) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    try {
        const cleanUrl = supabaseUrl.replace(/\/$/, "");
        await postJSON(
            `${cleanUrl}/rest/v1/portfolio_documents`,
            {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "return=minimal",
            },
            {
                content: `[[GENERAL_BRAIN]]\nUser: ${String(userMessage).slice(0, 300)}\nAssistant: ${String(assistantReply).slice(0, 1500)}`,
                metadata: {
                    type: "general_brain",
                    session_id: String(sessionId || "anonymous").slice(0, 80),
                    saved_at: new Date().toISOString(),
                },
            }
        );
    } catch (err) {
        console.warn("General Brain save notice:", err.message);
    }
}

function getGeneralBrainMemory(limit = 5) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return Promise.resolve("");
    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const endpoint = `${cleanUrl}/rest/v1/portfolio_documents?select=content&metadata-%3E%3Etype=eq.general_brain&order=id.desc&limit=${limit}`;
    return new Promise((resolve) => {
        const req = https.get(
            endpoint,
            {
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                },
            },
            (r) => {
                let data = "";
                r.on("data", (c) => (data += c));
                r.on("end", () => {
                    try {
                        const rows = JSON.parse(data);
                        if (!Array.isArray(rows)) return resolve("");
                        resolve(
                            rows
                                .map((row) => row.content)
                                .filter(Boolean)
                                .reverse()
                                .join("\n\n")
                        );
                    } catch (e) {
                        resolve("");
                    }
                });
            }
        );
        req.on("error", () => resolve(""));
        req.setTimeout(4000, () => {
            req.destroy();
            resolve("");
        });
    });
}

async function getRAGContext(userQuery, history = []) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    let brainMemory = "";
    if (supabaseUrl && supabaseKey) {
        try {
            const cleanUrl = supabaseUrl.replace(/\/$/, "");
            const recentHistoryText = history
                .slice(-2)
                .map((h) => h.content || "")
                .join(" ");
            const terms = extractSearchTerms(`${recentHistoryText} ${userQuery}`);
            const headers = {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
            };
            const orFilters = terms
                .slice(0, 6)
                .map((t) => `content.ilike.*${encodeURIComponent(t)}*`)
                .join(",");
            const filterQuery = orFilters
                ? `or=(${orFilters})`
                : `content=ilike.*AI Integrated Gamified Programming Learning Platform*`;
            const fetchTable = (endpoint) =>
                new Promise((resolve) => {
                    const req = https.get(
                        endpoint,
                        {
                            headers: headers,
                        },
                        (r) => {
                            let data = "";
                            r.on("data", (c) => (data += c));
                            r.on("end", () => {
                                try {
                                    resolve({
                                        status: r.statusCode,
                                        data: JSON.parse(data),
                                    });
                                } catch (e) {
                                    resolve({
                                        status: r.statusCode,
                                        data: [],
                                    });
                                }
                            });
                        }
                    );
                    req.on("error", () =>
                        resolve({
                            status: 500,
                            data: [],
                        })
                    );
                    req.setTimeout(2500, () => {
                        req.destroy();
                        resolve({
                            status: 408,
                            data: [],
                        });
                    });
                });
            const [docsRes, projRes, infoRes, brainRes] = await Promise.all([
                fetchTable(
                    `${cleanUrl}/rest/v1/portfolio_documents?select=content&${filterQuery}&order=id.desc&limit=5`
                ),
                fetchTable(`${cleanUrl}/rest/v1/portfolio_projects?select=content&${filterQuery}&limit=4`),
                fetchTable(`${cleanUrl}/rest/v1/personal_info?select=content&${filterQuery}&limit=4`),
                getGeneralBrainMemory(5),
            ]);
            brainMemory = brainRes || "";
            const isCupQuery = terms.some((t) =>
                ["cup of story", "cupofstory", "cupofcoffee", "coffee", "cafe", "barista", "web-based ordering and management system"].includes(
                    String(t).toLowerCase()
                )
            );
            const allChunks = [
                ...(Array.isArray(docsRes.data) ? docsRes.data.map((i) => i.content) : []),
                ...(Array.isArray(projRes.data) ? projRes.data.map((i) => i.content) : []),
                ...(Array.isArray(infoRes.data) ? infoRes.data.map((i) => i.content) : []),
            ]
                .filter(Boolean)
                .map((chunk) =>
                    typeof chunk === "string" ? chunk.replaceAll("rebienald.vercel.app", "rebkhei.vercel.app") : chunk
                )
                .filter((chunk) => !(typeof chunk === "string" && chunk.startsWith("[[GENERAL_BRAIN]]")))
                .filter((chunk) => {
                    if (chunk.includes("axionbytee.github.io/cupofstory") || chunk.includes("CUP OF STORY (2025)")) {
                        return false;
                    }
                    return true;
                });
            if (
                isCupQuery &&
                !allChunks.some((c) => c.includes("Web-Based Ordering and Management System (2026)"))
            ) {
                const cupChunk = FALLBACK_KNOWLEDGE.split("\n\n").find((sec) => sec.includes("Web-Based Ordering and Management System"));
                if (cupChunk) allChunks.unshift(cupChunk);
            }
            const uniqueChunks = [...new Set(allChunks)];
            const memoryBlock = brainMemory
                ? `--- GENERAL BRAIN (remembered conversations) ---\n${brainMemory}`
                : "";
            if (uniqueChunks.length > 0) {
                return [normalizeKnowledge(uniqueChunks.join("\n\n")), memoryBlock].filter(Boolean).join("\n\n");
            }
        } catch (err) {
            console.warn("Supabase RAG notice:", err.message);
        }
    }
    const memoryBlock = brainMemory
        ? `--- GENERAL BRAIN (remembered conversations) ---\n${brainMemory}`
        : "";
    return [normalizeKnowledge(FALLBACK_KNOWLEDGE), memoryBlock].filter(Boolean).join("\n\n");
}

function cleanResponse(text) {
    if (!text) return "";
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, "");
    return cleaned.trim();
}

async function queryAI(userMessage, ragContext, history = []) {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const systemPrompt = `
You are the official AI Portfolio Ambassador and technical advocate for Carpio Rebienald Khei (Reb).
You represent a full-stack developer and IT student at Cavite State University with high charisma, deep technical precision, and confidence.
Always describe Reb only as a full-stack developer and IT student. Never use "engineer", "engineering", or any other role title.

Use ONLY these exact project titles, verbatim:
- AI Integrated Gamified Programming Learning Platform
- AI Document Tutoring & Quiz Platform
- Automated Cloud Database Keep-Alive System
- Campus Printing & Queue Management System
- Web-Based Digital Photobooth and Photo Customization System
- Web-Based Ordering and Management System
- Student Organization and Announcement Portal
- On-Device Intelligent Voice Assistant

Never mention, repeat, or hint at any old nicknames or former project names. If the user mentions an old name, silently translate it to the exact project title above and reply without repeating the old name.
Always say "6 peer testimonials", never 7.

RESPONSE STYLE & BREVITY RULES (STRICT & ABSOLUTE):
1. SUMMARIZED YET IMPRESSIVE (NO WALLS OF TEXT):
   - Keep replies concise, punchy, and instantly skimmable (typically 2 to 3 short paragraphs or 2 to 4 crisp bullet points, ~80 to 140 words max).
   - Nobody reads long walls of text. Avoid filler, lengthy introductions, and repetitive lists. Get straight to the high-impact facts.
   - Boldly emphasize Reb's strong development standards, architectural depth, awards, and velocity.
2. HIGH-SIGNAL TECHNICAL HIGHLIGHTS & FLAGSHIP PROJECT RANKINGS:
   - Hardest & Flagship Projects: Rebienald's two hardest, best, and most demanding projects are strictly AI Integrated Gamified Programming Learning Platform (Best in Capstone & Best in System Development, complex full-stack PHP/MySQL gamified platform with built-in IDE & AI tutor) and AI Document Tutoring & Quiz Platform (his most technically challenging AI system, enterprise-grade PSR-4 OOP architecture, custom RAG pipeline, PDFChunker, and multi-LLM orchestration). Whenever asked about his hardest, best, most complex, or flagship project, ALWAYS highlight those two first.
   - Voice Assistant Context: On-Device Intelligent Voice Assistant is an innovative desktop utility and voice dictation controller built in Python/GTK 3, but is NOT his hardest project compared to the two flagship platforms above.
   - Full-Stack & Systems: Native PHP 8 (PSR-4 OOP, MVC, PDO), Node.js, C#, Java, ASP.NET, MySQL, SQLite, and Supabase (PostgreSQL).
   - Performance Craftsmanship: Zero heavy frontend framework bloat; ultra-fast Vanilla JavaScript ES6+, bespoke CSS3 design tokens, and HTML5 Canvas 2D graphics.
   - Production AI & RAG: Built custom RAG pipelines with semantic text chunking, SQLite FTS5 BM25 search, multi-LLM orchestration (Gemini & Groq), rate-limit cooldown algorithms, and prompt injection defense.
   - Award Winner: Winner of Best in Capstone Project and Best in System Development at STI College Bacoor.
   - Proven Velocity: 100% 10/10 peer and client ratings across 6 testimonials praising his initiative and reliability.
3. CONVERSATIONAL MEMORY & FORMATTING:
   - Remember previous questions seamlessly. For follow-ups, answer directly without re-explaining the basics.
   - Use bold text (**bold**) for key technologies, metrics, and achievements.
   - Use clean, short bullet points (- item) for scannability.
   - End with a quick 1-sentence prompt inviting them to explore a live demo or get in touch.
   - Contact details when relevant: Email: rebkheicarpio@gmail.com | Phone: 09628489009 | Portfolio: https://rebkhei.vercel.app/
   - NEVER output internal reasoning, <think> tags, or conversational fluff.

Verified Portfolio Knowledge Base:
--- CONTEXT ---
${normalizeKnowledge(ragContext)}
--- END CONTEXT ---
`;
    const sanitizedHistory = Array.isArray(history)
        ? history
              .filter(
                  (h) =>
                      h &&
                      (h.role === "user" || h.role === "assistant" || h.role === "model") &&
                      typeof h.content === "string"
              )
              .map((h) => ({
                  role: h.role === "model" ? "assistant" : h.role,
                  content: String(h.content).slice(0, 500),
              }))
              .slice(-6)
        : [];
    if (groqKey) {
        const groqModels = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"];
        for (const model of groqModels) {
            try {
                const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
                const res = await postJSON(
                    groqUrl,
                    {
                        Authorization: `Bearer ${groqKey}`,
                        "User-Agent": "Portfolio-AI-Backend/1.0",
                    },
                    {
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt,
                            },
                            ...sanitizedHistory,
                            {
                                role: "user",
                                content: userMessage,
                            },
                        ],
                        temperature: 0.5,
                        max_tokens: 1200,
                    }
                );
                if (res.status === 200 && res.data?.choices?.[0]?.message?.content) {
                    const rawText = res.data.choices[0].message.content;
                    const cleaned = cleanResponse(rawText);
                    if (cleaned) return normalizeKnowledge(cleaned);
                }
            } catch (err) {
                console.warn(`Groq API model ${model} error:`, err.message);
            }
        }
    }
    if (geminiKey) {
        const geminiModels = ["gemini-1.5-flash", "gemini-1.5-pro"];
        const geminiContents = [
            ...sanitizedHistory.map((h) => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [
                    {
                        text: h.content,
                    },
                ],
            })),
            {
                role: "user",
                parts: [
                    {
                        text: userMessage,
                    },
                ],
            },
        ];
        for (const model of geminiModels) {
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                const res = await postJSON(
                    geminiUrl,
                    {},
                    {
                        systemInstruction: {
                            parts: [
                                {
                                    text: systemPrompt,
                                },
                            ],
                        },
                        contents: geminiContents,
                        generationConfig: {
                            temperature: 0.5,
                            maxOutputTokens: 1200,
                        },
                    }
                );
                if (res.status === 200 && res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const rawText = res.data.candidates[0].content.parts[0].text;
                    const cleaned = cleanResponse(rawText);
                    if (cleaned) return normalizeKnowledge(cleaned);
                }
            } catch (err) {
                console.warn(`Gemini model ${model} error:`, err.message);
            }
        }
    }
    return "I'm having a brief connection delay reaching the AI engine. Feel free to ask again or reach out to Reb directly at rebkheicarpio@gmail.com!";
}

module.exports = {
    FALLBACK_KNOWLEDGE,
    LEGACY_PROJECT_NAMES,
    normalizeKnowledge,
    STOPWORDS,
    ALIAS_MAP,
    extractSearchTerms,
    postJSON,
    saveToGeneralBrain,
    getGeneralBrainMemory,
    getRAGContext,
    cleanResponse,
    queryAI,
};
