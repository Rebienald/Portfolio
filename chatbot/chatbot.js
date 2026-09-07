(function () {
    const CHAT_BACKEND_URL = '/api/chat';

    const MAX_MESSAGES_PER_WINDOW = 8;
    const RATE_LIMIT_WINDOW_MS = 60000;
    const chatTimestamps = [];

    function checkRateLimit() {
        const now = Date.now();
        while (chatTimestamps.length > 0 && chatTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
            chatTimestamps.shift();
        }
        if (chatTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
            return false;
        }
        chatTimestamps.push(now);
        return true;
    }

    const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous\s+|prior\s+)?instructions/i,
    /override\s+(system\s+)?prompt/i,
    /disregard\s+(above|previous|all\s+rules)/i,
    /reveal\s+(api\s+key|system\s+prompt|secret|token|password)/i,
    /print\s+(system\s+)?prompt/i,
    /show\s+me\s+(your\s+)?instructions/i,
    /act\s+as\s+an?\s+(unrestricted|jailbroken|evil)/i,
    /jailbreak/i,
    /DAN\s+mode/i,
    /developer\s+mode/i,
    /forget\s+(your\s+)?rules/i,
    /bypass\s+filter/i
    ];

    function isPromptInjection(text) {
        if (!text) return false;
        return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(text));
    }

    function initChatbotDOM() {
        if (document.getElementById('chatbotTrigger')) return;

        const container = document.createElement('div');
        container.id = 'rag-chatbot-root';
        container.innerHTML = `
        <!-- Floating Trigger Button -->
        <button id="chatbotTrigger" class="chatbot-trigger" aria-label="Open Chatbot" title="Chat with Rebienald AI">
        <svg class="trigger-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg class="trigger-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span id="chatbotBadge" class="chatbot-badge" style="display: none;">!</span>
        </button>

        <!-- Chatbot Modal Window -->
        <div id="chatbotWindow" class="chatbot-window" role="dialog" aria-labelledby="chatHeaderTitle">
        <div class="chat-header">
        <div class="chat-header-info">
        <div class="chat-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>
        </div>
        <div class="chat-title-group">
        <h4 id="chatHeaderTitle">Rebienald AI Assistant</h4>
        <div class="chat-status">
        <span class="status-dot"></span>
        <span>Online</span>
        </div>
        </div>
        </div>
        <div class="chat-header-actions">
        <button id="chatExpandBtn" class="chat-header-btn chat-expand-btn" aria-label="Enlarge or restore chat window" title="Enlarge window (or double-click header)">
        <svg class="icon-maximize" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <svg class="icon-minimize" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
        <polyline points="4 14 10 14 10 20"></polyline>
        <polyline points="20 10 14 10 14 4"></polyline>
        <line x1="14" y1="10" x2="21" y2="3"></line>
        <line x1="10" y1="14" x2="3" y2="21"></line>
        </svg>
        </button>
        <button id="chatCloseBtn" class="chat-header-btn chat-close-btn" aria-label="Close Chat" title="Close Chat">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        </div>
        </div>

        <div id="chatMessages" class="chat-messages">
        <div class="chat-msg bot">
        <div class="msg-bubble">
        Hi! I'm Rebienald's AI Assistant. Ask me anything about Rebienald's projects, experience, education, or contact info!
        </div>
        </div>
        </div>

        <div class="chat-suggestions">
        <button class="suggestion-chip" data-query="What are Rebienald's key skills?">💡 Key Skills</button>
        <button class="suggestion-chip" data-query="Tell me about SamAI and PrintHub.">🚀 Projects</button>
        <button class="suggestion-chip" data-query="How can I contact Rebienald?">📬 Contact Info</button>
        </div>

        <form id="chatInputForm" class="chat-input-form">
        <input type="text" id="chatInput" class="chat-input" placeholder="Type your question..." maxlength="300" autocomplete="off" required />
        <button type="submit" id="chatSendBtn" class="chat-send-btn" aria-label="Send Message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
        </form>
        </div>
        `;
        document.body.appendChild(container);
    }

    function parseMarkdown(text) {
        if (!text) return '';

        let raw = text.trim();

        raw = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

        raw = raw.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        raw = raw.replace(/`([^`]+)`/g, '<code>$1</code>');

        raw = raw.replace(/^###?\s+(.*)$/gm, '<h5 class="chat-heading">$1</h5>');
        raw = raw.replace(/^##\s+(.*)$/gm, '<h4 class="chat-heading">$1</h4>');

        raw = raw.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        raw = raw.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        raw = raw.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        const lines = raw.split('\n');
        let inList = false;
        let result = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            const listMatch = trimmed.match(/^[-•*+]\s+(.*)/);

            if (listMatch) {
                if (!inList) {
                    result.push('<ul class="chat-list">');
                    inList = true;
                }
                result.push(`<li>${listMatch[1]}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                if (trimmed.length > 0) {
                    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul')) {
                        result.push(trimmed);
                    } else {
                        result.push(`<p>${trimmed}</p>`);
                    }
                }
            }
        });

        if (inList) {
            result.push('</ul>');
        }

        return result.join('');
    }

    function scrollToBottom() {
        const messagesArea = document.getElementById('chatMessages');
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }

    let chatAudioCtx = null;
    function playChatbotReplySound() {
        try {
            if (typeof window !== 'undefined') {
                if (window.isSoundMuted && window.isSoundMuted()) return;
                if (localStorage.getItem('portfolio_sound_muted') === 'true') return;
            }
            if (!chatAudioCtx) {
                chatAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (chatAudioCtx.state === 'suspended') {
                chatAudioCtx.resume();
            }

            const t = chatAudioCtx.currentTime;

            // Two-tone sleek digital message chime (1050Hz -> 1400Hz)
            const osc1 = chatAudioCtx.createOscillator();
            const gain1 = chatAudioCtx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1050, t);

            gain1.gain.setValueAtTime(0.2, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            osc1.connect(gain1);
            gain1.connect(chatAudioCtx.destination);

            const osc2 = chatAudioCtx.createOscillator();
            const gain2 = chatAudioCtx.createGain();

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1400, t + 0.06);

            gain2.gain.setValueAtTime(0.25, t + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

            osc2.connect(gain2);
            gain2.connect(chatAudioCtx.destination);

            osc1.start(t);
            osc1.stop(t + 0.08);
            osc2.start(t + 0.06);
            osc2.stop(t + 0.16);
        } catch (e) {}
    }

    function showChatbotBadge() {
        const badge = document.getElementById('chatbotBadge');
        const windowEl = document.getElementById('chatbotWindow');
        if (badge && windowEl && !windowEl.classList.contains('open')) {
            badge.style.display = 'flex';
        }
    }

    function clearChatbotBadge() {
        const badge = document.getElementById('chatbotBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    function appendMessage(sender, content) {
        const messagesArea = document.getElementById('chatMessages');
        if (!messagesArea) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'msg-bubble';

        if (sender === 'user') {
            bubbleDiv.textContent = content;
        } else {
            bubbleDiv.innerHTML = parseMarkdown(content);
            playChatbotReplySound();
            showChatbotBadge();
        }

        msgDiv.appendChild(bubbleDiv);
        messagesArea.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const messagesArea = document.getElementById('chatMessages');
        if (!messagesArea) return;

        const indicator = document.createElement('div');
        indicator.id = 'chatTypingIndicator';
        indicator.className = 'chat-msg bot';
        indicator.innerHTML = `
        <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        </div>
        `;
        messagesArea.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('chatTypingIndicator');
        if (indicator) indicator.remove();
    }

    const LOCAL_KNOWLEDGE = {
        best: `🏆 **Rebienald's Top Flagship Projects**:

1. **InfoWhiz** - AI-powered gamified learning platform. Won **Best in Capstone Development** & **Best in System Development** at STI College Bacoor.
2. **SamAI** - Advanced AI study companion with custom **RAG pipeline**, multi-LLM orchestration (Gemini/Groq), and PHP 8 PSR-4 SQLite architecture.
3. **Cup Of Story** - Full-stack cafe ordering platform with dynamic cart state, responsive UI, and live ordering.`,

        samai: `🚀 **SamAI** (Flagship AI System - July 2026):

A high-performance AI study companion and document tutor with full **RAG (Retrieval-Augmented Generation)**:
- 🧠 **Multi-LLM Orchestration**: Custom API wrappers for **Google Gemini & Groq** with key rotation and rate-limit failover.
- ⚡ **Production Architecture**: Strict **PHP 8 PSR-4 OOP** with embedded **SQLite FTS5 BM25 search** and PDF parsing.
- 🔒 *Note: Source code is private for security.*`,

        cupofstory: `☕ **Cup Of Story** (Full-Stack Cafe Ordering System):

- 🎨 **Modern Experience**: Responsive UI with semantic HTML5, CSS3 glassmorphism, and Vanilla JavaScript.
- 🛒 **Core Features**: Real-time cart state management, dynamic pricing, and modal-based order customization.
- 🌐 **Live Demo**: [cupofstory.infinityfreeapp.com](http://cupofstory.infinityfreeapp.com/)`,

        infowhiz: `👑 **InfoWhiz** (Award-Winning Flagship Project):

An AI-powered gamified learning platform for beginner programmers (Java, C#, PHP, JS):
- 🏆 **Double Award Winner**: **Best in Capstone Development** & **Best in System Development** at STI College Bacoor.
- 🎮 **Features**: Real-time coding games (CheeseWhiz, CodeDefuse), in-browser IDE sandbox, and interactive AI debugger.
- 🌐 **Live Demo**: [infowhiz.hstn.me](https://infowhiz.hstn.me/Pages/index)`,

        testimonials: `🌟 **Peer Testimonials & Endorsements** (100% 10/10 Rating across 7 Peers):

- **Charles**: *"Highly skilled back-end developer, reliable teammate... always delivers quality work on time."*
- **John**: *"Super smooth transaction, mabilis ang service, very transparent. Highly recommended!"*
- **Nuñez**: *"Very efficient that makes me strive to be efficient as well."*
- **Engr. Jay**: *"Contributes majority of the ideas."*
Reb consistently earns 10/10 marks for velocity, clear communication, and high-impact delivery.`,

        portping: `⚡ **PortPing** (Cloud Keep-Alive Sentinel):

An automated keep-alive system ensuring 24/7 cloud database availability:
- 📡 **Automation**: Scheduled **GitHub Actions** cron running a **Node.js** ping client against PostgreSQL/Supabase REST endpoints.
- 🛡️ **Zero Downtime**: Prevents Supabase cloud projects from auto-pausing during idle periods.
- 🔗 **Repo**: [rebienalddev.github.io/PortPing](https://rebienalddev.github.io/PortPing/)`,

        portfolio: `🎨 **Rebienald's Portfolio Architecture**:

- ⚡ **Zero Framework Bloat**: Pure **Vanilla JS ES6+** and **CSS3 Design Tokens** with 60 FPS Canvas 2D graphics.
- 🧠 **Dual-Engine AI**: Multi-LLM failover (**Groq + Gemini**) with Supabase pgvector RAG and prompt sanitization.
- 🚀 **Serverless Infrastructure**: Hosted on **Vercel Serverless Functions** with automated GitHub CI/CD.`
    };

    function getSmartLocalAnswer(query) {
        if (!query) return null;
        const q = query.toLowerCase();

        if (q.includes('best') || q.includes('top project') || q.includes('flagship') || q.includes('most challenging') || q.includes('hardest')) {
            return LOCAL_KNOWLEDGE.best;
        }
        if (q.includes('cup of story') || q.includes('cupofstory') || q.includes('cup of coffee') || q.includes('coffee shop')) {
            return LOCAL_KNOWLEDGE.cupofstory;
        }
        if (q.includes('samai') || (q.includes('sam') && q.includes('ai')) || q.includes('july 2026')) {
            return LOCAL_KNOWLEDGE.samai;
        }
        if (q.includes('infowhiz') || q.includes('info whiz') || q.includes('capstone')) {
            return LOCAL_KNOWLEDGE.infowhiz;
        }
        if (q.includes('portping') || q.includes('port ping') || q.includes('nas.io') || q.includes('nas io') || q.includes('nasio') || q.includes('keep-alive') || q.includes('sentinel')) {
            return LOCAL_KNOWLEDGE.portping;
        }
        if (q.includes('portfolio tech stack') || q.includes('how was this portfolio made') || q.includes('how did you make this portfolio') || q.includes('portfolio stack') || q.includes('tech stack of this site') || q.includes('how this site was built')) {
            return LOCAL_KNOWLEDGE.portfolio;
        }
        if (q.includes('testimonial') || q.includes('endorse') || q.includes('feedback') || q.includes('review') || q.includes('jay') || q.includes('charles') || q.includes('john') || q.includes('nuñez') || q.includes('samantha') || q.includes('nicole') || q.includes('eldrain')) {
            return LOCAL_KNOWLEDGE.testimonials;
        }

        return null;
    }

    const conversationHistory = [];

    function updateSuggestionChips(lastQuery, botReply) {
        const suggestionsContainer = document.querySelector('.chat-suggestions');
        if (!suggestionsContainer) return;

        const combined = ((lastQuery || '') + ' ' + (botReply || '')).toLowerCase();
        let chips = [];

        if (combined.includes('infowhiz') || combined.includes('cheesewiz') || combined.includes('codedefuse')) {
            chips = [
                { label: '🎮 InfoWhiz Games', query: 'Tell me about the interactive games in InfoWhiz.' },
                { label: '🤖 SamAI RAG Project', query: 'How does SamAI work and what is its RAG pipeline?' },
                { label: '📬 Contact Rebienald', query: 'How can I reach out to hire or collaborate with Rebienald?' }
            ];
        } else if (combined.includes('samai') || combined.includes('rag') || combined.includes('pdfchunker')) {
            chips = [
                { label: '⚡ Multi-LLM Failover', query: 'How does SamAI handle key rotation and rate limits?' },
                { label: '🏆 InfoWhiz Awards', query: 'What awards did InfoWhiz win at STI College?' },
                { label: '💼 Tech Skills Matrix', query: 'What backend and database technologies does Rebienald master?' }
            ];
        } else if (combined.includes('portping') || combined.includes('sentinel') || combined.includes('supabase')) {
            chips = [
                { label: '📜 PrintPortal System', query: 'How does PrintPortal calculate prices and detect color?' },
                { label: '🌟 Peer Testimonials', query: 'What do teammates and clients say about Rebienald?' },
                { label: '📬 Hire Rebienald', query: 'How can I get in touch with Rebienald for an opportunity?' }
            ];
        } else if (combined.includes('printportal') || combined.includes('pricing') || combined.includes('ghostscript')) {
            chips = [
                { label: '📷 TechnoPhotobooth', query: 'What is TechnoBytes Photobooth?' },
                { label: '☕ Cup Of Story', query: 'Tell me about the Cup Of Story web app.' },
                { label: '📬 Contact Info', query: 'What are Rebienald\'s contact details?' }
            ];
        } else if (combined.includes('cup') || combined.includes('story') || combined.includes('coffee') || combined.includes('barista') || combined.includes('cafe')) {
            chips = [
                { label: '☕ 3-Tier Workflow', query: 'How does the customer, barista, and owner workflow work in Cup Of Story?' },
                { label: '🧾 Receipt Engine', query: 'How does Cup Of Story generate client receipts with HTML2Canvas?' },
                { label: '🌐 Live Web App', query: 'What is the live URL of Cup Of Story and how is its database set up?' }
            ];
        } else {
            chips = [
                { label: '🚀 Flagship Projects', query: 'What are Rebienald\'s top flagship projects?' },
                { label: '💡 Core Skills', query: 'What are Rebienald\'s key technical skills and expertise?' },
                { label: '📬 Hire / Contact', query: 'How can I get in touch to collaborate with Rebienald?' }
            ];
        }

        suggestionsContainer.innerHTML = chips
            .map(c => `<button class="suggestion-chip" data-query="${c.query}">${c.label}</button>`)
            .join('');
        suggestionsContainer.style.display = 'flex';
    }

    async function handleSendMessage(messageText) {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSendBtn');
        let query = (typeof messageText === 'string' ? messageText : '') || (input ? input.value.trim() : '');

        if (!query) return;

        query = query.slice(0, 300);
        if (input) input.value = '';

        const suggestions = document.querySelector('.chat-suggestions');
        if (suggestions) suggestions.style.display = 'none';

        if (!checkRateLimit()) {
            appendMessage('user', query);
            appendMessage('bot', "Rate limit reached. Please wait a minute before sending more messages.");
            return;
        }

        appendMessage('user', query);
        conversationHistory.push({ role: 'user', content: query });

        if (isPromptInjection(query)) {
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                const warning = "I am designed exclusively to assist with questions regarding Carpio Rebienald Khei's portfolio, skills, projects, and background.";
                appendMessage('bot', warning);
                conversationHistory.push({ role: 'assistant', content: warning });
            }, 400);
            return;
        }

        if (sendBtn) sendBtn.disabled = true;
        if (input) input.disabled = true;

        showTypingIndicator();

        try {
            const payload = {
                message: query,
                history: conversationHistory.slice(-8)
            };

            const response = await fetch(CHAT_BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            removeTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                const botReply = data.response || "No response received.";
                appendMessage('bot', botReply);
                conversationHistory.push({ role: 'assistant', content: botReply });
                if (conversationHistory.length > 16) {
                    conversationHistory.splice(0, conversationHistory.length - 16);
                }
                updateSuggestionChips(query, botReply);
            } else {
                appendMessage('bot', "Sorry, unable to process your request at the moment. Please try again.");
            }
        } catch (err) {
            console.error('Chat API error:', err);
            removeTypingIndicator();
            appendMessage('bot', "Connection issue contacting AI server. Please check your connection.");
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (input) {
                input.disabled = false;
                input.focus();
            }
        }
    }

    function toggleExpandChatbot(forceState) {
        const windowEl = document.getElementById('chatbotWindow');
        const expandBtn = document.getElementById('chatExpandBtn');
        if (!windowEl) return;

        const isCurrentlyExpanded = windowEl.classList.contains('expanded');
        const nextExpanded = typeof forceState === 'boolean' ? forceState : !isCurrentlyExpanded;

        if (nextExpanded) {
            windowEl.classList.add('expanded');
            try { localStorage.setItem('reb_chatbot_expanded', 'true'); } catch (e) {}
            if (expandBtn) {
                expandBtn.setAttribute('title', 'Restore normal size (or double-click header)');
                const maxIcon = expandBtn.querySelector('.icon-maximize');
                const minIcon = expandBtn.querySelector('.icon-minimize');
                if (maxIcon) maxIcon.style.display = 'none';
                if (minIcon) minIcon.style.display = 'block';
            }
        } else {
            windowEl.classList.remove('expanded');
            try { localStorage.setItem('reb_chatbot_expanded', 'false'); } catch (e) {}
            if (expandBtn) {
                expandBtn.setAttribute('title', 'Enlarge window (or double-click header)');
                const maxIcon = expandBtn.querySelector('.icon-maximize');
                const minIcon = expandBtn.querySelector('.icon-minimize');
                if (maxIcon) maxIcon.style.display = 'block';
                if (minIcon) minIcon.style.display = 'none';
            }
        }
    }

    function attachEventListeners() {
        const trigger = document.getElementById('chatbotTrigger');
        const windowEl = document.getElementById('chatbotWindow');
        const closeBtn = document.getElementById('chatCloseBtn');
        const expandBtn = document.getElementById('chatExpandBtn');
        const headerEl = document.querySelector('.chat-header');
        const form = document.getElementById('chatInputForm');

        if (trigger && windowEl) {
            trigger.addEventListener('click', () => {
                const isOpen = windowEl.classList.contains('open');
                if (isOpen) {
                    windowEl.classList.remove('open');
                    trigger.classList.remove('active');
                } else {
                    windowEl.classList.add('open');
                    trigger.classList.add('active');
                    clearChatbotBadge();
                    document.getElementById('chatInput')?.focus();
                }
            });
        }

        if (closeBtn && windowEl && trigger) {
            closeBtn.addEventListener('click', () => {
                windowEl.classList.remove('open');
                trigger.classList.remove('active');
            });
        }

        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleExpandChatbot();
            });
        }

        if (headerEl) {
            headerEl.addEventListener('dblclick', (e) => {
                if (e.target.closest('button')) return;
                if (window.innerWidth >= 600) {
                    toggleExpandChatbot();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && windowEl && windowEl.classList.contains('open')) {
                windowEl.classList.remove('open');
                trigger?.classList.remove('active');
            }
        });

        // Restore previously saved size preference on desktop screens
        try {
            if (window.innerWidth >= 600 && localStorage.getItem('reb_chatbot_expanded') === 'true') {
                toggleExpandChatbot(true);
            }
        } catch (e) {}

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSendMessage();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('suggestion-chip')) {
                const text = e.target.getAttribute('data-query');
                if (text) handleSendMessage(text);
            }
        });
    }

    window.openChatbotWithMessage = function(projectName, isPrivacyRestricted) {
        const tooltip = document.getElementById('techTooltip');
        if (tooltip) tooltip.classList.remove('visible');

        const windowEl = document.getElementById('chatbotWindow');
        const trigger = document.getElementById('chatbotTrigger');
        if (windowEl) {
            windowEl.classList.add('open');
            if (trigger) trigger.classList.add('active');
        }
        if (isPrivacyRestricted || projectName === 'SamAI') {
            appendMessage('bot', LOCAL_KNOWLEDGE.samai);
            conversationHistory.push({ role: 'assistant', content: LOCAL_KNOWLEDGE.samai });
            updateSuggestionChips('samai', LOCAL_KNOWLEDGE.samai);
        } else {
            const notice = `💻 **Desktop Required**: In order to view and experience **${projectName}**, you need to be on a PC or Desktop computer for full resolution and interactive capabilities.`;
            appendMessage('bot', notice);
            conversationHistory.push({ role: 'assistant', content: notice });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initChatbotDOM();
            attachEventListeners();
        });
    } else {
        initChatbotDOM();
        attachEventListeners();
    }
})();
