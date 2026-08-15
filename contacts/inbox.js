const SUPABASE_URL_MSGS = "https://uwboeqkiwncdtarqvxbo.supabase.co/rest/v1/messages";
            const SUPABASE_KEY = "sb_publishable_a5_YHH1N5U0goK4rRks_OA_Lr-JBSjH";
            let currentFilter = "all";
            let messages = [];
            async function initData() {
                try {
                    messages = JSON.parse(localStorage.getItem("portfolio_messages") || "[]");
                } catch (e) {}
                renderUI();
                try {
                    const res = await fetch(`${SUPABASE_URL_MSGS}?select=*&order=id.desc`, {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`,
                        },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            messages = data;
                            localStorage.setItem("portfolio_messages", JSON.stringify(data));
                            renderUI();
                        }
                    }
                } catch (e) {
                    console.error("Fetch messages error:", e);
                }
            }
            function renderUI() {
                const container = document.getElementById("messagesList");
                const stats = document.getElementById("statsSummary");
                const query = (document.getElementById("searchInput")?.value || "").toLowerCase();
                const total = messages.length;
                const unread = messages.filter((m) => m.is_read == 0).length;
                if (stats) stats.innerText = `Total: ${total} | Unread: ${unread}`;
                let filtered = messages.filter((msg) => {
                    if (currentFilter === "unread" && msg.is_read == 1) return false;
                    if (currentFilter === "read" && msg.is_read == 0) return false;
                    if (query) {
                        const haystack = (
                            msg.name +
                            " " +
                            msg.email +
                            " " +
                            msg.subject +
                            " " +
                            msg.message
                        ).toLowerCase();
                        return haystack.includes(query);
                    }
                    return true;
                });
                if (filtered.length === 0) {
                    container.innerHTML = `
                    <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size:1.5rem; margin-bottom:0.5rem; color:#9CA3AF;"></i>
                    <div>No messages found</div>
                    </div>`;
                    return;
                }
                container.innerHTML = filtered
                    .map(
                        (msg) => `
                <div class="msg-card ${msg.is_read == 0 ? "unread" : ""}">
                <div class="msg-header">
                <div class="msg-sender-info">
                <span class="msg-sender">${escapeHtml(msg.name)}</span>
                <a href="mailto:${escapeHtml(msg.email)}" class="msg-email">&lt;${escapeHtml(msg.email)}&gt;</a>
                </div>
                <div class="msg-meta-info">
                <span class="msg-time">${escapeHtml(msg.created_at)}</span>
                <span class="msg-badge ${msg.is_read == 0 ? "badge-unread" : "badge-read"}">
                ${msg.is_read == 0 ? "UNREAD" : "READ"}
                </span>
                </div>
                </div>
                <div class="msg-subject"><strong style="color:#6B7280;">Subject:</strong> ${escapeHtml(msg.subject)}</div>
                <div class="msg-body">${escapeHtml(msg.message)}</div>
                <div class="msg-footer">
                <button class="btn-sharp" onclick="toggleRead('${msg.id}')">
                <i class="fas ${msg.is_read == 0 ? "fa-check" : "fa-envelope"}"></i>
                ${msg.is_read == 0 ? "Read" : "Unread"}
                </button>
                <button class="btn-sharp btn-danger" onclick="deleteMessage('${msg.id}')">
                <i class="fas fa-trash-alt"></i> Delete
                </button>
                </div>
                </div>
                `
                    )
                    .join("");
            }
            function setFilter(filter) {
                currentFilter = filter;
                document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
                if (filter === "all") document.getElementById("filterAll").classList.add("active");
                if (filter === "unread") document.getElementById("filterUnread").classList.add("active");
                if (filter === "read") document.getElementById("filterRead").classList.add("active");
                renderUI();
            }
            async function toggleRead(id) {
                const msg = messages.find((m) => String(m.id) === String(id));
                if (msg) {
                    const newStatus = msg.is_read == 1 ? 0 : 1;
                    msg.is_read = newStatus;
                    localStorage.setItem("portfolio_messages", JSON.stringify(messages));
                    renderUI();
                    try {
                        await fetch(`${SUPABASE_URL_MSGS}?id=eq.${id}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                apikey: SUPABASE_KEY,
                                Authorization: `Bearer ${SUPABASE_KEY}`,
                            },
                            body: JSON.stringify({ is_read: newStatus }),
                        });
                    } catch (e) {
                        console.error("PATCH error:", e);
                    }
                }
            }
            async function deleteMessage(id) {
                if (!confirm("Delete message?")) return;
                messages = messages.filter((m) => String(m.id) !== String(id));
                localStorage.setItem("portfolio_messages", JSON.stringify(messages));
                renderUI();
                try {
                    await fetch(`${SUPABASE_URL_MSGS}?id=eq.${id}`, {
                        method: "DELETE",
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`,
                        },
                    });
                } catch (e) {
                    console.error("DELETE error:", e);
                }
            }
            async function clearAllMessages() {
                if (!confirm("Clear ALL messages?")) return;
                messages = [];
                localStorage.removeItem("portfolio_messages");
                renderUI();
                try {
                    await fetch(`${SUPABASE_URL_MSGS}?id=gt.0`, {
                        method: "DELETE",
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`,
                        },
                    });
                } catch (e) {
                    console.error("Clear all error:", e);
                }
            }
            function escapeHtml(str) {
                if (!str) return "";
                return String(str)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
            }
            document.addEventListener("DOMContentLoaded", initData);
