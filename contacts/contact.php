<?php
session_start();

define('ADMIN_PASSWORD', 'admin123');

$dbPath = __DIR__ . '/messages.db';
$formStatusMsg = '';
$formStatusType = '';
$loginErrorMsg = '';

try {
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->exec("CREATE TABLE IF NOT EXISTS messages (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL,
subject TEXT NOT NULL,
message TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
is_read INTEGER DEFAULT 0
)");
} catch (Exception $e) {
die("Database Error: " . $e->getMessage());
}

if (isset($_POST['action']) && $_POST['action'] === 'submit_message') {
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!empty($name) && !empty($email) && !empty($subject) && !empty($message)) {
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
$stmt = $pdo->prepare("INSERT INTO messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)");
$stmt->execute([
':name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
':email' => filter_var($email, FILTER_SANITIZE_EMAIL),
':subject' => htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'),
':message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
]);
$formStatusMsg = "Message sent successfully! Saved to SQLite database.";
$formStatusType = "success";
} else {
$formStatusMsg = "Please enter a valid email address.";
$formStatusType = "error";
}
} else {
$formStatusMsg = "Please fill in all required fields.";
$formStatusType = "error";
}
}

if (isset($_POST['action']) && $_POST['action'] === 'admin_login') {
if (($_POST['password'] ?? '') === ADMIN_PASSWORD) {
$_SESSION['admin_logged_in'] = true;
header("Location: contact.php#admin-inbox");
exit;
} else {
$loginErrorMsg = "INVALID ADMIN KEY";
}
}

if (isset($_GET['action']) && $_GET['action'] === 'logout') {
unset($_SESSION['admin_logged_in']);
session_destroy();
header("Location: contact.php");
exit;
}

$isLoggedIn = !empty($_SESSION['admin_logged_in']);

if ($isLoggedIn && isset($_POST['action'])) {
if ($_POST['action'] === 'toggle_read') {
$id = intval($_POST['id'] ?? 0);
$stmt = $pdo->prepare("UPDATE messages SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = :id");
$stmt->execute([':id' => $id]);
header("Location: contact.php#admin-inbox");
exit;
}
if ($_POST['action'] === 'delete') {
$id = intval($_POST['id'] ?? 0);
$stmt = $pdo->prepare("DELETE FROM messages WHERE id = :id");
$stmt->execute([':id' => $id]);
header("Location: contact.php#admin-inbox");
exit;
}
}

$messages = [];
$totalCount = 0;
$unreadCount = 0;

if ($isLoggedIn) {
$stmt = $pdo->query("SELECT * FROM messages ORDER BY id DESC");
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
$totalCount = count($messages);
foreach ($messages as $m) {
if ($m['is_read'] == 0) $unreadCount++;
}
}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact | Rebienald Carpio</title>
        <link rel="icon" type="image/png" href="../images/logo.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

        <link rel="stylesheet" href="contact.css">
    </head>
    <body>

        <nav>
            <a href="../index.html" class="logo">Reb.Dev</a>
            <ul class="nav-links">
                <li><a href="../index.html#work">Work</a></li>
                <li><a href="../index.html#expertise">Expertise</a></li>
                <li><a href="../index.html#about">About</a></li>
                <li><a href="../index.html#certifications">Certificates</a></li>
            </ul>
            <a href="contact.php" class="nav-cta">Let's Talk</a>
        </nav>

        <main class="main-content">
            <div class="container">

                <section class="hero">
                    <h1>Let's Build Something.</h1>
                    <p>Feel free to reach out for collaborations, project inquiries, or just to say hello. I'm always open to discussing new opportunities.</p>
                </section>

                <div class="contact-grid">

                    <div class="glass-card">
                        <h2>Contact Info</h2>
                        <ul class="contact-details">
                            <li>
                                <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                                <div class="contact-text">
                                    <h3>Email</h3>
                                    <a href="mailto:Rebienaldev@gmail.com">Rebienaldev@gmail.com</a>
                                </div>
                            </li>
                            <li>
                                <div class="contact-icon"><i class="fab fa-github"></i></div>
                                <div class="contact-text">
                                    <h3>GitHub</h3>
                                    <a href="https://github.com/rebienalddev" target="_blank">rebienalddev</a>
                                </div>
                            </li>
                            <li>
                                <div class="contact-icon"><i class="fab fa-discord"></i></div>
                                <div class="contact-text">
                                    <h3>Discord</h3>
                                    <p>rebkhei</p>
                                </div>
                            </li>
                            <li>
                                <div class="contact-icon"><i class="fab fa-whatsapp"></i></div>
                                <div class="contact-text">
                                    <h3>WhatsApp</h3>
                                    <a href="https://wa.me/639945324891" target="_blank">+63 994 532 4891</a>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="glass-card">
                        <h2>Send a Message</h2>

                        <?php if ($formStatusMsg): ?>
                        <div class="status-alert <?= $formStatusType ?>">
                            <i class="fas <?= $formStatusType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?>"></i>
                            <?= htmlspecialchars($formStatusMsg) ?>
                        </div>
                        <?php endif; ?>

                        <div id="formStatus"></div>

                        <form id="contactForm" method="POST">
                            <input type="hidden" name="action" value="submit_message">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="name">Your Name</label>
                                    <input type="text" id="name" name="name" required placeholder="John Doe">
                                </div>
                                <div class="form-group">
                                    <label for="email">Your Email</label>
                                    <input type="email" id="email" name="email" required placeholder="john@example.com">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="subject">Subject</label>
                                <input type="text" id="subject" name="subject" required placeholder="Project Inquiry">
                            </div>
                            <div class="form-group">
                                <label for="message">Your Message</label>
                                <textarea id="message" name="message" required placeholder="Tell me about your project or idea..."></textarea>
                            </div>

                            <button type="submit" class="submit-btn" id="submitBtn">Send Message</button>
                        </form>
                    </div>
                </div>

                <section class="admin-section" id="admin-inbox">
                    <div class="admin-head">
                        <h2><i class="fas fa-database"></i> SQLITE MESSAGES DATABASE</h2>
                        <?php if ($isLoggedIn): ?>
                        <div>
                            <span style="color: #00FFF0; margin-right: 1rem;">TOTAL: <?= $totalCount ?> | UNREAD: <?= $unreadCount ?></span>
                            <a href="contact.php?action=logout" class="btn-sharp btn-danger"><i class="fas fa-power-off"></i> LOGOUT</a>
                        </div>
                        <?php endif; ?>
                    </div>

                    <?php if (!$isLoggedIn): ?>
                    <div class="admin-login-box">
                        <div style="font-size: 1.5rem; color: #00FFF0; margin-bottom: 0.5rem;"><i class="fas fa-lock"></i> ADMIN ACCESS</div>
                        <p style="font-size: 0.8rem; color: #8F9BB3; margin-bottom: 1rem;">Enter security password to view saved messages.</p>

                        <?php if ($loginErrorMsg): ?>
                        <div style="color: #FF3366; font-size: 0.8rem; margin-bottom: 1rem;"><?= htmlspecialchars($loginErrorMsg) ?></div>
                        <?php endif; ?>

                        <form method="POST">
                            <input type="hidden" name="action" value="admin_login">
                            <input type="password" name="password" placeholder="ENTER ACCESS KEY" required>
                            <button type="submit" class="btn-sharp btn-cyan" style="width: 100%; justify-content: center;">[ UNLOCK INBOX ]</button>
                        </form>
                    </div>
                    <?php else: ?>
                    <?php if (empty($messages)): ?>
                    <div style="text-align: center; padding: 3rem; color: #8F9BB3;">// NO MESSAGES STORED IN SQLITE DATABASE</div>
                    <?php else: ?>
                    <?php foreach ($messages as $msg): ?>
                    <div class="msg-box <?= $msg['is_read'] == 0 ? 'unread' : '' ?>">
                        <div class="msg-meta">
                            <div>
                                <strong style="color: #FFF; font-size: 1rem;"><?= htmlspecialchars($msg['name']) ?></strong>
                                &lt;<a href="mailto:<?= htmlspecialchars($msg['email']) ?>" style="color: #00FFF0; text-decoration: none;"><?= htmlspecialchars($msg['email']) ?></a>&gt;
                            </div>
                            <div>
                                <span><?= htmlspecialchars($msg['created_at']) ?></span>
                                <span style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; border: 1px solid #262B3D; color: <?= $msg['is_read'] == 0 ? '#00FFF0' : '#8F9BB3' ?>;">
                                <?= $msg['is_read'] == 0 ? 'UNREAD' : 'READ' ?>
                                </span>
                            </div>
                        </div>
                        <div><strong style="color: #FF7A00;">[SUBJECT]:</strong> <?= htmlspecialchars($msg['subject']) ?></div>
                        <div class="msg-body"><?= htmlspecialchars($msg['message']) ?></div>
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="action" value="toggle_read">
                                <input type="hidden" name="id" value="<?= $msg['id'] ?>">
                                <button type="submit" class="btn-sharp btn-cyan">
                                <?= $msg['is_read'] == 0 ? '[ MARK READ ]' : '[ MARK UNREAD ]' ?>
                                </button>
                            </form>
                            <form method="POST" style="display: inline;" onsubmit="return confirm('Delete message?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $msg['id'] ?>">
                                <button type="submit" class="btn-sharp btn-danger">[ DELETE ]</button>
                            </form>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <?php endif; ?>
                    <?php endif; ?>
                </section>

                <div class="back-home">
                    <a href="../index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</a>
                </div>
            </div>
        </main>

        <footer style="text-align: center; padding: 2rem; color: var(--text-tertiary); font-size: 0.85rem; border-top: 1px solid var(--glass-border);">
            <div class="container">
                <p>&copy; 2025 Rebienald Carpio. All Rights Reserved. Engineered to scale.</p>
            </div>
        </footer>

        <script src="contacts.js">

        </script>
    </body>
</html>
