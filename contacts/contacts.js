const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

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
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

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

        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
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
                if (formStatus) {
                    formStatus.innerHTML = '<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent successfully to my email! I will get back to you soon.</div>';
                }
                contactForm.reset();
            } else {
                let errMsg = data.error;
                if (!errMsg) {
                    if (res.status === 404) {
                        errMsg = 'API endpoint not found (404). Please ensure the backend is deployed to Vercel with RESEND_API_KEY.';
                    } else {
                        errMsg = `Failed to send message (HTTP ${res.status}). Please check your RESEND_API_KEY configuration.`;
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
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) {
        menu.classList.toggle("active");
    }
}
