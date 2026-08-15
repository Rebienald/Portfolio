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

                function initAudioContext() {
                    try {
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

                    const interactiveSelector = 'a, button, .hamburger, .close-menu, .mobile-menu a, .skill-logo-btn, .tech-float-card, .project-card, .cert-card, .glass-card, .sphere-card-node, [data-tech]';

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
                            tooltip.classList.add('visible');
                        };

                        el.addEventListener('click', (e) => {
                            e.stopPropagation();
                            activateTech(e);
                        });
                    });
                });
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
                            if (Math.abs(walk) > 5) hasDragged = true;
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
                        });
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
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                            lastX = e.touches[0].clientX;
                            lastTime = performance.now();
                            velocity = 0;
                        }, { passive: true });
                        marquee.addEventListener('touchmove', (e) => {
                            isInteracting = true;
                            if (resumeTimeout) clearTimeout(resumeTimeout);
                            const now = performance.now();
                            const dt = now - lastTime;
                            const currentTouchX = e.touches[0].clientX;
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
                        }, { passive: true });
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

                // PROJECT CLICK INTERCEPTOR (SamAI restricted on PC & Mobile; TechnoBytes & NAS.IO restricted on Mobile)
                document.addEventListener('DOMContentLoaded', () => {
                    document.addEventListener('click', (e) => {
                        const card = e.target.closest('.project-card');
                        if (!card) return;

                        const href = card.getAttribute('href') || '';
                        const text = card.textContent || '';
                        const privateAttr = card.getAttribute('data-private-project') || '';

                        const isSamAI = href.includes('samai') || text.includes('SamAI') || privateAttr === 'SamAI';
                        const isMobile = window.innerWidth <= 768;

                        let projectName = '';
                        let isPrivacy = false;

                        if (isSamAI) {
                            projectName = 'SamAI';
                            isPrivacy = true;
                        } else if (isMobile) {
                            if (href.includes('TechnoPhotobooth') || text.includes('TechnoBytes Photobooth') || text.includes('Photobooth')) {
                                projectName = 'TechnoBytes Photobooth';
                            } else if (href.includes('NasIoPing') || text.includes('NAS.IO Bot') || text.includes('NAS.IO')) {
                                projectName = 'NAS.IO Bot';
                            }
                        }

                        if (projectName) {
                            e.preventDefault();
                            e.stopPropagation();

                            playClickSound();

                            const tooltip = document.getElementById('techTooltip');
                            const tooltipName = document.getElementById('tooltipName');
                            const tooltipTag = document.getElementById('tooltipTag');
                            const tooltipDesc = document.getElementById('tooltipDesc');
                            const tooltipIcon = document.getElementById('tooltipIcon');

                            let tooltipHideTimeout = null;
                            if (tooltip) {
                                if (tooltipName) tooltipName.innerText = projectName;
                                if (tooltipTag) tooltipTag.innerText = isPrivacy ? '🔒 PRIVATE SYSTEM' : '💻 DESKTOP REQUIRED';
                                if (tooltipDesc) tooltipDesc.innerText = isPrivacy
                                    ? `Live web access to SamAI is restricted for privacy and security. Ask the AI Chatbot for full technical architecture details!`
                                    : `In order to view and experience ${projectName}, you need to be on a PC / Desktop computer.`;
                                if (tooltipIcon) tooltipIcon.innerHTML = isPrivacy 
                                    ? '<i class="fas fa-lock" style="color:var(--accent);"></i>'
                                    : '<i class="fas fa-desktop" style="color:var(--accent);"></i>';
                                tooltip.classList.add('visible');

                                if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
                                tooltipHideTimeout = setTimeout(() => {
                                    if (tooltip) tooltip.classList.remove('visible');
                                }, 3000);
                            }

                            if (typeof window.openChatbotWithMessage === 'function') {
                                window.openChatbotWithMessage(projectName, isPrivacy);
                            }
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
                // 3D FLAT FRONT-FACING SPHERICAL ORBIT GLOBE ENGINE
                document.addEventListener('DOMContentLoaded', () => {
                    const sphereData = [
                        { tag: 'CvSU', year: '2026 – PRESENT', title: 'Cavite State University', sub: 'Bachelor of Science in Information Technology', icon: 'fas fa-graduation-cap' },
                        { tag: 'STI', year: '2024 – 2026', title: 'STI College Bacoor', sub: 'TVL Track - Major in Mobile App & Web Development', icon: 'fas fa-laptop-code' },
                        { tag: 'Honors', year: '2026', title: 'Graduated With Honors', sub: 'Graduated Senior High School with High Academic Honors at STI College Bacoor.', icon: 'fas fa-award' },
                        { tag: 'BNHS', year: '2020 – 2024', title: 'Binakayan National High School', sub: 'Computer System Servicing', icon: 'fas fa-microchip' },
                        { tag: 'Capstone', year: 'June 29, 2026', title: 'Best in Capstone Project', sub: 'Best Capstone Project awardee among all SHS students at STI College Bacoor.', icon: 'fas fa-trophy' },
                        { tag: 'Best System', year: 'May 22, 2026', title: 'Best in System Development', sub: 'Recognized as Best in System Development among all Senior High School students at STI College Bacoor for developing an AI-integrated educational gaming platform.', icon: 'fas fa-star' },
                        { tag: 'TechTalk #2', year: 'Oct 20, 2025', title: 'Resource Speaker: TechTalk Ep. 2', sub: 'Directed intensive technical training on Advanced Web Responsiveness and scalable deployment pipelines.', icon: 'fas fa-chalkboard-teacher' },
                        { tag: 'TechTalk #1', year: 'Nov 25, 2025', title: 'Resource Speaker: TechTalk Ep. 1', sub: 'Delivered comprehensive seminars on HTML/CSS fundamentals, semantic structuring, and modern rendering standards.', icon: 'fas fa-bullhorn' },
                        { tag: 'Hackathon', year: 'April 24, 2025', title: 'Web Development & Design Competition', sub: 'Placed 3rd in a 7-hour Web Development & Design Competition, competing against college-level participants.', icon: 'fas fa-medal' },
                        { tag: 'CodeFest', year: 'Feb 28, 2025', title: 'CodeFest - Tagisan ng Talino', sub: 'Competed against college-level participants in an intensive 8-hour Mobile Application Development Competition.', icon: 'fas fa-code' }
                    ];

                    const ball = document.getElementById('milestoneSphere');
                    const viewport = document.getElementById('sphereViewport');
                    const detailsTitle = document.getElementById('sphereDetailTitle');
                    const detailsSub = document.getElementById('sphereDetailSub');
                    const detailsTag = document.getElementById('sphereDetailTag');
                    const detailsYear = document.getElementById('sphereDetailYear');

                    if (!ball || !viewport) return;

                    let rotX = -5;
                    let rotY = 0;
                    let velX = 0;
                    let velY = 0;
                    let isDragging = false;
                    let startX = 0;
                    let startY = 0;
                    const radius = window.innerWidth <= 768 ? 140 : 310;

                    const count = sphereData.length;
                    const phi = Math.PI * (3 - Math.sqrt(5));
                    const cardElements = [];

                    sphereData.forEach((item, i) => {
                        const y = 1 - (i / (count - 1)) * 2;
                        const r = Math.sqrt(1 - y * y);
                        const theta = phi * i;

                        const card = document.createElement('div');
                        card.className = `sphere-card-node ${i === 0 ? 'active-sphere-node' : ''}`;

                        card.innerHTML = `
                            <div class="sphere-card-header">
                                <span class="sphere-card-tag">${item.tag}</span>
                                <i class="${item.icon} sphere-card-icon"></i>
                            </div>
                            <div class="sphere-card-title">${item.title}</div>
                            <div class="sphere-card-sub">${item.sub}</div>
                        `;

                        card.addEventListener('click', (e) => {
                            e.stopPropagation();
                            playSelectionTickSound();
                            document.querySelectorAll('.sphere-card-node').forEach(c => c.classList.remove('active-sphere-node'));
                            card.classList.add('active-sphere-node');

                            if (detailsTitle) detailsTitle.innerText = item.title;
                            if (detailsSub) detailsSub.innerText = item.sub;
                            if (detailsTag) detailsTag.innerText = item.tag;
                            if (detailsYear) detailsYear.innerText = item.year;
                        });

                        ball.appendChild(card);
                        cardElements.push({ el: card, y, r, theta });
                    });

                    function onStart(e) {
                        isDragging = true;
                        velX = 0;
                        velY = 0;
                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                        startX = clientX;
                        startY = clientY;
                    }

                    function onMove(e) {
                        if (!isDragging) return;
                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                        const deltaX = clientX - startX;
                        const deltaY = clientY - startY;

                        const isMobile = window.innerWidth <= 768;

                        velY = -deltaX * 0.35;
                        velX = isMobile ? 0 : deltaY * 0.35;

                        rotY += velY;
                        if (!isMobile) {
                            rotX += velX;
                        } else {
                            rotX = 0;
                        }

                        startX = clientX;
                        startY = clientY;
                    }

                    function onEnd() {
                        isDragging = false;
                    }

                    viewport.addEventListener('mousedown', onStart);
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onEnd);

                    viewport.addEventListener('touchstart', onStart, { passive: true });
                    window.addEventListener('touchmove', onMove, { passive: true });
                    window.addEventListener('touchend', onEnd, { passive: true });

                    let lastTickRotY = 0;
                    let lastFocusedNodeIndex = -1;

                    function animateSphere() {
                        const isMobile = window.innerWidth <= 768;
                        const radius = isMobile ? 140 : Math.min(310, Math.max(250, window.innerWidth * 0.21));

                        if (!isDragging) {
                            velY *= 0.95;
                            velX = isMobile ? 0 : velX * 0.95;
                            rotY += velY + 0.18;
                            if (!isMobile) {
                                rotX += velX;
                            } else {
                                rotX = 0;
                            }
                        }
                        if (isMobile) {
                            rotX = 0;
                        } else {
                            rotX = Math.max(-40, Math.min(40, rotX));
                        }

                        if (isDragging) {
                            if (Math.abs(rotY - lastTickRotY) >= 22) {
                                lastTickRotY = rotY;
                                playSelectionTickSound();
                            }
                        }

                        const radY = rotY * Math.PI / 180;
                        const radX = rotX * Math.PI / 180;

                        let maxZ = -9999;
                        let closestIdx = -1;

                        cardElements.forEach((item, idx) => {
                            const angleY = item.theta + radY;
                            const posX = Math.cos(angleY) * item.r * radius;
                            const posY = isMobile 
                                ? item.y * (radius * 0.78) 
                                : item.y * (radius * 0.82) + (Math.sin(radX) * 35);
                            const posZ = Math.sin(angleY) * item.r * radius;

                            if (posZ > maxZ) {
                                maxZ = posZ;
                                closestIdx = idx;
                            }

                            const normalizedZ = (posZ + radius) / (2 * radius);
                            const scale = isMobile ? (0.72 + (normalizedZ * 0.38)) : (0.74 + (normalizedZ * 0.38));
                            const opacity = isMobile ? (0.35 + (normalizedZ * 0.65)) : (0.35 + (normalizedZ * 0.65));
                            const zIndex = Math.round(posZ + radius + 100);

                            item.el.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, ${posZ.toFixed(2)}px) scale(${scale.toFixed(3)})`;
                            item.el.style.opacity = opacity.toFixed(2);
                            item.el.style.zIndex = zIndex;
                            item.el.style.pointerEvents = isMobile ? (posZ > 0 ? 'auto' : 'none') : (posZ > 10 ? 'auto' : 'none');
                        });

                        if (isDragging && closestIdx !== -1 && closestIdx !== lastFocusedNodeIndex) {
                            lastFocusedNodeIndex = closestIdx;
                            playSelectionTickSound();
                        }

                        requestAnimationFrame(animateSphere);
                    }
                    animateSphere();
                });

                // STRICT SECTION-BY-SECTION SNAP SWITCHER ENGINE (DESKTOP ONLY / TOGGLEABLE)
                (function() {
                    let isAnimating = false;
                    let currentIndex = 0;
                    
                    const isMobileDevice = () => window.innerWidth <= 768;
                    // Locked section scrolling, with a short response cooldown.
                    let snapEnabled = !isMobileDevice();
                    
                    const toggleBtn = document.getElementById('snapToggleBtn');
                    const toggleLabel = document.getElementById('snapToggleLabel');

                    if (isMobileDevice()) {
                        document.documentElement.style.scrollSnapType = 'none';
                    }

                    if (toggleBtn) {
                        toggleBtn.addEventListener('click', () => {
                            snapEnabled = !snapEnabled;
                            if (snapEnabled) {
                                toggleBtn.classList.remove('snap-off');
                                toggleBtn.querySelector('i').className = 'fas fa-lock';
                                if (toggleLabel) toggleLabel.innerText = 'Snap Scroll: ON';
                                document.documentElement.style.scrollSnapType = 'y mandatory';
                            } else {
                                toggleBtn.classList.add('snap-off');
                                toggleBtn.querySelector('i').className = 'fas fa-unlock';
                                if (toggleLabel) toggleLabel.innerText = 'Free Scroll: ON';
                                document.documentElement.style.scrollSnapType = 'none';
                            }
                        });
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

                    window.addEventListener('wheel', (e) => {
                        if (!snapEnabled || isMobileDevice()) return;
                        if (e.target.closest('#chatMessages, .chatbot-container, textarea, input')) {
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
                        if (e.target.closest('#chatMessages, .chatbot-container, textarea, input, .certs-marquee, .projects-marquee')) {
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
