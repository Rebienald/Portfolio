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
                function toggleMobileMenu() {
                    document.getElementById('mobileMenu').classList.toggle('active');
                }
                document.addEventListener('DOMContentLoaded', () => {
                    const hudName = document.getElementById('hudName');
                    const hudTag = document.getElementById('hudTag');
                    const hudDesc = document.getElementById('hudDesc');
                    const hudIcon = document.getElementById('hudIcon');
                    const skillButtons = document.querySelectorAll('.skill-logo-btn');

                    const techDescriptions = {
                        'HTML5': { tag: 'FRONTEND ARCHITECTURE', desc: 'Semantic HTML structure with strict accessibility, responsive layout structure, and search engine optimization.', icon: 'devicon-html5-plain colored' },
                        'CSS3': { tag: 'STYLING & ANIMATION', desc: 'Custom Vanilla CSS design systems, CSS variables, high-performance 60fps animations, and responsive breakpoints.', icon: 'devicon-css3-plain colored' },
                        'Tailwind': { tag: 'UTILITY CSS FRAMEWORK', desc: 'Rapid responsive UI prototyping with utility-first layout composition.', icon: 'devicon-tailwindcss-original colored' },
                        'JavaScript': { tag: 'FRONTEND LOGIC & DOM', desc: 'Asynchronous DOM manipulation, ES6+ logic, Fetch API integrations, dynamic state management, and event handling.', icon: 'devicon-javascript-plain colored' },
                        'Bootstrap': { tag: 'RESPONSIVE UI FRAMEWORK', desc: 'Mobile-first grid architecture, component libraries, and rapid cross-browser layout building.', icon: 'devicon-bootstrap-plain colored' },
                        'PHP': { tag: 'BACKEND ARCHITECTURE', desc: '5 Years experience in server-side scripting, custom API endpoints, session authentication, and database querying.', icon: 'devicon-php-plain colored' },
                        'C#': { tag: 'OBJECT-ORIENTED & .NET', desc: 'Desktop applications, .NET MAUI mobile development, object-oriented logic, and C# software architecture.', icon: 'devicon-csharp-plain colored' },
                        'Java': { tag: 'OBJECT-ORIENTED APPS', desc: 'Core Java applications, OOP principles, data structures, and cross-platform software building.', icon: 'devicon-java-plain colored' },
                        'Node.js': { tag: 'SERVER-SIDE RUNTIME', desc: 'Asynchronous server environments, REST APIs, Express framework, and real-time backend microservices.', icon: 'fab fa-node-js' },
                        '.NET MAUI': { tag: 'CROSS-PLATFORM MOBILE', desc: 'Cross-platform native mobile and desktop application development using C# and XAML.', icon: 'devicon-dotnetcore-plain colored' },
                        'ASP.NET': { tag: 'ENTERPRISE WEB APIs', desc: 'Robust C# enterprise web applications, MVC architecture, and backend service integration.', icon: 'devicon-dotnetcore-plain colored' },
                        'MySQL': { tag: 'RELATIONAL DATABASE', desc: 'Relational database schema design, SQL query optimization, primary/foreign key indexing, and transaction safety.', icon: 'devicon-mysql-plain colored' },
                        'MongoDB': { tag: 'DOCUMENT NOSQL', desc: 'NoSQL document database collections, JSON/BSON data structures, and scalable database schemas.', icon: 'devicon-mongodb-plain colored' },
                        'SQLite': { tag: 'EMBEDDED DATABASE', desc: 'Lightweight zero-configuration relational database storage for local applications and mobile software.', icon: 'devicon-sqlite-plain colored' },
                        'Supabase': { tag: 'CLOUD POSTGRES HOSTING', desc: 'Realtime cloud database management, PostgreSQL engine, row-level security, and instant REST APIs.', icon: 'fas fa-database' },
                        'VS': { tag: 'ENTERPRISE IDE', desc: 'Visual Studio development environment for C#, .NET MAUI, desktop apps, and solution management.', icon: 'devicon-visualstudio-plain colored' },
                        'VS Code': { tag: 'PRIMARY EDITOR', desc: 'Core code editor environment with extensions, Git integration, terminal shell, and live debugging.', icon: 'devicon-vscode-plain colored' },
                        'Android Studio': { tag: 'MOBILE DEVELOPMENT IDE', desc: 'Native Android app creation, Java/Kotlin development, layout XML design, and device emulation.', icon: 'devicon-androidstudio-plain colored' },
                        'NetBeans': { tag: 'JAVA DEVELOPMENT IDE', desc: 'Java application development environment, GUI building, and Java SE project compiling.', icon: 'devicon-netbeans-plain colored' },
                        'Ubuntu': { tag: 'LINUX SERVER & OS', desc: 'Linux environment for server deployment, shell scripts, package management, and command-line execution.', icon: 'devicon-ubuntu-plain colored' },
                        'Windows 11': { tag: 'WORKSTATION OS', desc: 'Primary OS for software compilation, .NET desktop app development, and multi-monitor productivity.', icon: 'devicon-windows8-original colored' },
                        'Zorin OS': { tag: 'LINUX WORKSTATION', desc: 'Dedicated Linux workstation environment for local web server hosting and Unix terminal tooling.', icon: 'fas fa-desktop' },
                        'Git': { tag: 'VERSION CONTROL', desc: 'Version control system for source code tracking, commit history, branch merging, and team collaboration.', icon: 'devicon-git-plain colored' },
                        'GitHub': { tag: 'CODE REPOSITORY HOSTING', desc: 'Cloud Git repository hosting, open-source project management, and automated deployment pipelines.', icon: 'devicon-github-original colored' },
                        'Cursor': { tag: 'AI-ASSISTED EDITOR', desc: 'AI-enhanced code editor environment for rapid codebase navigation and automated refactoring.', icon: 'fas fa-code' },
                        'Devin': { tag: 'DEVELOPMENT AGENT SUITE', desc: 'Modern software engineering automation and agentic workflow orchestration.', icon: 'fas fa-robot' },
                        'Vercel': { tag: 'FRONTEND CLOUD PLATFORM', desc: 'Serverless web application deployment, global CDN distribution, and CI/CD integration.', icon: 'fas fa-bolt' },
                        'AWS': { tag: 'CLOUD INFRASTRUCTURE', desc: 'Amazon Web Services cloud hosting, EC2 instances, S3 storage, and cloud network deployment.', icon: 'fab fa-aws' },
                        'Netlify': { tag: 'JAMSTACK DEPLOYMENT', desc: 'Automated continuous deployment, serverless functions, and static site hosting.', icon: 'devicon-netlify-plain colored' },
                        'Render': { tag: 'CLOUD APPLICATION HOSTING', desc: 'Unified cloud hosting for Node.js backends, web services, and database instances.', icon: 'fas fa-server' },
                        'XAMPP': { tag: 'LOCAL WEB SERVER', desc: 'Local Apache HTTP server, MariaDB/MySQL database engine, and PHP runtime stack for development.', icon: 'fas fa-network-wired' },
                        'InfinityFree': { tag: 'WEB HOSTING PLATFORM', desc: 'Free cloud web hosting with PHP support, MySQL database access, and cPanel controls.', icon: 'fas fa-cloud-upload-alt' },
                        'AeonFree': { tag: 'CLOUD HOSTING PROVIDER', desc: 'Cloud server hosting platform for PHP scripts, web applications, and database storage.', icon: 'fas fa-cloud' }
                    };

                    skillButtons.forEach(btn => {
                        const name = btn.getAttribute('data-tech') || btn.getAttribute('title') || '';
                        const data = techDescriptions[name] || { tag: 'TECHNICAL SKILL', desc: 'Experienced in practical software development and production implementation.', icon: 'fas fa-code' };

                        const activateButton = () => {
                            skillButtons.forEach(b => b.classList.remove('active-btn'));
                            btn.classList.add('active-btn');

                            if (hudName && hudTag && hudDesc) {
                                hudName.innerText = name;
                                hudTag.innerText = data.tag;
                                hudDesc.innerText = data.desc;
                                if (hudIcon) {
                                    hudIcon.innerHTML = `<i class="${data.icon}"></i>`;
                                }
                            }
                        };

                        btn.addEventListener('mouseenter', activateButton);
                        btn.addEventListener('click', activateButton);
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

                        const radY = rotY * Math.PI / 180;
                        const radX = rotX * Math.PI / 180;

                        cardElements.forEach((item) => {
                            const angleY = item.theta + radY;
                            const posX = Math.cos(angleY) * item.r * radius;
                            const posY = isMobile 
                                ? item.y * (radius * 0.78) 
                                : item.y * (radius * 0.82) + (Math.sin(radX) * 35);
                            const posZ = Math.sin(angleY) * item.r * radius;

                            const normalizedZ = (posZ + radius) / (2 * radius);
                            const scale = isMobile ? (0.72 + (normalizedZ * 0.38)) : (0.74 + (normalizedZ * 0.38));
                            const opacity = isMobile ? (0.35 + (normalizedZ * 0.65)) : (0.35 + (normalizedZ * 0.65));
                            const zIndex = Math.round(posZ + radius + 100);

                            item.el.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, ${posZ.toFixed(2)}px) scale(${scale.toFixed(3)})`;
                            item.el.style.opacity = opacity.toFixed(2);
                            item.el.style.zIndex = zIndex;
                            item.el.style.pointerEvents = isMobile ? (posZ > 0 ? 'auto' : 'none') : (posZ > 10 ? 'auto' : 'none');
                        });

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

                // PURE BLACK FULL-SCREEN CURSIVE HANDWRITING PRE-LOADER ENGINE
                document.body.style.overflow = 'hidden';
                window.scrollTo(0, 0);

                const loadingName = document.querySelector('.loading-name');
                if (loadingName) {
                    const name = loadingName.dataset.name || '';
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        loadingName.textContent = name;
                    } else {
                        let letterIndex = 0;
                        const typing = setInterval(() => {
                            loadingName.textContent += name.charAt(letterIndex);
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
