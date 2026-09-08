document.addEventListener('DOMContentLoaded', () => {
                    const scrollContainers = document.querySelectorAll('.services-grid, .timeline-carousel, .projects-marquee, .certs-marquee');
                    scrollContainers.forEach(container => {
                        let startX = 0;
                        let startY = 0;
                        let isVertical = false;
                        let isFirstMove = true;
                        container.addEventListener('touchstart', (e) => {
                            startX = e.touches[0].clientX;
                            startY = e.touches[0].clientY;
                            isVertical = false;
                            isFirstMove = true;
                        }, { passive: true });
                        container.addEventListener('touchmove', (e) => {
                            if (isVertical) {
                                container.style.overflowX = 'hidden';
                                return;
                            }
                            if (isFirstMove) {
                                isFirstMove = false;
                                const diffX = Math.abs(e.touches[0].clientX - startX);
                                const diffY = Math.abs(e.touches[0].clientY - startY);
                                if (diffY > diffX && diffY > 4) {
                                    isVertical = true;
                                    container.style.overflowX = 'hidden';
                                }
                            }
                        }, { passive: true });
                        container.addEventListener('touchend', () => {
                            container.style.overflowX = 'auto';
                        }, { passive: true });
                        container.addEventListener('touchcancel', () => {
                            container.style.overflowX = 'auto';
                        }, { passive: true });
                    });
                });
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: "0px 0px -50px 0px"
                };
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('active');
                            observer.unobserve(entry.target);
                        }
                    });
                }, observerOptions);
                const isMobile = window.innerWidth <= 768;
                document.querySelectorAll('.reveal').forEach(el => {
                    if (isMobile && el.closest('.skills-container')) {
                        el.classList.add('active');
                    } else {
                        observer.observe(el);
                    }
                });
                window.toggleMobileMenu = function() {
                    playClickSound();
                    const mobileMenu = document.getElementById('mobileMenu');
                    if (mobileMenu) {
                        const isActive = mobileMenu.classList.toggle('active');
                        document.body.style.overflow = isActive ? 'hidden' : '';
                    }
                };

                let audioCtx = null;
                let audioUnlocked = false;
                let lastHoverSoundTime = 0;

                window.isSoundMuted = function() {
                    return localStorage.getItem('portfolio_sound_muted') === 'true';
                };

                window.setSoundMuted = function(muted) {
                    localStorage.setItem('portfolio_sound_muted', muted ? 'true' : 'false');
                    updateMuteButtonUI();
                };

                function updateMuteButtonUI() {
                    const muteBtn = document.getElementById('muteToggleBtn');
                    if (!muteBtn) return;
                    const isMuted = window.isSoundMuted();
                    const icon = muteBtn.querySelector('i');
                    if (isMuted) {
                        muteBtn.classList.add('muted');
                        if (icon) icon.className = 'fas fa-volume-xmark';
                        muteBtn.setAttribute('title', 'Sound: MUTED (Click to unmute)');
                        muteBtn.setAttribute('aria-label', 'Sound is muted');
                    } else {
                        muteBtn.classList.remove('muted');
                        if (icon) icon.className = 'fas fa-volume-high';
                        muteBtn.setAttribute('title', 'Sound: ON (Click to mute)');
                        muteBtn.setAttribute('aria-label', 'Sound is on');
                    }
                }

                function initAudioContext() {
                    try {
                        if (window.isSoundMuted && window.isSoundMuted()) return;
                        if (!audioCtx) {
                            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        }
                        if (audioCtx.state === 'suspended') {
                            audioCtx.resume();
                        }
                        if (!audioUnlocked && audioCtx.state === 'running') {
                            audioUnlocked = true;
                            const buffer = audioCtx.createBuffer(1, 1, 22050);
                            const source = audioCtx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioCtx.destination);
                            source.start(0);
                        }
                    } catch (e) {}
                }

                // CRASH-PROOF & ACCURATE CLICKY UI SOUND ENGINE
                function playHoverSound() {
                    if (window.isSoundMuted && window.isSoundMuted()) return;
                    try {
                        initAudioContext();
                        if (!audioCtx) return;

                        const t = audioCtx.currentTime;

                        // Ultra-crisp mechanical clicky pop (2600Hz -> 550Hz)
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();

                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(2600, t);
                        osc.frequency.exponentialRampToValueAtTime(550, t + 0.012);

                        gain.gain.setValueAtTime(0.35, t);
                        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

                        osc.connect(gain);
                        gain.connect(audioCtx.destination);

                        osc.start(t);
                        osc.stop(t + 0.012);
                    } catch (err) {}
                }

                function playClickSound() {
                    if (window.isSoundMuted && window.isSoundMuted()) return;
                    try {
                        initAudioContext();
                        if (!audioCtx) return;

                        const t = audioCtx.currentTime;

                        // Punchy mechanical mouse click
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();

                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(1600, t);
                        osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);

                        gain.gain.setValueAtTime(0.5, t);
                        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

                        osc.connect(gain);
                        gain.connect(audioCtx.destination);

                        osc.start(t);
                        osc.stop(t + 0.035);
                    } catch (err) {}
                }

                let clickWavUrl = null;
                function getClickWavUrl() {
                    if (clickWavUrl) return clickWavUrl;
                    try {
                        const sampleRate = 22050;
                        const numSamples = Math.floor(sampleRate * 0.014);
                        const dataSize = numSamples * 2;
                        const fileSize = 44 + dataSize;
                        const buffer = new ArrayBuffer(fileSize);
                        const view = new DataView(buffer);

                        const writeStr = (off, str) => {
                            for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
                        };

                        writeStr(0, 'RIFF');
                        view.setUint32(4, fileSize - 8, true);
                        writeStr(8, 'WAVE');
                        writeStr(12, 'fmt ');
                        view.setUint32(16, 16, true);
                        view.setUint16(20, 1, true);
                        view.setUint16(22, 1, true);
                        view.setUint32(24, sampleRate, true);
                        view.setUint32(28, sampleRate * 2, true);
                        view.setUint16(32, 2, true);
                        view.setUint16(34, 16, true);
                        writeStr(36, 'data');
                        view.setUint32(40, dataSize, true);

                        for (let i = 0; i < numSamples; i++) {
                            const t = i / sampleRate;
                            const sample = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t / 0.003) * 0.8;
                            view.setInt16(44 + i * 2, Math.floor(sample * 32767), true);
                        }

                        const blob = new Blob([buffer], { type: 'audio/wav' });
                        clickWavUrl = URL.createObjectURL(blob);
                    } catch (e) {}
                    return clickWavUrl;
                }

                function playTypingSound() {
                    if (window.isSoundMuted && window.isSoundMuted()) return;
                    try {
                        const url = getClickWavUrl();
                        if (url) {
                            const a = new Audio(url);
                            a.volume = 0.5;
                            a.play().catch(() => {});
                        }
                    } catch (e) {}

                    try {
                        initAudioContext();
                        if (!audioCtx) return;

                        const t = audioCtx.currentTime;
                        const freq = 2400 + Math.random() * 600;

                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();

                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, t);
                        osc.frequency.exponentialRampToValueAtTime(500, t + 0.014);

                        gain.gain.setValueAtTime(0.4, t);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.014);

                        osc.connect(gain);
                        gain.connect(audioCtx.destination);

                        osc.start(t);
                        osc.stop(t + 0.014);
                    } catch (err) {}
                }

                let lastSelectionTickTime = 0;
                function playSelectionTickSound() {
                    if (window.isSoundMuted && window.isSoundMuted()) return;
                    const now = Date.now();
                    if (now - lastSelectionTickTime < 35) return;
                    lastSelectionTickTime = now;

                    try {
                        initAudioContext();
                        if (!audioCtx) return;

                        const t = audioCtx.currentTime;

                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();

                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(2800, t);
                        osc.frequency.exponentialRampToValueAtTime(800, t + 0.009);

                        gain.gain.setValueAtTime(0.25, t);
                        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.009);

                        osc.connect(gain);
                        gain.connect(audioCtx.destination);

                        osc.start(t);
                        osc.stop(t + 0.009);
                    } catch (err) {}
                }

                function playCardShuffleSound() {
                    if (window.isSoundMuted && window.isSoundMuted()) return;
                    try {
                        initAudioContext();
                        if (!audioCtx) return;

                        const now = audioCtx.currentTime;
                        [0, 0.035, 0.075].forEach((offset, idx) => {
                            const t = now + offset;
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();

                            osc.type = 'triangle';
                            osc.frequency.setValueAtTime(1800 - idx * 250, t);
                            osc.frequency.exponentialRampToValueAtTime(600 - idx * 100, t + 0.025);

                            gain.gain.setValueAtTime(0.35 - idx * 0.08, t);
                            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

                            osc.connect(gain);
                            gain.connect(audioCtx.destination);

                            osc.start(t);
                            osc.stop(t + 0.025);
                        });
                    } catch (err) {}
                }

                // TOP-LEVEL AUDIO UNLOCK LISTENER (Unlocks AudioContext instantly on load)
                (function() {
                    const unlock = () => {
                        initAudioContext();
                        window.removeEventListener('pointerdown', unlock);
                        window.removeEventListener('pointermove', unlock);
                        window.removeEventListener('mousemove', unlock);
                        window.removeEventListener('touchstart', unlock);
                        window.removeEventListener('keydown', unlock);
                        window.removeEventListener('scroll', unlock);
                    };
                    window.addEventListener('pointerdown', unlock, { passive: true });
                    window.addEventListener('pointermove', unlock, { passive: true });
                    window.addEventListener('mousemove', unlock, { passive: true });
                    window.addEventListener('touchstart', unlock, { passive: true });
                    window.addEventListener('keydown', unlock, { passive: true });
                    window.addEventListener('scroll', unlock, { passive: true });
                })();

                document.addEventListener('DOMContentLoaded', () => {

                    const interactiveSelector = 'a, button, .hamburger, .close-menu, .mobile-menu a, .skill-logo-btn, .tech-float-card, .project-card, .cert-card, .glass-card, .testimonial-deck-card, .sphere-card-node, [data-tech]';

                    let currentHoveredContainer = null;

                    document.addEventListener('mouseover', (e) => {
                        const container = e.target.closest(interactiveSelector);
                        if (container && container !== currentHoveredContainer) {
                            currentHoveredContainer = container;
                            playHoverSound();
                        }
                    });

                    document.addEventListener('mouseout', (e) => {
                        if (!currentHoveredContainer) return;
                        const related = e.relatedTarget;
                        if (!related || !currentHoveredContainer.contains(related)) {
                            currentHoveredContainer = null;
                        }
                    });

                    document.addEventListener('click', (e) => {
                        const target = e.target.closest(interactiveSelector);
                        if (target) {
                            playClickSound();
                        }
                    });
                });

                document.addEventListener('DOMContentLoaded', () => {
                    const allTechElements = document.querySelectorAll('.skill-logo-btn, .tech-float-card, [data-tech]');

                    // Create or select the dynamic floating tooltip
                    let tooltip = document.getElementById('techTooltip');
                    if (!tooltip) {
                        tooltip = document.createElement('div');
                        tooltip.id = 'techTooltip';
                        tooltip.className = 'tech-tooltip';
                        tooltip.innerHTML = `
                            <div class="tech-tooltip-header">
                                <div class="tech-tooltip-icon" id="tooltipIcon"></div>
                                <span class="tech-tooltip-name" id="tooltipName">HTML5</span>
                                <span class="tech-tooltip-badge" id="tooltipTag">WEB STRUCTURE</span>
                            </div>
                            <div class="tech-tooltip-body" id="tooltipDesc">The skeleton of websites — defines text, images, and layout structure.</div>
                        `;
                        document.body.appendChild(tooltip);
                    }

                    const tooltipName = document.getElementById('tooltipName');
                    const tooltipTag = document.getElementById('tooltipTag');
                    const tooltipDesc = document.getElementById('tooltipDesc');
                    const tooltipIcon = document.getElementById('tooltipIcon');

                    const techDescriptions = {
                        'HTML5': { title: 'HTML5', tag: 'WEB STRUCTURE', desc: 'The skeleton of websites — defines the structure of text, images, buttons, and page sections.', icon: 'devicon-html5-plain colored' },
                        'CSS3': { title: 'CSS3', tag: 'WEB STYLING', desc: 'The styling engine — adds colors, custom layouts, fonts, and smooth visual animations to web pages.', icon: 'devicon-css3-plain colored' },
                        'Tailwind': { title: 'Tailwind CSS', tag: 'UI STYLING TOOL', desc: 'A modern utility framework for styling websites quickly without writing long raw CSS files.', icon: 'devicon-tailwindcss-original colored' },
                        'JavaScript': { title: 'JavaScript', tag: 'WEB LOGIC & DOM', desc: 'The brain of the web — powers interactive features, popups, calculations, and live page updates.', icon: 'devicon-javascript-plain colored' },
                        'Bootstrap': { title: 'Bootstrap', tag: 'UI FRAMEWORK', desc: 'A popular ready-made toolkit for building fast, responsive, mobile-friendly website layouts.', icon: 'devicon-bootstrap-plain colored' },
                        'PHP': { title: 'PHP', tag: 'BACKEND ARCHITECTURE', desc: 'A server-side language that connects web pages to databases, manages user accounts, and processes form data.', icon: 'devicon-php-plain colored' },
                        'C#': { title: 'C#', tag: 'SOFTWARE DEVELOPMENT', desc: 'A powerful Microsoft language used to build desktop programs, mobile applications, and enterprise systems.', icon: 'devicon-csharp-plain colored' },
                        'Java': { title: 'Java', tag: 'CROSS-PLATFORM APPS', desc: 'A versatile programming language for building cross-platform desktop applications and Android software.', icon: 'devicon-java-plain colored' },
                        'Node.js': { title: 'Node.js', tag: 'SERVER RUNTIME', desc: 'Allows JavaScript to run on backend servers, handling real-time data, web requests, and APIs.', icon: 'fab fa-node-js' },
                        '.NET MAUI': { title: '.NET MAUI', tag: 'MOBILE & DESKTOP', desc: 'A Microsoft framework for building native Android, iOS, Windows, and Mac apps from a single codebase.', icon: 'devicon-dotnetcore-plain colored' },
                        'ASP.NET': { title: 'ASP.NET', tag: 'ENTERPRISE WEB APIs', desc: 'A Microsoft web engine for building secure, high-performance web applications and backend API services.', icon: 'devicon-dotnetcore-plain colored' },
                        'MySQL': { title: 'MySQL', tag: 'RELATIONAL DATABASE', desc: 'A reliable database system that organizes and stores website data in structured tables.', icon: 'devicon-mysql-plain colored' },
                        'MongoDB': { title: 'MongoDB', tag: 'DOCUMENT DATABASE', desc: 'A flexible NoSQL database that stores data in JSON-like documents instead of traditional tables.', icon: 'devicon-mongodb-plain colored' },
                        'SQLite': { title: 'SQLite', tag: 'EMBEDDED DATABASE', desc: 'A lightweight, zero-configuration database stored directly inside a single file for apps and local software.', icon: 'devicon-sqlite-plain colored' },
                        'Supabase': { title: 'Supabase', tag: 'CLOUD BACKEND', desc: 'A cloud database & authentication platform providing instant database access and real-time data sync.', icon: 'fas fa-database' },
                        'VS': { title: 'Visual Studio', tag: 'ENTERPRISE IDE', desc: 'A full-featured Microsoft development environment for C#, .NET, desktop programs, and mobile projects.', icon: 'devicon-visualstudio-plain colored' },
                        'VS Code': { title: 'VS Code', tag: 'CODE EDITOR', desc: 'A fast, lightweight code editor used for writing, testing, and debugging web and software code.', icon: 'devicon-vscode-plain colored' },
                        'Cursor': { title: 'Cursor Editor', tag: 'AI CODE EDITOR', desc: 'An AI-powered code editor that helps write, auto-complete, and refactor code intelligently.', icon: 'fas fa-code' },
                        'Devin': { title: 'Devin', tag: 'AI ENGINEERING SUITE', desc: 'An autonomous AI tool that automates complex software engineering tasks and coding workflows.', icon: 'fas fa-robot' },
                        'Android Studio': { title: 'Android Studio', tag: 'MOBILE APP IDE', desc: 'The official editor and emulator suite for designing, building, and testing native Android apps.', icon: 'devicon-androidstudio-plain colored' },
                        'NetBeans': { title: 'NetBeans', tag: 'JAVA DEVELOPMENT', desc: 'An integrated development environment specially designed for writing and building Java software.', icon: 'devicon-netbeans-plain colored' },
                        'Ubuntu': { title: 'Ubuntu Linux', tag: 'OPERATING SYSTEM', desc: 'A popular open-source Linux OS used for running cloud servers, web applications, and scripts.', icon: 'devicon-ubuntu-plain colored' },
                        'Windows 11': { title: 'Windows 11', tag: 'WORKSTATION OS', desc: 'Microsoft operating system used for daily software development, code compilation, and productivity.', icon: 'devicon-windows8-original colored' },
                        'Zorin OS': { title: 'Zorin OS', tag: 'LINUX WORKSTATION', desc: 'A fast, user-friendly Linux distribution optimized for web hosting tools and terminal workflows.', icon: 'fas fa-desktop' },
                        'Git': { title: 'Git', tag: 'VERSION CONTROL', desc: 'A tool that records every code change, letting developers safely test features and undo mistakes.', icon: 'devicon-git-plain colored' },
                        'GitHub': { title: 'GitHub', tag: 'CODE HOSTING', desc: 'A cloud platform for storing project code, sharing open-source work, and collaborating with developers.', icon: 'devicon-github-original colored' },
                        'Vercel': { title: 'Vercel', tag: 'WEB HOSTING', desc: 'A cloud platform for deploying fast, automatic web applications with global edge server hosting.', icon: 'fas fa-bolt' },
                        'AWS': { title: 'Amazon Web Services', tag: 'CLOUD INFRASTRUCTURE', desc: 'Amazon cloud platform for hosting scalable web applications, databases, and server networks.', icon: 'fab fa-aws' },
                        'Netlify': { title: 'Netlify', tag: 'WEB HOSTING', desc: 'An automated cloud host for publishing modern static websites and web apps straight from Git.', icon: 'devicon-netlify-plain colored' },
                        'Render': { title: 'Render', tag: 'CLOUD APP HOSTING', desc: 'A unified cloud hosting platform for running backend APIs, web services, and database instances.', icon: 'fas fa-server' },
                        'XAMPP': { title: 'XAMPP', tag: 'LOCAL WEB SERVER', desc: 'A local offline server package with Apache, MySQL, and PHP for testing websites on your computer.', icon: 'fas fa-network-wired' },
                        'InfinityFree': { title: 'InfinityFree', tag: 'WEB HOSTING', desc: 'A free cloud hosting provider for publishing PHP websites and MySQL databases on the web.', icon: 'fas fa-cloud-upload-alt' },
                        'AeonFree': { title: 'AeonFree', tag: 'WEB HOSTING', desc: 'A cloud hosting platform for hosting web applications, PHP scripts, and online databases.', icon: 'fas fa-cloud' }
                    };

                    function getIconContent(el, fallbackIcon) {
                        const wrapper = el.querySelector('.tech-icon-wrapper') || el;
                        const svg = wrapper.querySelector('svg');
                        const i = wrapper.querySelector('i');
                        if (svg) return svg.outerHTML;
                        if (i) return i.outerHTML;
                        if (fallbackIcon) return `<i class="${fallbackIcon}"></i>`;
                        return `<i class="fas fa-code"></i>`;
                    }

                    function positionTooltip(e) {
                        if (!tooltip) return;
                        if (window.innerWidth <= 768) return;

                        const padding = 15;
                        let x = e.clientX;
                        let y = e.clientY - 15;

                        const rect = tooltip.getBoundingClientRect();
                        const tooltipWidth = rect.width || 250;
                        const tooltipHeight = rect.height || 100;

                        if (x - tooltipWidth / 2 < padding) {
                            x = padding + tooltipWidth / 2;
                        } else if (x + tooltipWidth / 2 > window.innerWidth - padding) {
                            x = window.innerWidth - padding - tooltipWidth / 2;
                        }

                        if (y - tooltipHeight < padding + 20) {
                            y = e.clientY + 35;
                        }

                        tooltip.style.left = `${x}px`;
                        tooltip.style.top = `${y}px`;
                    }

                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('.skill-logo-btn, .tech-float-card, [data-tech], #techTooltip')) {
                            if (tooltip) tooltip.classList.remove('visible');
                        }
                    });

                    document.addEventListener('touchstart', (e) => {
                        if (!e.target.closest('.skill-logo-btn, .tech-float-card, [data-tech], #techTooltip')) {
                            if (tooltip) tooltip.classList.remove('visible');
                        }
                    }, { passive: true });

                    allTechElements.forEach(el => {
                        const name = el.getAttribute('data-tech') || el.getAttribute('title') || '';
                        if (!name) return;

                        const data = techDescriptions[name] || {
                            title: name,
                            tag: 'TECHNICAL SKILL',
                            desc: 'Experienced in practical software development and production implementation.',
                            icon: 'fas fa-code'
                        };

                        const iconHtml = getIconContent(el, data.icon);

                        const activateTech = (e) => {
                            if (tooltipName && tooltipTag && tooltipDesc && tooltipIcon) {
                                tooltipName.innerText = data.title || name;
                                tooltipTag.innerText = data.tag;
                                tooltipDesc.innerText = data.desc;
                                tooltipIcon.innerHTML = iconHtml;
                            }

                            if (e && e.clientX && e.clientY && window.innerWidth > 768) {
                                positionTooltip(e);
                            }
                            if (tooltip) tooltip.classList.add('visible');
                        };

                        el.addEventListener('mouseenter', (e) => {
                            if (window.innerWidth > 768) {
                                activateTech(e);
                            }
                        });

                        el.addEventListener('mousemove', (e) => {
                            if (window.innerWidth > 768 && tooltip && tooltip.classList.contains('visible')) {
                                positionTooltip(e);
                            }
                        });

                        el.addEventListener('mouseleave', () => {
                            if (window.innerWidth > 768) {
                                if (tooltip) tooltip.classList.remove('visible');
                            }
                        });

                        el.addEventListener('click', (e) => {
                            e.stopPropagation();
                            activateTech(e);
                        });
                    });
                });
                // GLOBAL MARQUEE DRAG SENTINEL (Prevents dragging/swiping from triggering modal clicks)
                let globalMarqueeDragTimestamp = 0;
                let globalMarqueePointerStartX = 0;
                let globalMarqueePointerStartY = 0;
                let globalMarqueeIsPointerDown = false;

                window.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.projects-marquee, .certs-marquee, .project-card, .cert-card')) {
                        globalMarqueeIsPointerDown = true;
                        globalMarqueePointerStartX = e.clientX;
                        globalMarqueePointerStartY = e.clientY;
                    }
                }, true);

                window.addEventListener('mousemove', (e) => {
                    if (globalMarqueeIsPointerDown) {
                        const dist = Math.hypot(e.clientX - globalMarqueePointerStartX, e.clientY - globalMarqueePointerStartY);
                        if (dist > 4) {
                            globalMarqueeDragTimestamp = Date.now();
                        }
                    }
                }, true);

                window.addEventListener('mouseup', (e) => {
                    if (globalMarqueeIsPointerDown) {
                        const dist = Math.hypot(e.clientX - globalMarqueePointerStartX, e.clientY - globalMarqueePointerStartY);
                        if (dist > 4) {
                            globalMarqueeDragTimestamp = Date.now();
                        }
                        globalMarqueeIsPointerDown = false;
                    }
                }, true);

                window.addEventListener('touchstart', (e) => {
                    if (e.touches && e.touches.length > 0 && e.target.closest('.projects-marquee, .certs-marquee, .project-card, .cert-card')) {
                        globalMarqueeIsPointerDown = true;
                        globalMarqueePointerStartX = e.touches[0].clientX;
                        globalMarqueePointerStartY = e.touches[0].clientY;
                    }
                }, { passive: true, capture: true });

                window.addEventListener('touchmove', (e) => {
                    if (globalMarqueeIsPointerDown && e.touches && e.touches.length > 0) {
                        const dist = Math.hypot(e.touches[0].clientX - globalMarqueePointerStartX, e.touches[0].clientY - globalMarqueePointerStartY);
                        if (dist > 4) {
                            globalMarqueeDragTimestamp = Date.now();
                        }
                    }
                }, { passive: true, capture: true });

                window.addEventListener('touchend', (e) => {
                    if (globalMarqueeIsPointerDown) {
                        if (e.changedTouches && e.changedTouches.length > 0) {
                            const dist = Math.hypot(e.changedTouches[0].clientX - globalMarqueePointerStartX, e.changedTouches[0].clientY - globalMarqueePointerStartY);
                            if (dist > 4) {
                                globalMarqueeDragTimestamp = Date.now();
                            }
                        }
                        globalMarqueeIsPointerDown = false;
                    }
                }, { passive: true, capture: true });

                document.addEventListener('DOMContentLoaded', () => {
                    const marquees = document.querySelectorAll('.projects-marquee, .certs-marquee');
                    marquees.forEach(marquee => {
                        const track = marquee.querySelector('.projects-marquee-track, .certs-marquee-track');
                        if (!track) return;
                        const group = track.querySelector('.projects-marquee-group, .certs-marquee-group');
                        if (!group) return;
                        const clone = group.cloneNode(true);
                        clone.setAttribute('aria-hidden', 'true');
                        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
                        clone.querySelectorAll('.reveal').forEach(el => el.classList.remove('reveal'));
                        track.appendChild(clone);
                        const isLTR = marquee.classList.contains('certs-marquee-ltr');
                        const speed = marquee.classList.contains('certs-marquee') ? 0.5 : 0.8;
                        let scrollPos = isLTR ? group.offsetWidth : 0;
                        marquee.scrollLeft = scrollPos;
                        let isInteracting = false;
                        let resumeTimeout = null;
                        let isMouseDown = false;
                        let dragStartX = 0;
                        let scrollStart = 0;
                        let hasDragged = false;
                        let isHovered = false;
                        let lastX = 0;
                        let lastTime = 0;
                        let velocity = 0;
                        let inertiaFrame = null;
                        function wrapScroll() {
                            const maxScroll = group.offsetWidth;
                            if (maxScroll > 0) {
                                if (marquee.scrollLeft >= maxScroll) {
                                    marquee.scrollLeft -= maxScroll;
                                } else if (marquee.scrollLeft <= 0) {
                                    marquee.scrollLeft += maxScroll;
                                }
                            }
                            scrollPos = marquee.scrollLeft;
                        }
                        function step() {
                            if (!isInteracting && !isMouseDown) {
                                const maxScroll = group.offsetWidth;
                                if (isLTR) {
                                    scrollPos -= speed;
                                    if (scrollPos <= 0) scrollPos = maxScroll;
                                } else {
                                    scrollPos += speed;
                                    if (scrollPos >= maxScroll) scrollPos = 0;
                                }
                                marquee.scrollLeft = scrollPos;
                            }
                            requestAnimationFrame(step);
                        }
                        let lastMarqueeScroll = marquee.scrollLeft;
                        marquee.addEventListener('scroll', () => {
                            if ((isInteracting || isMouseDown) && Math.abs(marquee.scrollLeft - lastMarqueeScroll) > 40) {
                                lastMarqueeScroll = marquee.scrollLeft;
                                playSelectionTickSound();
                            }
                        }, { passive: true });
                        requestAnimationFrame(step);
                        function stopInertia() {
                            if (inertiaFrame) {
                                cancelAnimationFrame(inertiaFrame);
                                inertiaFrame = null;
                            }
                        }
                        function startInertia() {
                            stopInertia();
                            if (Math.abs(velocity) < 0.1) {
                                scheduleResumeAutoScroll();
                                return;
                            }
                            let v = velocity;
                            if (v > 75) v = 75;
                            if (v < -75) v = -75;
                            let lastFrameTime = performance.now();
                            function stepInertia() {
                                if (Math.abs(v) > 0.15 && !isMouseDown) {
                                    const now = performance.now();
                                    const deltaFactor = Math.min((now - lastFrameTime) / 16.67, 2);
                                    lastFrameTime = now;
                                    marquee.scrollLeft -= v * deltaFactor;
                                    wrapScroll();
                                    v *= 0.955;
                                    inertiaFrame = requestAnimationFrame(stepInertia);
                                } else {
                                    stopInertia();
                                    scheduleResumeAutoScroll();
                                }
                            }
                            inertiaFrame = requestAnimationFrame(stepInertia);
                        }
                        function scheduleResumeAutoScroll() {
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                            resumeTimeout = setTimeout(() => {
                                if (!isHovered && !isMouseDown && !inertiaFrame) {
                                    isInteracting = false;
                                }
                            }, 1200);
                        }
                        marquee.addEventListener('mouseenter', () => {
                            isHovered = true;
                            isInteracting = true;
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                        });
                        marquee.addEventListener('mouseleave', () => {
                            isHovered = false;
                            if (isMouseDown) return;
                            scheduleResumeAutoScroll();
                        });
                        let touchStartX = 0;
                        let touchStartY = 0;
                        marquee.addEventListener('mousedown', (e) => {
                            if (e.button !== 0) return;
                            stopInertia();
                            isMouseDown = true;
                            hasDragged = false;
                            dragStartX = e.pageX - marquee.offsetLeft;
                            scrollStart = marquee.scrollLeft;
                            lastX = e.pageX;
                            lastTime = performance.now();
                            velocity = 0;
                            isInteracting = true;
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                            marquee.style.cursor = 'grabbing';
                        });
                        window.addEventListener('mousemove', (e) => {
                            if (!isMouseDown) return;
                            const x = e.pageX - marquee.offsetLeft;
                            const walk = (x - dragStartX);
                            if (Math.abs(walk) > 6) hasDragged = true;
                            marquee.scrollLeft = scrollStart - walk;
                            wrapScroll();
                            const now = performance.now();
                            const dt = now - lastTime;
                            if (dt > 0) {
                                const dx = e.pageX - lastX;
                                const frameV = (dx / dt) * 16.67;
                                velocity = velocity * 0.4 + frameV * 0.6;
                            }
                            lastX = e.pageX;
                            lastTime = now;
                        }, true);
                        window.addEventListener('mouseup', () => {
                            if (!isMouseDown) return;
                            isMouseDown = false;
                            marquee.style.cursor = 'grab';
                            startInertia();
                        });
                        marquee.addEventListener('click', (e) => {
                            if (hasDragged) {
                                e.preventDefault();
                                e.stopPropagation();
                                hasDragged = false;
                                return false;
                            }
                        }, true);
                        marquee.addEventListener('touchstart', (e) => {
                            stopInertia();
                            isInteracting = true;
                            hasDragged = false;
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                            lastX = e.touches[0].clientX;
                            touchStartX = e.touches[0].clientX;
                            touchStartY = e.touches[0].clientY;
                            lastTime = performance.now();
                            velocity = 0;
                        }, { passive: true });
                        marquee.addEventListener('touchmove', (e) => {
                            isInteracting = true;
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                            const currentTouchX = e.touches[0].clientX;
                            const currentTouchY = e.touches[0].clientY;
                            if (Math.abs(currentTouchX - touchStartX) > 6 || Math.abs(currentTouchY - touchStartY) > 6) {
                                hasDragged = true;
                            }
                            const now = performance.now();
                            const dt = now - lastTime;
                            if (dt > 0) {
                                const dx = currentTouchX - lastX;
                                const frameV = (dx / dt) * 16.67;
                                velocity = velocity * 0.3 + frameV * 0.7;
                            }
                            lastX = currentTouchX;
                            lastTime = now;
                            wrapScroll();
                        }, { passive: true });
                        marquee.addEventListener('touchend', () => {
                            startInertia();
                        });
                        marquee.addEventListener('scroll', () => {
                            if (isInteracting || isMouseDown) {
                                scrollPos = marquee.scrollLeft;
                            }
                        }, { passive: true });
                        const cards = marquee.querySelectorAll('.project-card, .cert-card, .glass-card');
                        cards.forEach(card => {
                            card.setAttribute('draggable', 'false');
                            card.querySelectorAll('img, a, h3, p, div').forEach(el => el.setAttribute('draggable', 'false'));
                        });
                    });
                });
                document.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                });

                // ==========================================================================
                // PROJECT SUBPAGE MODAL & LIVE INTERACTION ENGINE (ALL PROJECTS)
                // ==========================================================================
                const PROJECT_MODAL_DATA = {
                    infowhiz: {
                        id: 'infowhiz',
                        title: 'InfoWhiz',
                        titleSub: 'AI-Powered Gamified Programming Learning Platform',
                        badges: [
                            { text: 'BEST IN CAPSTONE DEVELOPMENT', class: 'gold', icon: 'fas fa-trophy' },
                            { text: 'BEST IN SYSTEM DEVELOPMENT', class: 'gold', icon: 'fas fa-medal' },
                            { text: 'FLAGSHIP PROJECT', class: 'primary', icon: 'fas fa-star' }
                        ],
                        subtitle: "Rebienald's flagship, double-award winning capstone platform built for STI College Bacoor SHS ICT. Combines 3 interactive game modes, real-time code evaluation, student learning telemetry, and an embedded AI chatbot tutor powered by Google Gemini.",
                        heroImage: 'projectimages/infowhiz.png',
                        heroTags: [
                            { icon: 'fas fa-trophy', text: 'Won Best in Capstone & System Dev (STI College Bacoor)' },
                            { icon: 'fas fa-robot', text: 'Google Gemini API Integration' },
                            { icon: 'fas fa-gamepad', text: '3 Custom Games: CheeseWhiz, CodeDefuse, CodeQuest' }
                        ],
                        apis: [
                            { name: 'Google Gemini 3.1 Flash API', icon: 'fas fa-robot', color: '#60a5fa', desc: 'Embedded AI Programming Tutor (ChatBot.php) with multi-key rotation and hint generation' },
                            { name: 'PHP PDO MySQL API', icon: 'fas fa-database', color: '#38bdf8', desc: 'Secure database abstraction layer connecting remote sql311.hstn.me host' },
                            { name: 'HTML5 Web Audio API', icon: 'fas fa-volume-up', color: '#fbbf24', desc: 'Custom sound synthesizer and background music orchestrator (bgMusic.js)' },
                            { name: 'JavaScript Fetch API', icon: 'fas fa-bolt', color: '#34d399', desc: 'Asynchronous session telemetry and live code execution submission' }
                        ],
                        techStack: [
                            { name: 'PHP 8.0', icon: 'devicon-php-plain colored' },
                            { name: 'MySQL Relational DB', icon: 'devicon-mysql-plain colored' },
                            { name: 'JavaScript ES6+', icon: 'devicon-javascript-plain colored' },
                            { name: 'vlucas/phpdotenv', icon: 'fas fa-shield-alt', color: '#a78bfa' },
                            { name: 'PressStart2P Pixel Font', icon: 'fas fa-font', color: '#f472b6' },
                            { name: 'HTML5 Canvas 2D', icon: 'devicon-html5-plain colored' },
                            { name: 'CSS3 Glassmorphism', icon: 'devicon-css3-plain colored' },
                            { name: 'Bootstrap UI Framework', icon: 'devicon-bootstrap-plain colored' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-gamepad',
                                title: '3 Interactive Programming Game Engines',
                                desc: 'Engineered three distinct game mechanics: <strong>CheeseWhiz</strong> (algorithmic pathfinding maze with Jerry mascot), <strong>CodeDefuse</strong> (timed syntax error debugger with live validation), and <strong>CodeQuest</strong> (virtual client job simulation with real deliverables).'
                            },
                            {
                                icon: 'fas fa-laptop-code',
                                title: 'In-Browser IDE & Code Execution Parser',
                                desc: 'Built-in real-time code editor (<code>IDE.php</code>, <code>IDE.JS</code>) with syntax highlighting, input evaluation, and live execution output terminal for hands-on practice.'
                            },
                            {
                                icon: 'fas fa-chart-line',
                                title: 'Student Learning Telemetry & Time Tracking',
                                desc: 'Custom background session recorder (<code>track_time.php</code>) measuring active coding durations, error frequencies, and lesson progression stored into MySQL.'
                            },
                            {
                                icon: 'fas fa-user-shield',
                                title: 'Admin & Module Management Dashboard',
                                desc: 'Administrative suite (<code>AdminPage.php</code>, <code>admin_handler.php</code>) allowing instructors to manage student accounts, inspect analytics, and configure coding modules.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-puzzle-piece',
                                title: 'Pedagogical Gamified Learning Loop',
                                desc: 'Breaks complex coding topics (variables, loops, conditional branching, functions) into interactive puzzle levels with points, achievements, and unlockable stages.'
                            },
                            {
                                icon: 'fas fa-comments',
                                title: 'AI-Powered Programming Study Chatbot',
                                desc: 'Embedded Gemini-powered tutor (<code>ChatBot.php</code>) offering contextual hints, syntax clarifications, and debugging assistance without giving away direct answers.'
                            },
                            {
                                icon: 'fas fa-users-cog',
                                title: 'Role-Based Authentication & Leaderboards',
                                desc: 'Session-secured authentication with student profiles, personal progress monitors (<code>ProgressPage.php</code>), and competitive class rankings.'
                            },
                            {
                                icon: 'fas fa-music',
                                title: 'Immersive Audio & Character Sprites',
                                desc: 'Dynamic sound tracks (<code>CheeseWhiz.mp3</code>, <code>CodeDefuse.mp3</code>, <code>CodeQuest.mp3</code>), animated mascot sprites, and responsive UI effects.'
                            }
                        ],
                        liveUrl: 'https://infowhiz.hstn.me/Pages/index',
                        liveBtnText: 'View Live Project',
                        isPrivate: false
                    },

                    samai: {
                        id: 'samai',
                        title: 'SamAI',
                        titleSub: 'Smart Academic Mentor & AI Study Companion',
                        badges: [
                            { text: 'FLAGSHIP AI SYSTEM', class: 'primary', icon: 'fas fa-crown' },
                            { text: 'JULY 2026', class: 'secondary', icon: 'fas fa-calendar-alt' },
                            { text: 'PRIVATE ARCHITECTURE', class: 'private', icon: 'fas fa-lock' }
                        ],
                        subtitle: 'A full-stack, heading-aware RAG learning assistant engineered by Rebienald Carpio. Features dual-LLM failover (Gemini + Groq LLaMA-3), 4-tier PDF extraction with Tesseract OCR fallback, zero-latency SQLite caching, and a cheerful Hello Kitty study companion dashboard.',
                        heroImage: 'projectimages/samai.png',
                        heroTags: [
                            { icon: 'fas fa-microchip', text: 'Dual LLM: Gemini + Groq (LLaMA-3.3)' },
                            { icon: 'fas fa-database', text: 'Embedded SQLite Zero-Latency Vector Caching' },
                            { icon: 'fas fa-heart', text: 'Hello Kitty Student UX & Companion Theme' }
                        ],
                        apis: [
                            { name: 'Google Gemini 3.5 Flash API', icon: 'fas fa-robot', color: '#60a5fa', desc: 'Primary LLM inference endpoint (generativelanguage.googleapis.com) with automated key rotation' },
                            { name: 'Groq Cloud REST API (LLaMA-3.3-70B)', icon: 'fas fa-bolt', color: '#f59e0b', desc: 'Ultra-fast fallback LLM inference endpoint (api.groq.com/openai/v1/chat/completions)' },
                            { name: 'Tesseract OCR Engine API', icon: 'fas fa-eye', color: '#ec4899', desc: 'Optical character recognition (thiagoalessio/tesseract_ocr) for scanned slide text' },
                            { name: 'Mozilla PDF.js Extraction API', icon: 'fas fa-file-pdf', color: '#ef4444', desc: 'Client-side PDF canvas rendering and stream extraction' },
                            { name: 'PHP PDO SQLite API', icon: 'fas fa-database', color: '#38bdf8', desc: 'Zero-latency local database storage for chunks, summaries, and quizzes' }
                        ],
                        techStack: [
                            { name: 'PHP 8.0+ (PSR-4)', icon: 'devicon-php-plain colored' },
                            { name: 'SQLite 3 (PDO)', icon: 'devicon-sqlite-plain colored' },
                            { name: 'Smalot PDFParser', icon: 'fas fa-file-alt', color: '#f87171' },
                            { name: 'Setasign FPDI & TCPDF', icon: 'fas fa-file-invoice', color: '#fb923c' },
                            { name: 'Ghostscript & pdftotext', icon: 'fas fa-terminal', color: '#10b981' },
                            { name: 'vlucas/phpdotenv', icon: 'fas fa-shield-alt', color: '#a78bfa' },
                            { name: 'JavaScript ES6+ (NDJSON Stream)', icon: 'devicon-javascript-plain colored' },
                            { name: 'CSS3 Glassmorphism', icon: 'devicon-css3-plain colored' }
                        ],
                        gallery: [
                            {
                                img: 'SamAI_Images/samai-preview-1.png',
                                tag: 'STUDY BUDDY CHAT',
                                title: 'Real-time AI Chat & Context Q&A',
                                caption: 'SamAI Live Workspace — Interactive Study Buddy & Real-time Context-Aware Q&A'
                            },
                            {
                                img: 'SamAI_Images/samai-preview-2.png',
                                tag: 'RAG SUMMARIZER',
                                title: 'Smart Multi-Level Summary Engine',
                                caption: 'SamAI Live Workspace — Multi-Level Document Summarization & Handout Reader'
                            },
                            {
                                img: 'SamAI_Images/samai-preview-3.png',
                                tag: 'ASSESSMENT SYSTEM',
                                title: 'Automated Quiz & Flashcard Engine',
                                caption: 'SamAI Live Workspace — Automated Quiz Generator & Knowledge Assessment'
                            },
                            {
                                img: 'SamAI_Images/samai-preview-4.png',
                                tag: 'STUDENT DASHBOARD',
                                title: 'Hello Kitty Companion & Library',
                                caption: 'SamAI Live Workspace — Hello Kitty Companion Theme & Handout Library'
                            }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-brain',
                                title: 'Dual-LLM Failover & Key Rotation Engine',
                                desc: 'Integrates primary <strong>Google Gemini API</strong> with automated real-time fallback to <strong>Groq Cloud (LLaMA-3.3-70B)</strong>. Maintains an active key cooldown manager (<code>key_cooldowns.json</code>) to seamlessly overcome strict rate limits and guarantee continuous student uptime.'
                            },
                            {
                                icon: 'fas fa-file-pdf',
                                title: '4-Tier Robust Document Extraction Pipeline',
                                desc: 'Combines client-side <strong>PDF.js</strong>, server-side <strong>Smalot PDFParser</strong> with encryption bypass, native Linux <strong>pdftotext</strong>, and <strong>Tesseract OCR</strong> to accurately extract text from academic syllabi, encrypted slides, and scanned images.'
                            },
                            {
                                icon: 'fas fa-stream',
                                title: 'Recursive Heading-Aware RAG Pipeline',
                                desc: 'Custom <code>PDFChunker.php</code> partitions large academic documents by semantic headings. <code>SearchService.php</code> scores chunks with token BM25 indexing, injecting relevant excerpts into <code>PromptBuilder.php</code> to ground answers in course materials and eliminate hallucinations.'
                            },
                            {
                                icon: 'fas fa-database',
                                title: 'Embedded SQLite Zero-Latency Caching',
                                desc: 'Zero-latency local database (<code>samai.sqlite</code> via PHP PDO) caches parsed text chunks, multi-level study summaries, and generated quiz questions indexed by MD5 file hashes for instant subsequent loads without re-hitting external AI APIs.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-compress-alt',
                                title: 'Multi-Level Smart Summarization',
                                desc: 'Offers <em>Brief (quick cramming)</em>, <em>Moderate (core conceptual takeaways)</em>, and <em>In-Depth (comprehensive chapter breakdown)</em> summarization modes tailored to student study needs.'
                            },
                            {
                                icon: 'fas fa-spell-check',
                                title: 'Automated Quiz & Assessment Generator',
                                desc: 'Dynamically synthesizes Multiple Choice, True/False, and Identification quizzes from handout text, with instant grading, scoring metrics, and detailed answer explanations.'
                            },
                            {
                                icon: 'fas fa-comments',
                                title: 'Context-Anchored AI Study Buddy Chat',
                                desc: 'Real-time conversational tutor grounded strictly in uploaded PDF handouts, providing exact source citations and conceptual clarifications.'
                            },
                            {
                                icon: 'fas fa-heart',
                                title: 'Hello Kitty Companion Theme & Student UX',
                                desc: 'Cheerful, motivating user interface with study timers, animated motivational quotes (<code>quotes.json</code>), responsive audio feedback, and streamlined handout library management.'
                            },
                            {
                                icon: 'fas fa-broom',
                                title: 'Automated 30-Day Storage Maintenance',
                                desc: 'Integrated rolling cleanup sentinel that purges expired temporary PDF storage and associated SQLite records to prevent server bloat.'
                            }
                        ],
                        liveUrl: 'contacts/contact.html',
                        liveBtnText: 'Inquire About SamAI',
                        isPrivate: true
                    },

                    portping: {
                        id: 'portping',
                        title: 'PortPing',
                        titleSub: 'Automated Cloud Database Keep-Alive Sentinel',
                        badges: [
                            { text: 'DEVOPS & CLOUD AUTOMATION', class: 'green', icon: 'fas fa-server' },
                            { text: '100% UPTIME SENTINEL', class: 'primary', icon: 'fas fa-shield-alt' },
                            { text: 'OPEN SOURCE', class: 'secondary', icon: 'fas fa-code-branch' }
                        ],
                        subtitle: 'A high-reliability automated keep-alive daemon built with Node.js and GitHub Actions. PortPing performs automated cron health-checks against Supabase PostgreSQL databases via PostgREST to prevent inactivity auto-pausing and ensure 100% uptime for portfolio data services.',
                        heroImage: 'projectimages/NASIO.png',
                        heroTags: [
                            { icon: 'fas fa-bolt', text: 'Automated GitHub Actions Cron Sentinel' },
                            { icon: 'fas fa-database', text: 'Supabase PostgreSQL Auto-Pause Prevention' },
                            { icon: 'fas fa-terminal', text: 'Cyberpunk Server Console Telemetry' }
                        ],
                        apis: [
                            { name: 'Supabase PostgREST API', icon: 'fas fa-plug', color: '#38bdf8', desc: 'HTTPS REST endpoint (/rest/v1/comments?select=id&limit=1) executing authenticated database I/O' },
                            { name: 'GitHub Actions CI/CD REST API', icon: 'devicon-github-original', color: '#ffffff', desc: 'Scheduled cron execution trigger and automated git commit sync' },
                            { name: 'Node.js Fetch API', icon: 'fas fa-bolt', color: '#34d399', desc: 'Native global fetch request handler with timeout and exponential backoff retry logic' }
                        ],
                        techStack: [
                            { name: 'Node.js 18+ (ESM)', icon: 'devicon-nodejs-plain colored' },
                            { name: 'GitHub Actions CI/CD', icon: 'devicon-github-original' },
                            { name: 'Supabase (PostgreSQL)', icon: 'devicon-postgresql-plain colored' },
                            { name: 'JavaScript ES6+', icon: 'devicon-javascript-plain colored' },
                            { name: 'JetBrains Mono Typography', icon: 'fas fa-font', color: '#f59e0b' },
                            { name: 'JSON Audit DB (pings.json)', icon: 'fas fa-file-code', color: '#a78bfa' },
                            { name: 'HTML5 & CSS3 Terminal UI', icon: 'devicon-html5-plain colored' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-clock',
                                title: 'Automated GitHub Actions Cron Scheduler',
                                desc: 'Headless CI/CD automation running on scheduled workflows (<code>.github/workflows/main.yml</code>), triggering automated database keep-alive pings without paid hosting costs.'
                            },
                            {
                                icon: 'fas fa-network-wired',
                                title: 'Zero-Latency PostgREST Query Engine',
                                desc: 'Lightweight Node.js daemon (<code>ping.js</code>) executing authenticated REST queries against Supabase endpoints with status evaluation, retry backoffs, and latency benchmarking.'
                            },
                            {
                                icon: 'fas fa-chart-bar',
                                title: 'Live Server Telemetry Dashboard',
                                desc: 'Cyberpunk-themed web console (<code>index.html</code>) displaying millisecond latency distribution charts, 24-hour countdown timers, and service health status from <code>pings.json</code>.'
                            },
                            {
                                icon: 'fas fa-sync-alt',
                                title: 'Automated Git Rebase & Push Sync',
                                desc: 'Automated <code>github-actions[bot]</code> commit pipeline recording every ping attempt to repository JSON logs with rebase handling to guarantee audit accuracy.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-shield-alt',
                                title: 'Eliminates Free-Tier Database Dormancy',
                                desc: 'Keeps cloud databases continuously warm, preventing Supabase from pausing projects after 7 days of inactivity so the Portfolio Guestbook is always instant.'
                            },
                            {
                                icon: 'fas fa-terminal',
                                title: 'CLI Controller & Multi-Mode Flags',
                                desc: 'Supports single-shot execution (<code>node ping.js</code>), continuous local loop mode (<code>--loop</code>), and forced immediate execution (<code>--force</code>).'
                            },
                            {
                                icon: 'fas fa-history',
                                title: 'Historical Latency Audit Log',
                                desc: 'Preserves the last 1,000 ping records with precise UTC timestamps, HTTP response codes, and round-trip execution durations.'
                            },
                            {
                                icon: 'fas fa-feather',
                                title: 'Ultra-Lightweight Zero-Dependency Daemon',
                                desc: 'Built purely on native Node.js core modules (<code>node:timers/promises</code>, <code>node:fs</code>, <code>node:child_process</code>) for instantaneous execution.'
                            }
                        ],
                        liveUrl: 'https://rebienalddev.github.io/PortPing/',
                        liveBtnText: 'View Live Sentinel Dashboard',
                        isPrivate: false
                    },

                    printportal: {
                        id: 'printportal',
                        title: 'Print Portal',
                        titleSub: 'Web-Based Campus Printing & Queue Management System',
                        badges: [
                            { text: 'FULL-STACK WEB SYSTEM', class: 'primary', icon: 'fas fa-print' },
                            { text: 'CAMPUS UTILITY', class: 'green', icon: 'fas fa-university' },
                            { text: 'PHP & MYSQL', class: 'secondary', icon: 'devicon-php-plain colored' }
                        ],
                        subtitle: 'A full-stack campus printing management system designed to eliminate congested print shop queues. Features automated PDF structure analysis, GD pixel-sampling color detection, dynamic price computation, receipt generation, and real-time public queue tracking.',
                        heroImage: 'projectimages/printportal.png',
                        heroTags: [
                            { icon: 'fas fa-calculator', text: 'Automated Page Counting & Dynamic Costing' },
                            { icon: 'fas fa-palette', text: 'GD Pixel-Sampling Color Detection' },
                            { icon: 'fas fa-list-ol', text: '30s Auto-Refreshing Public Queue Board' }
                        ],
                        apis: [
                            { name: 'Poppler Utilities pdfinfo API', icon: 'fas fa-file-pdf', color: '#ef4444', desc: 'CLI-based PDF metadata parser for instant page count extraction' },
                            { name: 'Ghostscript (gs) & QPDF CLI API', icon: 'fas fa-terminal', color: '#10b981', desc: 'Stream decryption and rasterized page rendering engine' },
                            { name: 'PHP GD Graphics Library API', icon: 'fas fa-image', color: '#f59e0b', desc: 'Color pixel percentage sampling (>3% threshold) and PNG receipt generation (receipt.php)' },
                            { name: 'Mozilla PDF.js API', icon: 'fas fa-file-alt', color: '#38bdf8', desc: 'Client-side PDF canvas preview and instant page pre-scan' },
                            { name: 'PHP MySQLi / PDO Database API', icon: 'fas fa-database', color: '#a78bfa', desc: 'Relational database persistence for print jobs, pricing, and receipts' }
                        ],
                        techStack: [
                            { name: 'PHP 8.0', icon: 'devicon-php-plain colored' },
                            { name: 'MySQL Relational DB', icon: 'devicon-mysql-plain colored' },
                            { name: 'PHP GD Library', icon: 'fas fa-palette', color: '#f59e0b' },
                            { name: 'Poppler Utilities & Ghostscript', icon: 'fas fa-terminal', color: '#10b981' },
                            { name: 'JavaScript ES6+', icon: 'devicon-javascript-plain colored' },
                            { name: 'HTML5 & CSS3 Glassmorphism', icon: 'devicon-css3-plain colored' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-file-upload',
                                title: 'Multi-Engine PDF Analysis Pipeline',
                                desc: 'Multi-stage fallback page counter combining <code>pdfinfo</code> (poppler-utils), <code>qpdf</code>, <code>Ghostscript</code>, and regex stream structure parsing to reliably read complex multi-page documents.'
                            },
                            {
                                icon: 'fas fa-palette',
                                title: 'Pixel-Sampling Color Detection Engine',
                                desc: 'Server-side GD graphics analyzer inspecting rendered page rasterizations with a <code>> 3%</code> color pixel threshold to accurately distinguish color pages from monochrome text.'
                            },
                            {
                                icon: 'fas fa-calculator',
                                title: 'Dynamic Algorithmic Price Computation',
                                desc: 'Automatic pricing engine calculating precise print costs: <code>(B&W pages × ₱3.00 + Color pages × ₱5.00) × Copies</code>, factoring in paper sizes (Letter, A4, Legal) and binding options.'
                            },
                            {
                                icon: 'fas fa-tasks',
                                title: '5-Stage Order Lifecycle Pipeline',
                                desc: 'State machine managing jobs through <em>Pending &rarr; Verified &rarr; Printing &rarr; Ready for Pickup &rarr; Completed</em> with downloadable receipts (<code>receipt.php</code>).'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-laptop',
                                title: 'Remote Student Order Submission',
                                desc: 'Allows students to configure print settings, upload documents, and submit payment verification slips from mobile or desktop before arriving at the print shop.'
                            },
                            {
                                icon: 'fas fa-desktop',
                                title: 'Password-Protected Admin Portal',
                                desc: 'Staff dashboard (<code>admin.php</code>) providing print job queues, source document downloads, order status controls, and sales summary ledgers.'
                            },
                            {
                                icon: 'fas fa-clock',
                                title: '30-Second Auto-Refreshing Public Queue',
                                desc: 'Public order display board (<code>queue.php</code>) updating in real-time to show queue positions and estimated completion times.'
                            },
                            {
                                icon: 'fas fa-broom',
                                title: 'Automated 7-Day Storage Cleanup',
                                desc: 'Integrated background sentinel purging temporary uploaded documents and payment verification slips after 7 days to maintain server efficiency.'
                            }
                        ],
                        liveUrl: 'https://printportal.hstn.me/',
                        liveBtnText: 'View Live Print Portal',
                        isPrivate: false
                    },

                    technophotobooth: {
                        id: 'technophotobooth',
                        title: 'TechnoBytes Photobooth',
                        titleSub: 'Event Camera Capture & Custom Frame Printing System',
                        badges: [
                            { text: 'EVENT APPLICATION', class: 'primary', icon: 'fas fa-camera-retro' },
                            { text: 'STI FOUNDATION WEEK', class: 'gold', icon: 'fas fa-calendar-check' },
                            { text: 'WEBRTC & CANVAS', class: 'green', icon: 'fas fa-layer-group' }
                        ],
                        subtitle: 'A custom web photobooth system developed for the TechnoBytes organization during STI College Bacoor Foundation Week. Features real-time WebRTC camera capture, audio-synchronized countdown sequences, custom event frame compositing, and instant thermal strip photo printing.',
                        heroImage: 'projectimages/photobooth1.png',
                        heroTags: [
                            { icon: 'fas fa-video', text: 'Zero-Latency WebRTC Camera Streaming' },
                            { icon: 'fas fa-layer-group', text: 'HTML5 Canvas Frame & Sticker Compositor' },
                            { icon: 'fas fa-print', text: 'Direct Thermal Print Strip Formatting' }
                        ],
                        apis: [
                            { name: 'WebRTC MediaDevices API', icon: 'fas fa-video', color: '#38bdf8', desc: 'HTML5 navigator.mediaDevices.getUserMedia camera feed capture with mirror mode' },
                            { name: 'HTML5 Canvas 2D Context API', icon: 'fas fa-paint-brush', color: '#f59e0b', desc: 'Real-time multi-layer frame overlay blending, sticker composition, and PNG strip rendering' },
                            { name: 'HTML5 Web Audio API', icon: 'fas fa-volume-up', color: '#fbbf24', desc: 'Synthesized countdown beeps, shutter release audio, and visual screen flash triggers' },
                            { name: 'CSS Print Media API', icon: 'fas fa-print', color: '#a855f7', desc: 'Formatted @media print style rules for instant 2x6 dual photostrip and 4x6 printouts' }
                        ],
                        techStack: [
                            { name: 'JavaScript ES6+', icon: 'devicon-javascript-plain colored' },
                            { name: 'WebRTC MediaStream', icon: 'fas fa-video', color: '#38bdf8' },
                            { name: 'HTML5 Canvas 2D', icon: 'devicon-html5-plain colored' },
                            { name: 'Web Audio API', icon: 'fas fa-volume-up', color: '#fbbf24' },
                            { name: 'CSS3 Micro-Animations', icon: 'devicon-css3-plain colored' },
                            { name: 'Direct Print Media CSS', icon: 'fas fa-print', color: '#a855f7' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-video',
                                title: 'WebRTC Zero-Latency Live Camera Streamer',
                                desc: 'Connects directly to connected USB webcams and DSLR capture cards via <code>navigator.mediaDevices.getUserMedia</code> with live mirrored preview and auto-exposure.'
                            },
                            {
                                icon: 'fas fa-stopwatch',
                                title: 'Synchronized 3-Shot Burst Sequencer',
                                desc: 'Visual and audio-cued countdown timer capturing multi-shot photos at timed intervals without interrupting the live video stream.'
                            },
                            {
                                icon: 'fas fa-object-group',
                                title: 'Client-Side Canvas Compositor Engine',
                                desc: 'Composites high-resolution STI Foundation Week graphics, organization watermarks, timestamps, and decorative borders onto captured photos.'
                            },
                            {
                                icon: 'fas fa-print',
                                title: 'Instant Layout & Direct Print Driver',
                                desc: 'Formats composite photos into standardized 2x6 dual-strip or 4x6 grid dimensions optimized for event dye-sublimation and thermal printers.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-store-alt',
                                title: 'Campus Event Kiosk Architecture',
                                desc: 'Engineered for high-volume foot traffic during STI Foundation Week, delivering rapid photo turnarounds for hundreds of students.'
                            },
                            {
                                icon: 'fas fa-palette',
                                title: 'Themed Frame & Overlay Selector',
                                desc: 'Students choose between diverse event frame borders, organization badges, and color themes before initiating the photo capture sequence.'
                            },
                            {
                                icon: 'fas fa-volume-up',
                                title: 'Tactile Audio & Screen Flash Feedback',
                                desc: 'Beeping countdown audio, authentic shutter click sound effects, and full-screen flash animations create a fun commercial photobooth feel.'
                            },
                            {
                                icon: 'fas fa-download',
                                title: 'Dual Output: Physical Print & Digital PNG',
                                desc: 'Sends formatted strips directly to connected print dialogs while providing immediate high-resolution PNG downloads for social media sharing.'
                            }
                        ],
                        liveUrl: 'https://rebienalddev.github.io/TechnoPhotobooth/',
                        liveBtnText: 'View Live Photobooth',
                        isPrivate: false
                    },

                    cupofstory: {
                        id: 'cupofstory',
                        title: 'Cup Of Story',
                        titleSub: 'Full-Stack Cafe Ordering & Kitchen Operations System',
                        badges: [
                            { text: 'FULL-STACK WEB SYSTEM', class: 'primary', icon: 'fas fa-mug-hot' },
                            { text: '3-TIER ROLE WORKFLOW', class: 'secondary', icon: 'fas fa-user-shield' },
                            { text: 'PHP & MYSQL PDO', class: 'green', icon: 'fas fa-database' }
                        ],
                        subtitle: 'A full-stack cafe ordering, kitchen fulfillment, and business management system engineered for specialty coffee houses. Features a customer self-ordering POS with live order tracking, a real-time barista kitchen display system (KDS) with drink preparation workflows and refund handling, and an owner administration dashboard with product catalog controls and sales analytics.',
                        heroImage: 'projectimages/cupofstory.png',
                        heroTags: [
                            { icon: 'fas fa-coffee', text: 'Customer POS & Live Order Lifecycle' },
                            { icon: 'fas fa-clipboard-check', text: 'Real-Time Barista KDS & Refund Workflow' },
                            { icon: 'fas fa-chart-line', text: 'Owner Product Catalog & Period Analytics' }
                        ],
                        apis: [
                            { name: 'Device Fingerprint & Storage API', icon: 'fas fa-id-badge', color: '#60a5fa', desc: 'Hardware fingerprinting and client-side session state for continuous order recovery and polling' },
                            { name: 'HTML2Canvas Rendering Engine', icon: 'fas fa-receipt', color: '#f59e0b', desc: 'Client-side thermal receipt image generation and instant customer download' },
                            { name: 'PHP PDO Transactional Engine', icon: 'fas fa-database', color: '#34d399', desc: 'ACID-compliant order submission, state transitions, and audit-safe database transactions' }
                        ],
                        techStack: [
                            { name: 'PHP 8 (PDO)', icon: 'devicon-php-plain colored' },
                            { name: 'MySQL / MariaDB', icon: 'devicon-mysql-plain colored' },
                            { name: 'JavaScript ES6+', icon: 'devicon-javascript-plain colored' },
                            { name: 'Minimalist Paper UI (CSS3)', icon: 'devicon-css3-plain colored' },
                            { name: 'CSS Grid & Flexbox', icon: 'fas fa-th-large', color: '#38bdf8' },
                            { name: 'Responsive Web Design', icon: 'fas fa-mobile-alt', color: '#a78bfa' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-cash-register',
                                title: 'Customer Self-Ordering POS Interface',
                                desc: 'Dynamic cafe menu with category filtering (Espresso, Brewed, Iced, Bakery), tray calculation with taxes, counter pickup checkout, and live order polling (Pending, Brewing, Completed, Received, Refunded).'
                            },
                            {
                                icon: 'fas fa-utensils',
                                title: 'Barista Live Kitchen Display System (KDS)',
                                desc: 'Real-time order queue with status progression, recipe checklist verification for barista drink assembly, customer refund request approvals, and order completion clearance.'
                            },
                            {
                                icon: 'fas fa-chart-bar',
                                title: 'Owner Administration & Analytics Dashboard',
                                desc: 'Inventory management to add and update products, pricing, and availability toggles, paired with period-based revenue statistics (daily, weekly, monthly) and CSV reporting export.'
                            },
                            {
                                icon: 'fas fa-scroll',
                                title: 'Paper Cafe Aesthetic & Anti-Vibe-Coded Design',
                                desc: 'Built strictly around flat paper cafe styling with warm earth tones (#fbf9f5 canvas, #4a332a espresso accents, linen borders) focusing on extreme readability, zero visual clutter, and zero bloated frameworks.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-sync-alt',
                                title: 'End-to-End Order Lifecycle & State Synchronization',
                                desc: 'Seamless, automated polling keeps the customer ticket tracker, kitchen queue, and business dashboard perfectly in sync across every order transition.'
                            },
                            {
                                icon: 'fas fa-undo-alt',
                                title: 'Customer-Initiated Refund Workflow',
                                desc: 'Allows customers to request refunds directly from active order tickets with barista review and automated cart state clearing.'
                            },
                            {
                                icon: 'fas fa-file-invoice-dollar',
                                title: 'Instant Thermal Receipt Export',
                                desc: 'Generates branded digital receipts client-side with ticket numbers, timestamped item breakdown, and instant download via HTML2Canvas.'
                            },
                            {
                                icon: 'fas fa-server',
                                title: 'Hybrid Local & Cloud Database Connectivity',
                                desc: 'Engineered with environment auto-detection supporting local LAMPP development with automatic fallback to live cPanel MySQL clusters.'
                            }
                        ],
                        liveUrl: 'https://cupofstory.hstn.me/cupofcoffee/user/index.php',
                        liveBtnText: 'View Live Web App',
                        isPrivate: false
                    },

                    clubhub: {
                        id: 'clubhub',
                        title: 'Club Hub',
                        titleSub: 'Multi-Organization Student Club Management System',
                        badges: [
                            { text: 'FULL-STACK WEB PLATFORM', class: 'primary', icon: 'fas fa-users' },
                            { text: '3-TIER ROLE-BASED ACCESS', class: 'secondary', icon: 'fas fa-user-shield' },
                            { text: 'CAMPUS UTILITY', class: 'green', icon: 'fas fa-calendar-alt' }
                        ],
                        subtitle: 'A comprehensive multi-organization administration platform built with PHP and MySQL. Streamlines campus extracurriculars with role-based dashboards for Admins, Students, and Parents, dedicated organization hubs, announcement feeds, event calendars, and membership moderation.',
                        heroImage: 'projectimages/clubhub.png',
                        heroTags: [
                            { icon: 'fas fa-user-shield', text: '3-Tier RBAC: Admin, Student, Parent Portals' },
                            { icon: 'fas fa-layer-group', text: '5 Dedicated Academic Club Hubs' },
                            { icon: 'fas fa-database', text: 'MySQL Database with Asia/Manila Time Sync' }
                        ],
                        apis: [
                            { name: 'PHP MySQLi Database API', icon: 'fas fa-database', color: '#38bdf8', desc: 'Direct relational database connection (sql204.infinityfree.com) with Asia/Manila (+08:00) timezone synchronization' },
                            { name: 'RESTful Action Dispatchers API', icon: 'fas fa-exchange-alt', color: '#10b981', desc: 'Modular backend action handlers (actions/add_announcement.php, actions/add_event.php, status/approve_user.php)' },
                            { name: 'PHP Session Security API', icon: 'fas fa-shield-alt', color: '#f59e0b', desc: 'Role-segregated session validation preventing unauthorized access between Admin, Student, and Parent views' }
                        ],
                        techStack: [
                            { name: 'PHP 8.0', icon: 'devicon-php-plain colored' },
                            { name: 'MySQL / MariaDB', icon: 'devicon-mysql-plain colored' },
                            { name: 'JavaScript ES6+', icon: 'devicon-javascript-plain colored' },
                            { name: 'CSS3 Admin UI (admin-style.css)', icon: 'devicon-css3-plain colored' },
                            { name: 'Session RBAC Security', icon: 'fas fa-shield-alt', color: '#10b981' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-user-shield',
                                title: '3-Tier Role-Based Access Control (RBAC)',
                                desc: 'Role-segregated portal dashboards for <strong>Admins</strong> (<code>view/admin.php</code> - user moderation, announcement & event publishing), <strong>Students</strong> (<code>view/student.php</code> - club enrollment & ticketing), and <strong>Parents</strong> (<code>view/parent.php</code> - oversight) with session security.'
                            },
                            {
                                icon: 'fas fa-building',
                                title: '5 Dedicated Academic Club Portals',
                                desc: 'Specialized modular hubs for Journalism (<code>club/journ.php</code>), Mathematics (<code>club/math.php</code>), Science (<code>club/science.php</code>), Sports (<code>club/sports.php</code>), and Teatro (<code>club/teatro.php</code>).'
                            },
                            {
                                icon: 'fas fa-bullhorn',
                                title: 'Announcement & Event CRUD Pipeline',
                                desc: 'Secure action dispatchers (<code>actions/add_announcement.php</code>, <code>actions/add_event.php</code>, <code>actions/delete_announcement.php</code>, <code>actions/delete_event.php</code>) handling campus-wide publications.'
                            },
                            {
                                icon: 'fas fa-user-check',
                                title: 'Membership Moderation & Application Queue',
                                desc: 'Student club application queue with approval/rejection moderation (<code>status/approve_user.php</code>, <code>status/reject_user.php</code>) and member directory tracking.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-comments',
                                title: 'Unified Campus Communication Feed',
                                desc: 'Consolidates official circulars, meeting schedules, and club activity notices into a centralized campus feed.'
                            },
                            {
                                icon: 'fas fa-user-friends',
                                title: 'Parental Transparency & Oversight Portal',
                                desc: 'Allows parents to monitor student club affiliations, event attendance, and official school activity broadcasts.'
                            },
                            {
                                icon: 'fas fa-calendar-check',
                                title: 'Event Scheduling & Attendee Rosters',
                                desc: 'Club officers schedule rehearsals, workshops, and competitions with real-time attendee tracking.'
                            },
                            {
                                icon: 'fas fa-ticket-alt',
                                title: 'Integrated Support & Inquiry Ticketing',
                                desc: 'Direct student inquiry ticketing system (<code>actions/delete_ticket.php</code>) allowing members to request club assistance.'
                            }
                        ],
                        liveUrl: 'https://spi-announcement-hub.free.nf/',
                        liveBtnText: 'View Live Club Hub',
                        isPrivate: false
                    },

                    kaido: {
                        id: 'kaido',
                        title: 'Kaido',
                        titleSub: 'Minimalist Voice Input & Dictation Interface for AI Agents',
                        badges: [
                            { text: 'AI VOICE INTERFACE', class: 'primary', icon: 'fas fa-microphone' },
                            { text: 'LOCAL NEURAL SPEECH', class: 'secondary', icon: 'fas fa-brain' },
                            { text: 'PYTHON & GTK 3', class: 'green', icon: 'fab fa-python' }
                        ],
                        subtitle: 'A high-performance minimalist desktop voice dictation and agent interface. Built with Python, GTK 3, and faster-whisper, Kaido enables low-latency voice commanding, multi-request prompt batching, live screen capture via FreeDesktop ScreenCast portal, real-time LLM token monitoring, and seamless execution dispatch to Antigravity and Linux terminals.',
                        heroImage: 'projectimages/kaido.png',
                        heroTags: [
                            { icon: 'fas fa-microphone-alt', text: 'Local Neural Speech-to-Text & VAD' },
                            { icon: 'fas fa-desktop', text: 'ScreenCast Portal Display Context Integration' },
                            { icon: 'fas fa-chart-pie', text: 'Live Token & Session Usage Gauges' }
                        ],
                        apis: [
                            { name: 'Faster-Whisper Engine', icon: 'fas fa-wave-square', color: '#60a5fa', desc: 'CPU-optimized int8 neural inference delivering fast, accurate local speech transcription' },
                            { name: 'FreeDesktop ScreenCast DBus API', icon: 'fas fa-camera', color: '#f59e0b', desc: 'Secure Wayland and X11 portal integration capturing active screens for multimodal context' },
                            { name: 'Edge TTS Neural Synthesizer', icon: 'fas fa-volume-up', color: '#34d399', desc: 'Natural voice output for AI agent response playback with adjustable speaking rates' }
                        ],
                        techStack: [
                            { name: 'Python 3', icon: 'devicon-python-plain colored' },
                            { name: 'GTK 3 / PyGObject', icon: 'fas fa-window-restore', color: '#3b82f6' },
                            { name: 'faster-whisper', icon: 'fas fa-brain', color: '#10b981' },
                            { name: 'FFmpeg Audio Pipeline', icon: 'fas fa-sliders-h', color: '#ef4444' },
                            { name: 'Edge-TTS & Speech-Dispatcher', icon: 'fas fa-headphones', color: '#8b5cf6' },
                            { name: 'Linux DBus / FreeDesktop Portal', icon: 'fas fa-terminal', color: '#f59e0b' }
                        ],
                        architecture: [
                            {
                                icon: 'fas fa-layer-group',
                                title: 'Dark Floating HUD & Always-On-Top Window',
                                desc: 'Crafted with a sleek dark aesthetic (#0c0c0e canvas, zinc borders, monospace telemetry) designed to stay unobtrusively pinned above developer IDEs and terminals.'
                            },
                            {
                                icon: 'fas fa-microphone',
                                title: 'Dual Workflow: Interactive GUI & Global Shortcut Daemon',
                                desc: 'Includes both a full-featured PyGObject control center and a lightweight global shortcut background daemon (Kaido Toggle) for instant push-to-talk workflows.'
                            },
                            {
                                icon: 'fas fa-tachometer-alt',
                                title: 'Live LLM Session Token Gauges',
                                desc: 'Continuously monitors active Antigravity session transcripts and displays live context token counts, model tier limits, and visual warning bars.'
                            },
                            {
                                icon: 'fas fa-paper-plane',
                                title: 'Direct Antigravity & Terminal Dispatch',
                                desc: 'Automatically routes speech commands and attached screenshot context into active agent sessions, headless worker processes, or system terminals.'
                            }
                        ],
                        features: [
                            {
                                icon: 'fas fa-spell-check',
                                title: 'Phonetic Developer Auto-Correction',
                                desc: 'Equipped with custom regex vocabularies and phonetic replacements to reliably catch developer keywords, git commands, and project nomenclature.'
                            },
                            {
                                icon: 'fas fa-camera-retro',
                                title: 'One-Click Screen Attachment',
                                desc: 'Attaches screen context with a single toggle, allowing users to ask queries about visible code, compiler errors, or designs seamlessly.'
                            },
                            {
                                icon: 'fas fa-forward',
                                title: 'Customizable TTS Speech Rate & Thinking Presets',
                                desc: 'Cycle playback speeds (1x to 3x) and adjust agent thinking levels (Low, Med, High) on the fly with instantaneous visual feedback.'
                            },
                            {
                                icon: 'fab fa-github',
                                title: 'Open Source Codebase',
                                desc: 'Source code publicly available on GitHub with clear documentation and setup instructions for Linux power users.'
                            }
                        ],
                        liveUrl: 'https://github.com/Rebienald/Kaido',
                        liveBtnText: 'View Source Code on GitHub',
                        isPrivate: false
                    }
                };

                document.addEventListener('DOMContentLoaded', () => {
                    const projectModal = document.getElementById('projectModal') || document.getElementById('samaiModal');
                    const contentEl = document.getElementById('projectModalDynamicContent');
                    const closeProjectBtn = document.getElementById('closeProjectModalBtn') || document.getElementById('closeSamaiModalBtn');
                    const closeProjectFooterBtn = document.getElementById('closeProjectModalFooterBtn') || document.getElementById('closeSamaiModalFooterBtn');
                    const liveBtn = document.getElementById('projectModalLiveBtn');
                    const liveBtnText = document.getElementById('projectModalLiveBtnText');
                    const liveBtnIcon = document.getElementById('projectModalLiveBtnIcon');

                    function renderProjectModal(projectId) {
                        const data = PROJECT_MODAL_DATA[projectId] || PROJECT_MODAL_DATA.infowhiz;
                        if (!contentEl) return;

                        // Tech Stack Tags (Clean Minimalist Monospace Tags)
                        const techHtml = (data.techStack || []).map(t => `
                            <span class="proj-min-tech-tag">${t.name}</span>
                        `).join('');

                        // Highlights (Clean Scannable Bullet Points)
                        const highlights = (data.features && data.features.length > 0) ? data.features : (data.architecture || []);
                        const highlightsHtml = highlights.map(f => {
                            const cleanDesc = (f.desc || '').replace(/<\/?(code|em|strong|span|i|div)[^>]*>/gi, '');
                            return `
                                <li class="proj-min-highlight-item">
                                    <span class="proj-min-highlight-bullet">&bull;</span>
                                    <div class="proj-min-highlight-text">
                                        <strong>${f.title}:</strong> <span>${cleanDesc}</span>
                                    </div>
                                </li>
                            `;
                        }).join('');

                        // System Screenshots (if available)
                        let galleryHtml = '';
                        if (data.gallery && data.gallery.length > 0) {
                            const galleryItemsHtml = data.gallery.map(g => `
                                <div class="proj-min-gallery-item" data-full-img="${g.img}" data-caption="${g.caption || g.title}">
                                    <img loading="lazy" src="${g.img}" alt="${g.title}" class="proj-min-gallery-img">
                                    <span class="proj-min-gallery-label">${g.title}</span>
                                </div>
                            `).join('');

                            galleryHtml = `
                                <div class="proj-min-section">
                                    <h4 class="proj-min-section-title">// SYSTEM SCREENSHOTS</h4>
                                    <div class="proj-min-gallery-grid">
                                        ${galleryItemsHtml}
                                    </div>
                                </div>
                            `;
                        }

                        const categoryText = (data.badges && data.badges[0]) ? data.badges[0].text : 'SELECTED WORK';

                        contentEl.innerHTML = `
                            <div class="proj-min-header">
                                <div class="proj-min-meta">
                                    <span class="proj-min-category">// ${categoryText}</span>
                                    ${data.isPrivate ? '<span class="proj-min-private-tag">PRIVATE DEPLOYMENT</span>' : ''}
                                </div>
                                <h2 id="projectModalTitle" class="proj-min-title">${data.title}</h2>
                                <p class="proj-min-desc">${data.subtitle}</p>
                            </div>

                            <div class="proj-min-hero">
                                <img src="${data.heroImage}" alt="${data.title} Interface" class="proj-min-hero-img">
                            </div>

                            <div class="proj-min-body">
                                <div class="proj-min-section">
                                    <h4 class="proj-min-section-title">// KEY CAPABILITIES & IMPACT</h4>
                                    <ul class="proj-min-highlights-list">
                                        ${highlightsHtml}
                                    </ul>
                                </div>

                                <div class="proj-min-section">
                                    <h4 class="proj-min-section-title">// TECHNOLOGIES & TOOLS</h4>
                                    <div class="proj-min-tech-wrap">
                                        ${techHtml}
                                    </div>
                                </div>

                                ${galleryHtml}
                            </div>
                        `;

                        if (liveBtn) {
                            liveBtn.href = data.liveUrl;
                            if (data.isPrivate) {
                                liveBtn.removeAttribute('target');
                                if (liveBtnText) liveBtnText.innerText = data.liveBtnText || 'Inquire About Project';
                                if (liveBtnIcon) liveBtnIcon.className = 'fas fa-arrow-right';
                            } else {
                                liveBtn.setAttribute('target', '_blank');
                                liveBtn.setAttribute('rel', 'noopener noreferrer');
                                if (liveBtnText) liveBtnText.innerText = data.liveBtnText || 'View Live Project';
                                if (liveBtnIcon) liveBtnIcon.className = 'fas fa-arrow-up-right-from-square';
                            }
                        }
                    }

                    window.openProjectModal = function(projectId) {
                        if (!projectModal) return;
                        renderProjectModal(projectId);
                        projectModal.classList.add('active');
                        projectModal.setAttribute('aria-hidden', 'false');
                        document.body.style.overflow = 'hidden';
                        const container = projectModal.querySelector('.samai-modal-container, .project-modal-container');
                        if (container) container.scrollTop = 0;
                        playClickSound();
                    };

                    window.closeProjectModal = function() {
                        if (!projectModal) return;
                        projectModal.classList.remove('active');
                        projectModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                        playClickSound();
                    };

                    // Backwards compatibility alias
                    window.openSamaiModal = () => window.openProjectModal('samai');
                    window.closeSamaiModal = window.closeProjectModal;

                    if (closeProjectBtn) closeProjectBtn.addEventListener('click', window.closeProjectModal);
                    if (closeProjectFooterBtn) closeProjectFooterBtn.addEventListener('click', window.closeProjectModal);

                    if (projectModal) {
                        renderProjectModal('infowhiz');
                        projectModal.addEventListener('click', (e) => {
                            if (e.target === projectModal) window.closeProjectModal();
                        });
                    }

                    // SCREENSHOT FULLSCREEN LIGHTBOX
                    const lightbox = document.getElementById('samaiLightbox');
                    const lightboxImg = document.getElementById('samaiLightboxImg');
                    const lightboxCaption = document.getElementById('samaiLightboxCaption');
                    const closeLightboxBtn = document.getElementById('closeSamaiLightboxBtn');

                    window.openSamaiLightbox = function(src, caption) {
                        if (!lightbox || !lightboxImg) return;
                        lightboxImg.src = src;
                        if (lightboxCaption) lightboxCaption.innerText = caption || '';
                        lightbox.classList.add('active');
                        lightbox.setAttribute('aria-hidden', 'false');
                        playClickSound();
                    };

                    window.closeSamaiLightbox = function() {
                        if (!lightbox) return;
                        lightbox.classList.remove('active');
                        lightbox.setAttribute('aria-hidden', 'true');
                        playClickSound();
                    };

                    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', window.closeSamaiLightbox);

                    if (lightbox) {
                        lightbox.addEventListener('click', (e) => {
                            if (e.target === lightbox || e.target === closeLightboxBtn) {
                                window.closeSamaiLightbox();
                            }
                        });
                    }

                    document.addEventListener('click', (e) => {
                        const galleryItem = e.target.closest('.samai-gallery-item, .proj-min-gallery-item');
                        if (galleryItem) {
                            const fullImg = galleryItem.getAttribute('data-full-img');
                            const caption = galleryItem.getAttribute('data-caption');
                            if (fullImg) {
                                window.openSamaiLightbox(fullImg, caption);
                            }
                        }
                    });

                    window.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            if (lightbox && lightbox.classList.contains('active')) {
                                window.closeSamaiLightbox();
                                return;
                            }
                            if (projectModal && projectModal.classList.contains('active')) {
                                window.closeProjectModal();
                            }
                        }
                    });

                    // PROJECT CARD CLICK INTERCEPTOR (ALL PROJECTS OPEN MODAL SUBPAGE ON DELIBERATE CLICK ONLY)
                    document.addEventListener('click', (e) => {
                        const card = e.target.closest('.project-card');
                        if (!card) return;

                        // If user dragged or swiped the carousel, completely suppress the click event!
                        if (Date.now() - globalMarqueeDragTimestamp < 350) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }

                        e.preventDefault();
                        e.stopPropagation();

                        let projectId = card.getAttribute('data-project-id');
                        if (!projectId) {
                            const href = card.getAttribute('href') || '';
                            const text = card.textContent || '';
                            const privateAttr = card.getAttribute('data-private-project') || '';

                            if (href.includes('samai') || text.includes('SamAI') || privateAttr === 'SamAI') projectId = 'samai';
                            else if (href.includes('infowhiz') || text.includes('InfoWhiz')) projectId = 'infowhiz';
                            else if (href.includes('PortPing') || href.includes('ping') || text.includes('PortPing')) projectId = 'portping';
                            else if (href.includes('printportal') || text.includes('Print Portal')) projectId = 'printportal';
                            else if (href.includes('TechnoPhotobooth') || text.includes('TechnoBytes') || text.includes('Photobooth')) projectId = 'technophotobooth';
                            else if (href.includes('cupofstory') || text.includes('Cup Of Story')) projectId = 'cupofstory';
                            else if (href.includes('club') || text.includes('Club Hub')) projectId = 'clubhub';
                            else if (href.includes('Kaido') || href.includes('kaido') || text.includes('Kaido')) projectId = 'kaido';
                        }

                        if (projectId && window.openProjectModal) {
                            window.openProjectModal(projectId);
                        }
                    }, true);
                });
                function switchEduTab(tabName) {
                    const eduBtn = document.getElementById('tab-education');
                    const engBtn = document.getElementById('tab-engagements');
                    const eduPane = document.getElementById('pane-education');
                    const engPane = document.getElementById('pane-engagements');
                    if (tabName === 'education') {
                        eduBtn.classList.add('active');
                        engBtn.classList.remove('active');
                        eduPane.style.display = 'block';
                        engPane.style.display = 'none';
                    } else {
                        engBtn.classList.add('active');
                        eduBtn.classList.remove('active');
                        engPane.style.display = 'block';
                        eduPane.style.display = 'none';
                    }
                }
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('.nav-links a');
                function activateNavOnScroll() {
                    const scrollY = window.scrollY || window.pageYOffset;
                    sections.forEach(section => {
                        const sectionHeight = section.offsetHeight;
                        const sectionTop = section.offsetTop - 160;
                        const sectionId = section.getAttribute('id');
                        const navItem = document.querySelector('.nav-links a[href*=' + sectionId + ']');
                        if (navItem) {
                            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                                navLinks.forEach(link => link.classList.remove('active'));
                                navItem.classList.add('active');
                            }
                        }
                    });
                    if (scrollY < 200) {
                        navLinks.forEach(link => link.classList.remove('active'));
                    }
                }
                window.addEventListener('scroll', activateNavOnScroll, { passive: true });
                window.addEventListener('load', activateNavOnScroll);
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        navLinks.forEach(l => l.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                // =========================================================
                // CLEAN TIMELINE BRANCH TREE — EDUCATION & MILESTONES
                // Interactive micro-feedback & audio tick triggers
                // =========================================================
                document.addEventListener('DOMContentLoaded', () => {
                    const treeEntities = document.querySelectorAll('.tree-branch-row, .tree-inst-block, .stage-dot');

                    treeEntities.forEach(item => {
                        item.addEventListener('click', () => {
                            if (typeof playSelectionTickSound === 'function') {
                                playSelectionTickSound();
                            }
                        });
                    });
                });

                // STRICT SECTION-BY-SECTION SNAP SWITCHER & FLOATING CONTROLS ENGINE (DESKTOP ONLY / TOGGLEABLE)
                (function() {
                    let isAnimating = false;
                    let currentIndex = 0;
                    
                    const isMobileDevice = () => window.innerWidth <= 768;
                    // Locked section scrolling, with a short response cooldown.
                    let snapEnabled = !isMobileDevice();
                    
                    const toggleBtn = document.getElementById('snapToggleBtn');
                    const muteBtn = document.getElementById('muteToggleBtn');

                    if (isMobileDevice()) {
                        document.documentElement.style.scrollSnapType = 'none';
                    }

                    if (toggleBtn) {
                        const updateSnapUI = () => {
                            const icon = toggleBtn.querySelector('i');
                            if (snapEnabled) {
                                toggleBtn.classList.remove('snap-off');
                                if (icon) icon.className = 'fas fa-lock';
                                toggleBtn.setAttribute('title', 'Snap Scroll: ON (Click for Free Scroll)');
                                toggleBtn.setAttribute('aria-label', 'Snap Scroll is ON');
                                document.documentElement.style.scrollSnapType = 'y mandatory';
                            } else {
                                toggleBtn.classList.add('snap-off');
                                if (icon) icon.className = 'fas fa-unlock';
                                toggleBtn.setAttribute('title', 'Free Scroll: ON (Click for Snap Scroll)');
                                toggleBtn.setAttribute('aria-label', 'Free Scroll is ON');
                                document.documentElement.style.scrollSnapType = 'none';
                            }
                        };

                        toggleBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            snapEnabled = !snapEnabled;
                            updateSnapUI();
                            if (typeof playClickSound === 'function') playClickSound();
                        });

                        updateSnapUI();
                    }

                    if (muteBtn) {
                        muteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const nextMuted = !window.isSoundMuted();
                            window.setSoundMuted(nextMuted);
                            if (!nextMuted && typeof playClickSound === 'function') {
                                playClickSound();
                            }
                        });
                        if (typeof updateMuteButtonUI === 'function') {
                            updateMuteButtonUI();
                        }
                    }

                    const sections = Array.from(document.querySelectorAll('section, .contact-section'));
                    if (sections.length === 0) return;

                    function getActiveIndex() {
                        const scrollPos = window.scrollY + 100;
                        for (let i = sections.length - 1; i >= 0; i--) {
                            if (scrollPos >= sections[i].offsetTop - 200) {
                                return i;
                            }
                        }
                        return 0;
                    }

                    function scrollToSection(index) {
                        if (index < 0 || index >= sections.length) return;
                        isAnimating = true;
                        currentIndex = index;
                        const targetPos = sections[index].offsetTop;
                        
                        window.scrollTo({
                            top: targetPos,
                            behavior: 'smooth'
                        });

                        setTimeout(() => {
                            isAnimating = false;
                        }, 300);
                    }

                    const modalScrollSelector = '#projectModal, .project-modal-container, .project-modal-overlay, #samaiModal, .samai-modal-container, .samai-modal-overlay, #guestbookModal, .guestbook-modal-card, .guestbook-modal-overlay, #samaiLightbox, .samai-lightbox-overlay, #chatMessages, .chatbot-container, .chatbot-window, textarea, input, select';

                    window.addEventListener('wheel', (e) => {
                        if (!snapEnabled || isMobileDevice()) return;
                        if (e.target.closest(modalScrollSelector) || document.querySelector('.project-modal-overlay.active, .samai-modal-overlay.active, .guestbook-modal-overlay.active, .samai-lightbox-overlay.active')) {
                            return;
                        }

                        e.preventDefault();
                        if (isAnimating) return;

                        currentIndex = getActiveIndex();
                        if (e.deltaY > 15) {
                            scrollToSection(currentIndex + 1);
                        } else if (e.deltaY < -15) {
                            scrollToSection(currentIndex - 1);
                        }
                    }, { passive: false });

                    let touchStartY = 0;
                    window.addEventListener('touchstart', (e) => {
                        if (e.touches && e.touches.length > 0) {
                            touchStartY = e.touches[0].clientY;
                        }
                    }, { passive: true });

                    window.addEventListener('touchend', (e) => {
                        if (!snapEnabled || isMobileDevice()) return;
                        if (e.target.closest(modalScrollSelector + ', .certs-marquee, .projects-marquee') || document.querySelector('.project-modal-overlay.active, .samai-modal-overlay.active, .guestbook-modal-overlay.active, .samai-lightbox-overlay.active')) {
                            return;
                        }
                        if (isAnimating || !e.changedTouches || e.changedTouches.length === 0) return;

                        const touchEndY = e.changedTouches[0].clientY;
                        const diffY = touchStartY - touchEndY;

                        if (Math.abs(diffY) > 40) {
                            currentIndex = getActiveIndex();
                            if (diffY > 0) {
                                scrollToSection(currentIndex + 1);
                            } else {
                                scrollToSection(currentIndex - 1);
                            }
                        }
                    }, { passive: true });

                    window.addEventListener('keydown', (e) => {
                        if (!snapEnabled || isMobileDevice()) return;
                        if (e.target.closest('input, textarea, select, .chatbot-window, #chatMessages') ||
                            document.activeElement?.closest('input, textarea, select, .chatbot-window, #chatMessages') ||
                            document.querySelector('.project-modal-overlay.active, .samai-modal-overlay.active, .guestbook-modal-overlay.active, .samai-lightbox-overlay.active')) {
                            return;
                        }
                        if (['ArrowDown', 'PageDown'].includes(e.key)) {
                            e.preventDefault();
                            if (!isAnimating) {
                                currentIndex = getActiveIndex();
                                scrollToSection(currentIndex + 1);
                            }
                        } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
                            e.preventDefault();
                            if (!isAnimating) {
                                currentIndex = getActiveIndex();
                                scrollToSection(currentIndex - 1);
                            }
                        }
                    });

                    document.querySelectorAll('a[href^="#"]').forEach(link => {
                        link.addEventListener('click', (e) => {
                            if (!snapEnabled) return;
                            const targetId = link.getAttribute('href');
                            const targetSection = document.querySelector(targetId);
                            if (targetSection) {
                                const idx = sections.indexOf(targetSection);
                                if (idx !== -1) {
                                    e.preventDefault();
                                    scrollToSection(idx);
                                }
                            }
                        });
                    });
                })();

                const loadingName = document.querySelector('.loading-name');
                const introSplash = document.getElementById('introSplash');

                if (introSplash) {
                    const unlockSplashAudio = () => {
                        initAudioContext();
                    };
                    introSplash.addEventListener('touchstart', unlockSplashAudio, { passive: true });
                    introSplash.addEventListener('pointerdown', unlockSplashAudio, { passive: true });
                    introSplash.addEventListener('click', unlockSplashAudio, { passive: true });
                }

                if (loadingName) {
                    const name = loadingName.dataset.name || '';
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        loadingName.textContent = name;
                    } else {
                        let letterIndex = 0;
                        const typing = setInterval(() => {
                            loadingName.textContent += name.charAt(letterIndex);
                            playTypingSound();
                            letterIndex += 1;
                            if (letterIndex === name.length) clearInterval(typing);
                        }, 65);
                    }
                }

                setTimeout(() => {
                    const introSplash = document.getElementById('introSplash');
                    if (introSplash) {
                        introSplash.classList.add('fade-out');
                        setTimeout(() => {
                            introSplash.style.display = 'none';
                            document.body.style.overflow = '';
                            window.scrollTo(0, 0);
                        }, 800);
                    }
                }, 2200);

                // TESTIMONIAL SPREAD CARD SHUFFLE ENGINE
                (function() {
                    let currentDeckOrder = [0, 1, 2, 3, 4, 5, 6];
                    let isShuffling = false;

                    const cardTransformsDesktop = [
                        { rot: 0, x: 0, y: 0, scale: 1.04, opacity: 1, zIndex: 14 },
                        { rot: 7, x: 180, y: 15, scale: 0.96, opacity: 0.94, zIndex: 12 },
                        { rot: -7, x: -180, y: 15, scale: 0.96, opacity: 0.94, zIndex: 11 },
                        { rot: 13, x: 330, y: 40, scale: 0.90, opacity: 0.84, zIndex: 9 },
                        { rot: -13, x: -330, y: 40, scale: 0.90, opacity: 0.84, zIndex: 8 },
                        { rot: 18, x: 440, y: 65, scale: 0.84, opacity: 0.72, zIndex: 6 },
                        { rot: -18, x: -440, y: 65, scale: 0.84, opacity: 0.72, zIndex: 5 }
                    ];

                    const cardTransformsMobile = [
                        { rot: 0, x: 0, y: 0, scale: 1, opacity: 1, zIndex: 14 },
                        { rot: 3, x: 8, y: 24, scale: 0.96, opacity: 0.92, zIndex: 12 },
                        { rot: -3, x: -8, y: 48, scale: 0.92, opacity: 0.86, zIndex: 10 },
                        { rot: 5, x: 14, y: 72, scale: 0.88, opacity: 0.80, zIndex: 8 },
                        { rot: -5, x: -14, y: 96, scale: 0.84, opacity: 0.74, zIndex: 6 },
                        { rot: 7, x: 20, y: 120, scale: 0.80, opacity: 0.68, zIndex: 4 },
                        { rot: -7, x: -20, y: 144, scale: 0.76, opacity: 0.60, zIndex: 2 }
                    ];

                    function applyDeckTransforms() {
                        const cards = document.querySelectorAll('.testimonial-deck-card');
                        if (!cards.length) return;

                        const isMobile = window.innerWidth <= 768;
                        const transforms = isMobile ? cardTransformsMobile : cardTransformsDesktop;

                        currentDeckOrder.forEach((cardIndex, pos) => {
                            const card = cards[cardIndex];
                            if (!card) return;

                            const t = transforms[pos] || transforms[transforms.length - 1];

                            card.style.zIndex = t.zIndex;
                            card.style.opacity = t.opacity;
                            card.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) rotate(${t.rot}deg) scale(${t.scale})`;
                        });
                    }

                    window.shuffleTestimonialDeck = function() {
                        if (isShuffling) return;
                        isShuffling = true;

                        if (typeof playCardShuffleSound === 'function') {
                            playCardShuffleSound();
                        }

                        const cards = document.querySelectorAll('.testimonial-deck-card');
                        const topCardIndex = currentDeckOrder[0];
                        const topCard = cards[topCardIndex];

                        const isMobile = window.innerWidth <= 768;

                        if (topCard) {
                            topCard.style.transform = isMobile 
                                ? `translate3d(0, -75px, 0) scale(1.04)`
                                : `translate3d(0, -140px, 0) rotate(-18deg) scale(1.1)`;
                            topCard.style.opacity = '0.9';
                            topCard.style.zIndex = '30';
                        }

                        setTimeout(() => {
                            const moved = currentDeckOrder.shift();
                            currentDeckOrder.push(moved);

                            applyDeckTransforms();

                            setTimeout(() => {
                                isShuffling = false;
                            }, isMobile ? 180 : 280);
                        }, isMobile ? 150 : 210);
                    };

                    document.addEventListener('DOMContentLoaded', () => {
                        applyDeckTransforms();

                        const cards = document.querySelectorAll('.testimonial-deck-card');
                        cards.forEach((card, idx) => {
                            card.addEventListener('click', () => {
                                if (typeof playCardShuffleSound === 'function') {
                                    playCardShuffleSound();
                                }
                                const posInDeck = currentDeckOrder.indexOf(idx);
                                if (posInDeck > 0) {
                                    const removed = currentDeckOrder.splice(posInDeck, 1);
                                    currentDeckOrder.unshift(removed[0]);
                                    applyDeckTransforms();
                                } else {
                                    window.shuffleTestimonialDeck();
                                }
                            });
                        });

                        window.addEventListener('resize', () => {
                            applyDeckTransforms();
                        });
                    });
                })();

                // LIVE VISITOR GUESTBOOK ENGINE
                (function() {
                    let guestbookEntries = [
                        {
                            id: "gb_reb_1",
                            name: "Reb",
                            role: "Developer",
                            rating: 5,
                            message: "Try leaving a note!",
                            date: "Aug 16, 2026",
                            likes: 0
                        }
                    ];

                    function isCardLiked(id) {
                        try {
                            return localStorage.getItem('liked_gb_' + id) === 'true';
                        } catch (e) {
                            return false;
                        }
                    }

                    function renderGuestbook(entries) {
                        const grid = document.getElementById('guestbookGrid');
                        if (!grid) return;

                        if (!entries || !entries.length) {
                            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94A3B8; padding: 2rem;">No endorsements yet. Be the first to leave one!</div>`;
                            return;
                        }

                        grid.innerHTML = entries.map(item => {
                            const stars = Array.from({ length: 5 }, (_, i) => 
                                `<i class="fas fa-star" style="color: ${i < item.rating ? '#D4AF37' : 'rgba(255,255,255,0.2)'}"></i>`
                            ).join('');
                            const initial = (item.name || 'V').charAt(0).toUpperCase();
                            const liked = isCardLiked(item.id);

                            return `
                                <div class="guestbook-card" data-id="${item.id}">
                                    <div>
                                        <div class="gb-card-top">
                                            <div class="gb-avatar">${initial}</div>
                                            <div class="gb-user-info">
                                                <h4>${item.name}</h4>
                                                <span>${item.role || 'Visitor'}</span>
                                            </div>
                                            <div class="gb-rating-stars">${stars}</div>
                                        </div>
                                        <p class="gb-card-msg">“${item.message}”</p>
                                    </div>
                                    <div class="gb-card-footer">
                                        <span>${item.date}</span>
                                        <button class="btn-gb-like ${liked ? 'liked' : ''}" ${liked ? 'disabled' : ''} onclick="window.likeGuestbookEntry('${item.id}', this)">
                                            <i class="fas fa-heart"></i> <span>${item.likes || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('');
                    }

                    const SB_GB_URL = "https://ngjckggjadtoevbnhjhi.supabase.co/rest/v1/comments";
                    const SB_GB_KEY = "sb_publishable_zFd8VxxbMxpu7wFblnC36w_8Np8JVVf";

                    async function fetchGuestbookData() {
                        try {
                            const res = await fetch('/api/guestbook');
                            if (res.ok) {
                                const data = await res.json();
                                if (data.entries && data.entries.length) {
                                    guestbookEntries = data.entries;
                                }
                            } else {
                                const sbRes = await fetch(`${SB_GB_URL}?select=*&order=id.desc`, {
                                    headers: {
                                        "apikey": SB_GB_KEY,
                                        "Authorization": `Bearer ${SB_GB_KEY}`
                                    }
                                });
                                if (sbRes.ok) {
                                    const sbEntries = await sbRes.json();
                                    if (Array.isArray(sbEntries) && sbEntries.length) {
                                        guestbookEntries = sbEntries;
                                    }
                                }
                            }
                        } catch (err) {
                            try {
                                const sbRes = await fetch(`${SB_GB_URL}?select=*&order=id.desc`, {
                                    headers: {
                                        "apikey": SB_GB_KEY,
                                        "Authorization": `Bearer ${SB_GB_KEY}`
                                    }
                                });
                                if (sbRes.ok) {
                                    const sbEntries = await sbRes.json();
                                    if (Array.isArray(sbEntries) && sbEntries.length) {
                                        guestbookEntries = sbEntries;
                                    }
                                }
                            } catch (e) {}
                        }
                        renderGuestbook(guestbookEntries);
                    }

                    window.likeGuestbookEntry = async function(id, btn) {
                        if (isCardLiked(id)) return;
                        try {
                            localStorage.setItem('liked_gb_' + id, 'true');
                        } catch (e) {}

                        btn.disabled = true;
                        btn.classList.add('liked');

                        if (typeof playSelectionTickSound === 'function') playSelectionTickSound();
                        
                        const entry = guestbookEntries.find(e => e.id === id);
                        let newCount = (entry ? (entry.likes || 0) + 1 : 1);
                        if (entry) entry.likes = newCount;

                        const countSpan = btn.querySelector('span');
                        if (countSpan) {
                            countSpan.innerText = newCount;
                        }

                        try {
                            await fetch('/api/guestbook/like', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id })
                            });
                        } catch (err) {}

                        try {
                            await fetch(`${SB_GB_URL}?id=eq.${id}`, {
                                method: 'PATCH',
                                headers: {
                                    "apikey": SB_GB_KEY,
                                    "Authorization": `Bearer ${SB_GB_KEY}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ likes: newCount })
                            });
                        } catch (e) {}
                    };

                    document.addEventListener('DOMContentLoaded', () => {
                        fetchGuestbookData();

                        const openBtn = document.getElementById('openGuestbookModalBtn');
                        const closeBtn = document.getElementById('closeGuestbookModalBtn');
                        const modal = document.getElementById('guestbookModal');
                        const form = document.getElementById('guestbookForm');
                        const starRating = document.getElementById('gbStarRating');
                        let selectedRating = 5;

                        if (openBtn && modal) {
                            openBtn.addEventListener('click', () => {
                                if (typeof playClickSound === 'function') playClickSound();
                                modal.classList.add('active');
                            });
                        }

                        if (closeBtn && modal) {
                            closeBtn.addEventListener('click', () => {
                                if (typeof playClickSound === 'function') playClickSound();
                                modal.classList.remove('active');
                            });
                        }

                        if (modal) {
                            modal.addEventListener('click', (e) => {
                                if (e.target === modal) modal.classList.remove('active');
                            });
                        }

                        if (starRating) {
                            const stars = starRating.querySelectorAll('i');
                            stars.forEach(star => {
                                star.addEventListener('click', () => {
                                    if (typeof playSelectionTickSound === 'function') playSelectionTickSound();
                                    selectedRating = parseInt(star.getAttribute('data-value') || '5');
                                    starRating.setAttribute('data-rating', selectedRating);
                                    stars.forEach((s, idx) => {
                                        if (idx < selectedRating) s.classList.add('active');
                                        else s.classList.remove('active');
                                    });
                                });
                            });
                        }

                        if (form) {
                            form.addEventListener('submit', async (e) => {
                                e.preventDefault();
                                const nameInput = document.getElementById('gbName');
                                const roleInput = document.getElementById('gbRole');
                                const msgInput = document.getElementById('gbMessage');
                                const submitBtn = document.getElementById('gbSubmitBtn');

                                const name = nameInput ? nameInput.value.trim() : '';
                                const role = roleInput ? roleInput.value.trim() : '';
                                const message = msgInput ? msgInput.value.trim() : '';

                                if (!name || !message) return;

                                if (submitBtn) submitBtn.disabled = true;

                                const payload = { name, role, rating: selectedRating, message };

                                const newCard = {
                                    id: "gb_" + Date.now(),
                                    name,
                                    role: role || "Visitor",
                                    rating: selectedRating,
                                    message,
                                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                                    likes: 0
                                };

                                try {
                                    await fetch(SB_GB_URL, {
                                        method: 'POST',
                                        headers: {
                                            "apikey": SB_GB_KEY,
                                            "Authorization": `Bearer ${SB_GB_KEY}`,
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify(newCard)
                                    });
                                } catch (e) {}

                                try {
                                    const res = await fetch('/api/guestbook', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(payload)
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        if (data.entries) {
                                            guestbookEntries = data.entries;
                                        } else {
                                            guestbookEntries.unshift(newCard);
                                        }
                                    } else {
                                        guestbookEntries.unshift(newCard);
                                    }
                                } catch (err) {
                                    guestbookEntries.unshift(newCard);
                                }

                                renderGuestbook(guestbookEntries);

                                if (submitBtn) submitBtn.disabled = false;
                                if (modal) modal.classList.remove('active');
                                form.reset();
                                if (typeof playClickSound === 'function') playClickSound();
                            });
                        }
                    });
                })();

// ==========================================
// CV DOWNLOAD GMAIL NOTIFICATION VIA RESEND API
// ==========================================
(function setupCvDownloadNotification() {
    let lastDownloadNotification = 0;

    function sendCvAlert(triggerSource) {
        if (typeof window.sendCvAlert === 'function') {
            window.sendCvAlert();
        }
    }

    // Direct binding on the CV download button
    function bindButton() {
        const btn = document.getElementById('downloadCvBtn');
        if (btn) {
            btn.addEventListener('click', function() {
                sendCvAlert('button_click');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindButton);
    } else {
        bindButton();
    }

    // Capture-phase listener on document to intercept any CV anchor click before propagation stops
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a[download="CV.pdf"], #downloadCvBtn, a[href*="Carpio Rebienald"], a[href$=".pdf"]');
        if (target) {
            sendCvAlert('document_capture');
        }
    }, true);
})();
