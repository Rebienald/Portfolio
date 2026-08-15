<?php
session_start();
$isLoggedIn = !empty($_SESSION['admin_logged_in']);
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Messages Inbox | Rebienald Carpio</title>
        <link rel="icon" type="image/png" href="../images/logo.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

        <link rel="stylesheet" href="inbox_php.css">
    </head>
    <body>

        <header>
            <div class="header-content">
                <div class="logo-group">
                    <a href="../index.html" class="logo">Reb.Dev</a>
                    <span class="badge-title"><i class="fas fa-database"></i> SQLite Inbox</span>
                </div>
                <div class="header-actions">
                    <?php if ($isLoggedIn): ?>
                    <button class="btn btn-outline" onclick="loadMessages()"><i class="fas fa-sync-alt"></i> Refresh</button>
                    <button class="btn btn-outline" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
                    <?php else: ?>
                    <a href="contact.html" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Back to Contact</a>
                    <?php endif; ?>
                </div>
            </div>
        </header>

        <main class="container">
            <?php if (!$isLoggedIn): ?>

            <div class="login-wrapper">
                <div class="login-card">
                    <div style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"><i class="fas fa-lock"></i></div>
                    <h2>Admin Inbox Login</h2>
                    <p>Enter the admin password to access saved SQLite contact messages.</p>
                    <div class="error-box" id="loginError">Invalid Password</div>
                    <form id="loginForm">
                        <input type="password" id="adminPassword" placeholder="Enter admin password" required autofocus>
                        <button type="submit" id="loginBtn">Unlock Inbox</button>
                    </form>
                </div>
            </div>
            <?php else: ?>

            <div class="stats-bar">
                <div class="stat-card">
                    <div class="number" id="totalCount">0</div>
                    <div class="label">Total Received Messages</div>
                </div>
                <div class="stat-card">
                    <div class="number" id="unreadCount" style="color: var(--accent);">0</div>
                    <div class="label">Unread Messages</div>
                </div>
            </div>

            <div class="controls-bar">
                <input type="text" class="search-input" id="searchInput" placeholder="Search..." oninput="filterMessages()">
                <div class="filter-group">
                    <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">All Messages</button>
                    <button class="filter-btn" data-filter="unread" onclick="setFilter('unread')">Unread</button>
                    <button class="filter-btn" data-filter="read" onclick="setFilter('read')">Read</button>
                </div>
            </div>

            <div class="messages-list" id="messagesContainer">
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading messages from SQLite database...</p>
                </div>
            </div>
            <?php endif; ?>
        </main>

        <script>
            let allMessages = [];
            let currentFilter = 'all';
            <?php if (!$isLoggedIn): ?>
            document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const password = document.getElementById('adminPassword').value;
                const loginBtn = document.getElementById('loginBtn');
                const errorBox = document.getElementById('loginError');
                loginBtn.innerText = 'Verifying...';
                errorBox.style.display = 'none';
                const formData = new FormData();
                formData.append('password', password);
                try {
                    const res = await fetch('contact_api.php?action=login', { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.success) {
                        window.location.reload();
                    } else {
                        errorBox.innerText = data.message || 'Invalid Password';
                        errorBox.style.display = 'block';
                    }
                } catch (err) {
                    errorBox.innerText = 'Connection error. Make sure PHP server is running.';
                    errorBox.style.display = 'block';
                } finally {
                    loginBtn.innerText = 'Unlock Inbox';
                }
            });
            <?php else: ?>
            async function loadMessages() {
                const container = document.getElementById('messagesContainer');
                try {
                    const res = await fetch('contact_api.php?action=fetch');
                    const data = await res.json();
                    if (data.success) {
                        allMessages = data.messages;
                        document.getElementById('totalCount').innerText = data.total;
                        document.getElementById('unreadCount').innerText = data.unread;
                        renderMessages();
                    } else {
                        container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${data.message}</p></div>`;
                    }
                } catch (err) {
                    container.innerHTML = `<div class="empty-state"><i class="fas fa-wifi"></i><p>Unable to connect to database server.</p></div>`;
                }
            }
            function setFilter(filter) {
                currentFilter = filter;
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
                });
                renderMessages();
            }
            function filterMessages() {
                renderMessages();
            }
            function renderMessages() {
                const container = document.getElementById('messagesContainer');
                const query = document.getElementById('searchInput').value.toLowerCase();
                let filtered = allMessages.filter(msg => {
                    if (currentFilter === 'unread' && msg.is_read == 1) return false;
                    if (currentFilter === 'read' && msg.is_read == 0) return false;
                    if (query) {
                        const haystack = (msg.name + ' ' + msg.email + ' ' + msg.subject + ' ' + msg.message).toLowerCase();
                        return haystack.includes(query);
                    }
                    return true;
                });
                if (filtered.length === 0) {
                    container.innerHTML = `
                    <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No messages found in SQLite database.</p>
                    </div>
                    `;
                    return;
                }
                container.innerHTML = filtered.map(msg => `
                <div class="message-card ${msg.is_read == 0 ? 'unread' : ''}">
                <div class="card-header">
                <div class="sender-info">
                <h3>${escapeHtml(msg.name)}</h3>
                <a href="mailto:${escapeHtml(msg.email)}"><i class="fas fa-envelope"></i> ${escapeHtml(msg.email)}</a>
                </div>
                <div class="meta-info">
                <span class="time-stamp"><i class="far fa-clock"></i> ${escapeHtml(msg.created_at)}</span>
                <span class="status-pill ${msg.is_read == 0 ? 'unread' : 'read'}">${msg.is_read == 0 ? 'Unread' : 'Read'}</span>
                </div>
                </div>
                <div class="subject-line"><i class="fas fa-heading" style="color: var(--accent); margin-right: 0.4rem;"></i> ${escapeHtml(msg.subject)}</div>
                <div class="message-body">${escapeHtml(msg.message)}</div>
                <div class="card-footer">
                <button class="btn btn-outline" onclick="toggleRead(${msg.id})">
                <i class="fas ${msg.is_read == 0 ? 'fa-check' : 'fa-undo'}"></i> ${msg.is_read == 0 ? 'Mark Read' : 'Mark Unread'}
                </button>
                <button class="btn btn-danger" onclick="deleteMessage(${msg.id})">
                <i class="fas fa-trash-alt"></i> Delete
                </button>
                </div>
                </div>
                `).join('');
            }
            async function toggleRead(id) {
                const formData = new FormData();
                formData.append('id', id);
                await fetch('contact_api.php?action=toggle_read', { method: 'POST', body: formData });
                loadMessages();
            }
            async function deleteMessage(id) {
                if (!confirm('Are you sure you want to delete this message from SQLite?')) return;
                const formData = new FormData();
                formData.append('id', id);
                await fetch('contact_api.php?action=delete', { method: 'POST', body: formData });
                loadMessages();
            }
            async function logout() {
                await fetch('contact_api.php?action=logout');
                window.location.reload();
            }
            function escapeHtml(str) {
                if (!str) return '';
                return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
            }
            loadMessages();
            <?php endif; ?>
        </script>
    </body>
</html>
