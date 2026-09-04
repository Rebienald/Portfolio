const https = require("https");

// In-memory rate limiting store (IP -> array of timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;      // 1 minute window
const MAX_ALERTS_PER_WINDOW = 5;             // Maximum 5 downloads per minute
const MIN_COOLDOWN_MS = 1000;                // 1 second minimum cooldown

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
        return { allowed: false, reason: "Rate limit reached. Maximum 5 downloads per minute." };
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

const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|googlebot|bingbot|yandex|duckduckbot|baiduspider|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|headlesschrome|phantomjs|selenium|puppeteer|playwright|curl|wget|python|urllib|requests|axios|go-http-client|java/i;

function isBot(ua) {
    if (!ua || ua === "Unknown Browser / Device") return false;
    return BOT_REGEX.test(ua);
}

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
    }

    // Ignore browser prefetch and link preview requests
    const purpose = req.headers["purpose"] || req.headers["x-purpose"] || req.headers["sec-purpose"] || "";
    if (/prefetch|preview/i.test(purpose)) {
        return res.status(200).json({ status: "ignored", reason: "Prefetch ignored" });
    }

    // Ignore web crawlers, search engine indexers, and automated scrapers
    const userAgent = req.headers["user-agent"] || "Unknown Browser / Device";
    if (isBot(userAgent)) {
        return res.status(200).json({ status: "ignored", reason: "Automated crawler ignored" });
    }

    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
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
    const referer = req.headers["referer"] || "https://rebkhei.vercel.app/";

    const locationStr = [city, region, country].filter(Boolean).join(", ") || "Location Unavailable";

    const formattedDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        dateStyle: "full",
        timeStyle: "short"
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CV Download Notification</title>
</head>
<body style="margin:0;padding:24px;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111111;font-size:14px;line-height:1.5;">
  <div style="max-width:550px;margin:0 auto;border:1px solid #e0e0e0;border-radius:4px;padding:20px;">
    <h3 style="margin-top:0;margin-bottom:16px;font-size:16px;font-weight:bold;color:#000000;border-bottom:1px solid #e0e0e0;padding-bottom:8px;">
      CV Download Notification
    </h3>
    <p style="margin-top:0;margin-bottom:16px;color:#222222;font-size:14px;">
      A visitor downloaded your CV from your portfolio.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;width:120px;color:#333333;">File</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">Carpio Rebienald2.pdf (CV.pdf)</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">Date &amp; Time</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${formattedDate} (Manila Time)</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">Location</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${sanitize(locationStr)}</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">IP Address</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${sanitize(clientIp)}</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">Referrer</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${sanitize(referer)}</td>
      </tr>
      <tr>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold;color:#333333;">Device</td>
        <td style="padding:8px 10px;border:1px solid #e0e0e0;color:#111111;">${sanitize(userAgent)}</td>
      </tr>
    </table>
    <div style="font-size:12px;color:#666666;border-top:1px solid #eeeeee;padding-top:10px;">
      Automated notification from rebkhei.vercel.app
    </div>
  </div>
</body>
</html>`.trim();

    const textContent = `CV Download Notification\n\nA visitor downloaded your CV from your portfolio.\n\nFile: Carpio Rebienald2.pdf (CV.pdf)\nDate & Time: ${formattedDate} (Manila Time)\nLocation: ${locationStr}\nIP Address: ${clientIp}\nReferrer: ${referer}\nDevice: ${userAgent}\n\nAutomated notification from rebkhei.vercel.app`;

    const payload = JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        subject: `CV Download Notification - Carpio Rebienald2.pdf`,
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
