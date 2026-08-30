const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// Client-side Rate Limiting Configuration
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3;         // Max 3 messages
const COOLDOWN_SECONDS = 30;                  // 30s cooldown between sends

function getSubmissionHistory() {
    try {
        const raw = localStorage.getItem('portfolio_contact_submissions');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const now = Date.now();
        return parsed.filter(ts => typeof ts === 'number' && now - ts < RATE_LIMIT_WINDOW_MS);
    } catch (e) {
        return [];
    }
}

function recordSubmission() {
    try {
        const history = getSubmissionHistory();
        history.push(Date.now());
        localStorage.setItem('portfolio_contact_submissions', JSON.stringify(history));
    } catch (e) {}
}

function checkClientRateLimit() {
    const history = getSubmissionHistory();
    const now = Date.now();

    if (history.length > 0) {
        const lastSent = history[history.length - 1];
        const elapsed = now - lastSent;
        const cooldownMs = COOLDOWN_SECONDS * 1000;
        if (elapsed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
            return {
                allowed: false,
                reason: `Please wait ${remaining}s before sending another message.`,
                cooldownRemaining: remaining
            };
        }
    }

    if (history.length >= MAX_SUBMISSIONS_PER_WINDOW) {
        const oldest = history[0];
        const resetMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 60000);
        return {
            allowed: false,
            reason: `You've reached the maximum limit (3 messages / 10 min). Please try again in ~${resetMinutes} min.`,
            isWindowLimit: true
        };
    }

    return { allowed: true };
}

let cooldownInterval = null;
function startCooldownTimer(seconds) {
    if (!submitBtn) return;
    if (cooldownInterval) clearInterval(cooldownInterval);

    let remaining = seconds;
    submitBtn.disabled = true;

    function updateBtn() {
        if (remaining <= 0) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        } else {
            submitBtn.innerHTML = `<i class="fas fa-clock"></i> Wait ${remaining}s`;
            remaining--;
        }
    }

    updateBtn();
    cooldownInterval = setInterval(updateBtn, 1000);
}

// Determine API endpoint (use production backend when testing via local static Live Server / file://)
function getApiEndpoint() {
    const isStaticLiveServer = window.location.protocol === 'file:' || 
        ((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && 
         (window.location.port === '5500' || window.location.port === '5501' || window.location.port === '5502' || window.location.port === '8080'));

    if (isStaticLiveServer) {
        return 'https://rebkhei.vercel.app/api/contact';
    }
    return '/api/contact';
}

if (contactForm) {
    // Check initial rate limit status on page load
    const initialCheck = checkClientRateLimit();
    if (!initialCheck.allowed && initialCheck.cooldownRemaining) {
        startCooldownTimer(initialCheck.cooldownRemaining);
    }

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 1. Check client-side rate limit first
        const rateLimit = checkClientRateLimit();
        if (!rateLimit.allowed) {
            if (formStatus) {
                formStatus.innerHTML = `<div class="status-message error"><i class="fas fa-shield-alt"></i> ${rateLimit.reason}</div>`;
            }
            if (rateLimit.cooldownRemaining) {
                startCooldownTimer(rateLimit.cooldownRemaining);
            }
            return;
        }

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');

        const nameVal = nameInput ? nameInput.value.trim() : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const subjectVal = subjectInput ? subjectInput.value.trim() : '';
        const messageVal = messageInput ? messageInput.value.trim() : '';

        if (!nameVal || !emailVal || !subjectVal || !messageVal) {
            if (formStatus) {
                formStatus.innerHTML = '<div class="status-message error"><i class="fas fa-exclamation-circle"></i> Please fill out all fields.</div>';
            }
            return;
        }

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Email...';
            submitBtn.disabled = true;
        }
        if (formStatus) {
            formStatus.innerHTML = '';
        }

        const endpoint = getApiEndpoint();

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameVal,
                    email: emailVal,
                    subject: subjectVal,
                    message: messageVal
                })
            });

            let data = {};
            try {
                data = await res.json();
            } catch (e) {
                data = {};
            }

            if (res.ok && (data.success || data.id)) {
                // Record submission for rate limiting and trigger cooldown
                recordSubmission();
                startCooldownTimer(COOLDOWN_SECONDS);

                if (formStatus) {
                    formStatus.innerHTML = '<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent successfully to my email! I will get back to you soon.</div>';
                }
                contactForm.reset();
            } else {
                let errMsg = data.error;
                if (!errMsg) {
                    if (res.status === 429) {
                        errMsg = 'Rate limit exceeded. Please wait a few minutes before sending another message.';
                    } else if (res.status === 404) {
                        errMsg = 'API endpoint not found (404). Please ensure the backend is deployed to Vercel with RESEND_API_KEY.';
                    } else {
                        errMsg = `Failed to send message (HTTP ${res.status}). Please try again later.`;
                    }
                }

                if (res.status === 429) {
                    startCooldownTimer(60); // 60s cooldown if server returned 429
                } else if (!cooldownInterval) {
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                        submitBtn.disabled = false;
                    }
                }

                if (formStatus) {
                    formStatus.innerHTML = `<div class="status-message error"><i class="fas fa-exclamation-triangle"></i> ${errMsg}</div>`;
                }
            }
        } catch (err) {
            console.error('Contact form submission error:', err);
            let userMessage = 'Unable to reach email API. ';
            if (window.location.protocol === 'file:' || window.location.port.startsWith('550')) {
                userMessage += 'When testing locally on VS Code Live Server, make sure you push the latest changes to Vercel and add your RESEND_API_KEY in Vercel settings.';
            } else {
                userMessage += 'Please check your internet connection or try again later.';
            }

            if (formStatus) {
                formStatus.innerHTML = `<div class="status-message error"><i class="fas fa-exclamation-circle"></i> ${userMessage}</div>`;
            }

            if (!cooldownInterval && submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                submitBtn.disabled = false;
            }
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) {
        menu.classList.toggle("active");
        document.body.style.overflow = menu.classList.contains("active") ? "hidden" : "";
    }
}

// Close mobile menu on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const menu = document.getElementById("mobileMenu");
        if (menu && menu.classList.contains("active")) {
            menu.classList.remove("active");
            document.body.style.overflow = "";
        }
    }
});
