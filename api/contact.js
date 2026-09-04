const https = require("https");

// In-memory rate limiting store (IP -> array of timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes window
const MAX_MESSAGES_PER_WINDOW = 3;            // Max 3 messages per window
const MIN_COOLDOWN_MS = 20 * 1000;           // 20 seconds minimum cooldown between sends

// Periodic cleanup of old rate limit records (every 15 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimitMap.entries()) {
        const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
        if (valid.length === 0) {
            rateLimitMap.delete(ip);
        } else {
            rateLimitMap.set(ip, valid);
        }
    }
}, 15 * 60 * 1000);

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return String(forwarded).split(",")[0].trim();
    }
    return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown-ip";
}

function checkRateLimit(ip) {
    const now = Date.now();
    let timestamps = rateLimitMap.get(ip) || [];

    // Filter out timestamps older than the rate limit window
    timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

    // 1. Check cooldown between successive submissions
    if (timestamps.length > 0) {
        const lastSent = timestamps[timestamps.length - 1];
        const elapsed = now - lastSent;
        if (elapsed < MIN_COOLDOWN_MS) {
            const waitSec = Math.ceil((MIN_COOLDOWN_MS - elapsed) / 1000);
            return {
                allowed: false,
                reason: `Please wait ${waitSec} second${waitSec > 1 ? "s" : ""} before sending another message.`
            };
        }
    }

    // 2. Check total messages in the window
    if (timestamps.length >= MAX_MESSAGES_PER_WINDOW) {
        const oldest = timestamps[0];
        const resetMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 60000);
        return {
            allowed: false,
            reason: `Rate limit exceeded. Maximum 3 messages allowed per 10 minutes. Please try again in ~${resetMinutes} minute${resetMinutes > 1 ? "s" : ""}.`
        };
    }

    // Record this request timestamp
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    return { allowed: true };
}

function sanitizeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // Enforce Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
        res.setHeader("Retry-After", "30");
        return res.status(429).json({ error: rateLimitCheck.reason });
    }

    try {
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return res.status(400).json({ error: "Invalid JSON body" });
            }
        }

        const name = (body.name || "").trim().slice(0, 80);
        const email = (body.email || "").trim().slice(0, 120);
        const subject = (body.subject || "").trim().slice(0, 150);
        const message = (body.message || "").trim().slice(0, 3000);

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: "All fields (name, email, subject, message) are required." });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Please provide a valid email address." });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error("Missing RESEND_API_KEY environment variable");
            return res.status(500).json({
                error: "Server email configuration is missing. Please configure RESEND_API_KEY in environment variables."
            });
        }

        const recipientEmail = process.env.CONTACT_EMAIL || "rebkheicarpio@gmail.com";
        const senderEmail = process.env.RESEND_FROM || "Reb Portfolio <onboarding@resend.dev>";

        const safeName = sanitizeHtml(name);
        const safeEmail = sanitizeHtml(email);
        const safeSubject = sanitizeHtml(subject);
        const safeMessage = sanitizeHtml(message).replace(/\n/g, "<br/>");
        const formattedDate = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            dateStyle: "full",
            timeStyle: "short"
        });

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Contact Form Message</title>
</head>
<body style="margin:0;padding:24px;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111111;font-size:14px;line-height:1.5;">
  <div style="max-width:550px;margin:0 auto;border:1px solid #e0e0e0;border-radius:4px;padding:20px;">
    <h3 style="margin-top:0;margin-bottom:16px;font-size:16px;font-weight:bold;color:#000000;border-bottom:1px solid #e0e0e0;padding-bottom:8px;">
      New Contact Form Message
    </h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;width:100px;color:#333333;">From</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${safeName} &lt;${safeEmail}&gt;</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">Subject</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${safeSubject}</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">Date &amp; Time</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${formattedDate}</td>
      </tr>
    </table>
    <div style="font-weight:bold;font-size:13px;margin-bottom:6px;color:#333333;">Message:</div>
    <div style="padding:12px;border:1px solid #e0e0e0;background-color:#fafafa;border-radius:4px;white-space:pre-wrap;font-size:13px;color:#111111;margin-bottom:16px;line-height:1.5;">${safeMessage}</div>
    <div style="font-size:12px;color:#666666;border-top:1px solid #eeeeee;padding-top:10px;">
      Automated notification from rebkhei.vercel.app
    </div>
  </div>
</body>
</html>`.trim();

        const textContent = `New Message from Portfolio Contact Form\n\nFrom: ${name} <${email}>\nSubject: ${subject}\nDate: ${formattedDate}\n\nMessage:\n${message}\n\nReply directly to: ${email}`;

        const payload = JSON.stringify({
            from: senderEmail,
            to: [recipientEmail],
            reply_to: email,
            subject: `Contact Form: ${safeName} - ${safeSubject}`,
            html: htmlContent,
            text: textContent,
            headers: {
                "X-Priority": "1",
                "Importance": "high"
            }
        });

        return new Promise((resolve) => {
            const apiReq = https.request({
                hostname: "api.resend.com",
                path: "/emails",
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload)
                }
            }, (apiRes) => {
                let responseData = "";
                apiRes.on("data", (chunk) => {
                    responseData += chunk;
                });
                apiRes.on("end", () => {
                    try {
                        const parsedRes = JSON.parse(responseData);
                        if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
                            res.status(200).json({
                                success: true,
                                message: "Message sent successfully!",
                                id: parsedRes.id
                            });
                        } else {
                            console.error("Resend API Error:", parsedRes);
                            res.status(apiRes.statusCode || 500).json({
                                error: parsedRes.message || "Failed to send email via Resend"
                            });
                        }
                    } catch (e) {
                        res.status(500).json({ error: "Failed to parse Resend API response" });
                    }
                    resolve();
                });
            });

            apiReq.on("error", (err) => {
                console.error("Resend Request Connection Error:", err);
                res.status(500).json({ error: "Failed to connect to email service." });
                resolve();
            });

            apiReq.write(payload);
            apiReq.end();
        });

    } catch (err) {
        console.error("Handler error:", err);
        return res.status(500).json({ error: "Internal server error occurred." });
    }
};
