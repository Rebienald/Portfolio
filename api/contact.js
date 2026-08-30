const https = require("https");

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

    try {
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return res.status(400).json({ error: "Invalid JSON body" });
            }
        }

        const name = (body.name || "").trim();
        const email = (body.email || "").trim();
        const subject = (body.subject || "").trim();
        const message = (body.message || "").trim();

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

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060608; color: #FFFFFF; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #121319; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #181922 0%, #0d0e12 100%); padding: 28px; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
    .badge { display: inline-block; background: rgba(212, 175, 55, 0.15); color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.3); margin-bottom: 12px; }
    .title { margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; }
    .content { padding: 28px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .meta-table td { padding: 8px 0; font-size: 14px; vertical-align: top; }
    .meta-label { color: #D4AF37; font-weight: 600; width: 90px; text-transform: uppercase; font-size: 12px; }
    .meta-value { color: #E5E7EB; }
    .meta-value a { color: #D4AF37; text-decoration: none; font-weight: 600; }
    .message-box { background: #060608; border-left: 3px solid #D4AF37; border-radius: 8px; padding: 18px 20px; color: #F3F4F6; font-size: 15px; line-height: 1.6; word-break: break-word; }
    .footer { padding: 20px 28px; background: #0a0b0e; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #9CA3AF; text-align: center; }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 22px; background: #D4AF37; color: #060608; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Portfolio Contact Form</span>
      <h1 class="title">New Message from ${safeName}</h1>
    </div>
    <div class="content">
      <table class="meta-table">
        <tr>
          <td class="meta-label">From:</td>
          <td class="meta-value"><strong>${safeName}</strong> &lt;<a href="mailto:${safeEmail}">${safeEmail}</a>&gt;</td>
        </tr>
        <tr>
          <td class="meta-label">Subject:</td>
          <td class="meta-value"><strong>${safeSubject}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Date:</td>
          <td class="meta-value">${formattedDate}</td>
        </tr>
      </table>

      <div style="font-size: 12px; color: #D4AF37; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">Message Body:</div>
      <div class="message-box">
        ${safeMessage}
      </div>

      <div style="text-align: center;">
        <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(subject)}" class="btn">Reply Directly to ${safeName} &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Sent from your Personal Portfolio (<a href="https://rebkhei.vercel.app" style="color: #D4AF37; text-decoration:none;">rebkhei.vercel.app</a>) via Resend.
    </div>
  </div>
</body>
</html>
        `.trim();

        const textContent = `New Message from Portfolio Contact Form\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nDate: ${formattedDate}\n\nMessage:\n${message}\n\nReply directly to: ${email}`;

        const payload = JSON.stringify({
            from: senderEmail,
            to: [recipientEmail],
            reply_to: email,
            subject: `[Portfolio Contact] ${name}: ${subject}`,
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
