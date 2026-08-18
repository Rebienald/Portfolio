const https = require("https");

const SUPABASE_GB_URL = "https://ngjckggjadtoevbnhjhi.supabase.co/rest/v1/comments";
const SUPABASE_GB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_zFd8VxxbMxpu7wFblnC36w_8Np8JVVf";

const DEFAULT_GUESTBOOK = [
    {
        id: "gb_reb_1",
        name: "Reb",
        role: "Developer",
        rating: 5,
        message: "Try leaving a note!",
        date: "Aug 16, 2026",
        likes: 0
    }
];

function sanitizeInput(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "GET") {
        return new Promise((resolve) => {
            const reqClient = https.get(`${SUPABASE_GB_URL}?select=*&order=id.desc`, {
                headers: {
                    "apikey": SUPABASE_GB_KEY,
                    "Authorization": `Bearer ${SUPABASE_GB_KEY}`
                }
            }, (sbRes) => {
                let sbData = "";
                sbRes.on("data", (chunk) => sbData += chunk);
                sbRes.on("end", () => {
                    try {
                        const parsed = JSON.parse(sbData);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            res.status(200).json({ status: "success", entries: parsed, source: "supabase" });
                            return resolve();
                        }
                    } catch (e) {}
                    res.status(200).json({ status: "success", entries: DEFAULT_GUESTBOOK, source: "local" });
                    return resolve();
                });
            });
            reqClient.on("error", () => {
                res.status(200).json({ status: "success", entries: DEFAULT_GUESTBOOK, source: "local" });
                return resolve();
            });
        });
    }

    if (req.method === "POST") {
        try {
            let parsed = req.body;
            if (typeof req.body === "string") {
                try { parsed = JSON.parse(req.body); } catch (e) { parsed = {}; }
            }

            const name = sanitizeInput((parsed.name || "").trim().slice(0, 50));
            const role = sanitizeInput((parsed.role || "Visitor").trim().slice(0, 50));
            const message = sanitizeInput((parsed.message || "").trim().slice(0, 300));
            const rating = Math.min(5, Math.max(1, parseInt(parsed.rating) || 5));

            if (!name || !message) {
                return res.status(400).json({ error: "Name and message are required." });
            }

            const newEntry = {
                id: "gb_" + Date.now(),
                name,
                role: role || "Visitor",
                rating,
                message,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                likes: 0
            };

            // Post to Supabase Cloud DB
            try {
                const sbReqData = JSON.stringify(newEntry);
                const parsedUrl = new URL(SUPABASE_GB_URL);
                const sbReq = https.request({
                    hostname: parsedUrl.hostname,
                    path: parsedUrl.pathname,
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_GB_KEY,
                        "Authorization": `Bearer ${SUPABASE_GB_KEY}`,
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(sbReqData)
                    }
                });
                sbReq.on("error", () => {});
                sbReq.write(sbReqData);
                sbReq.end();
            } catch (e) {}

            return res.status(200).json({ status: "success", entry: newEntry });
        } catch (err) {
            return res.status(500).json({ error: "Server Error" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
