const https = require("https");

// In-memory rate limiting store (IP -> array of timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ALERTS_PER_WINDOW = 3;             // Max 3 download alerts per 10 mins per IP
const MIN_COOLDOWN_MS = 15 * 1000;           // 15 seconds cooldown

const cleanupTimer = setInterval(() => {
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
if (cleanupTimer && cleanupTimer.unref) {
    cleanupTimer.unref();
}

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return String(forwarded).split(",")[0].trim();
    }
    return req.headers["x-real-ip"] || req.socket?.remoteAddress || "Unknown IP";
}

function checkRateLimit(ip) {
    const now = Date.now();
    let timestamps = rateLimitMap.get(ip) || [];
    timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

    if (timestamps.length > 0) {
        const lastSent = timestamps[timestamps.length - 1];
        if (now - lastSent < MIN_COOLDOWN_MS) {
            return { allowed: false, reason: "Cooldown active" };
        }
    }

    if (timestamps.length >= MAX_ALERTS_PER_WINDOW) {
        return { allowed: false, reason: "Rate limit reached" };
    }

    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    return { allowed: true };
}

function sanitize(str) {
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

    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
        // Return 200 silently to frontend so user experience is not disrupted
        return res.status(200).json({ status: "ignored", reason: rateCheck.reason });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        console.error("Missing RESEND_API_KEY environment variable");
        return res.status(500).json({
            error: "Email service not configured. RESEND_API_KEY missing."
        });
    }

    const recipientEmail = process.env.CONTACT_EMAIL || "rebkheicarpio@gmail.com";
    const senderEmail = process.env.RESEND_FROM || "Reb Portfolio <onboarding@resend.dev>";

    // Extract geo & request information
    const city = req.headers["x-vercel-ip-city"] || "";
    const country = req.headers["x-vercel-ip-country"] || "";
    const region = req.headers["x-vercel-ip-country-region"] || "";
    const userAgent = req.headers["user-agent"] || "Unknown Browser / Device";
    const referer = req.headers["referer"] || "https://rebkhei.vercel.app/";

    const locationStr = [city, region, country].filter(Boolean).join(", ") || "Location Unavailable";

    const formattedDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        dateStyle: "full",
        timeStyle: "short"
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060608; color: #FFFFFF; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #121319; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #1f202b 0%, #0d0e12 100%); padding: 28px; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
    .badge { display: inline-block; background: rgba(212, 175, 55, 0.15); color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.3); margin-bottom: 12px; }
    .title { margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; }
    .content { padding: 28px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .meta-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); vertical-align: top; }
    .meta-label { color: #D4AF37; font-weight: 600; width: 120px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .meta-value { color: #E5E7EB; word-break: break-word; }
    .highlight-box { background: rgba(212, 175, 55, 0.08); border-left: 3px solid #D4AF37; border-radius: 8px; padding: 16px 20px; color: #F3F4F6; font-size: 14px; margin-bottom: 20px; }
    .footer { padding: 20px 28px; background: #0a0b0e; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #9CA3AF; text-align: center; }
    .btn { display: inline-block; margin-top: 12px; padding: 10px 22px; background: #D4AF37; color: #060608; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Activity Alert</span>
      <h1 class="title">📄 Someone Just Downloaded Your CV!</h1>
    </div>
    <div class="content">
      <div class="highlight-box">
        A visitor clicked the <strong>Download CV</strong> button on your portfolio website.
      </div>
      <table class="meta-table">
        <tr>
          <td class="meta-label">File Downloaded:</td>
          <td class="meta-value"><strong>Carpio Rebienald2.pdf (CV.pdf)</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Date & Time:</td>
          <td class="meta-value">${formattedDate} (Manila Time)</td>
        </tr>
        <tr>
          <td class="meta-label">Estimated Location:</td>
          <td class="meta-value">${sanitize(locationStr)}</td>
        </tr>
        <tr>
          <td class="meta-label">IP Address:</td>
          <td class="meta-value">${sanitize(clientIp)}</td>
        </tr>
        <tr>
          <td class="meta-label">Referrer Page:</td>
          <td class="meta-value"><a href="${sanitize(referer)}" style="color: #D4AF37; text-decoration: none;">${sanitize(referer)}</a></td>
        </tr>
        <tr>
          <td class="meta-label">Browser / Device:</td>
          <td class="meta-value" style="font-size: 12px; color: #9CA3AF;">${sanitize(userAgent)}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://rebkhei.vercel.app" class="btn">View Live Portfolio &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Automated visitor alert from your Personal Portfolio (<a href="https://rebkhei.vercel.app" style="color: #D4AF37; text-decoration:none;">rebkhei.vercel.app</a>) via Resend.
    </div>
  </div>
</body>
</html>
    `.trim();

    const textContent = `📄 CV Download Alert: Someone just downloaded your CV!\n\nFile: Carpio Rebienald2.pdf (CV.pdf)\nDate: ${formattedDate}\nLocation: ${locationStr}\nIP: ${clientIp}\nReferrer: ${referer}\nDevice: ${userAgent}`;

    const payload = JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        subject: `📄 CV Download Alert: Someone downloaded your CV!`,
        html: htmlContent,
        text: textContent
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
            apiRes.on("data", chunk => (responseData += chunk));
            apiRes.on("end", () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
                        res.status(200).json({ success: true, id: parsed.id });
                    } else {
                        console.error("Resend API error:", parsed);
                        res.status(apiRes.statusCode || 500).json({ error: parsed.message || "Email send failed" });
                    }
                } catch (e) {
                    res.status(500).json({ error: "Failed to parse email service response" });
                }
                resolve();
            });
        });

        apiReq.on("error", (err) => {
            console.error("Resend connection error:", err);
            res.status(500).json({ error: "Connection error" });
            resolve();
        });

        apiReq.write(payload);
        apiReq.end();
    });
};
