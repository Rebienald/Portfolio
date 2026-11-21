const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { getRAGContext, queryAI } = require("./shared_rag.js");

const PORT = process.env.PORT || 10000;

http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        return res.end();
    }
    const GUESTBOOK_DIR = path.join(__dirname, "data");
    const GUESTBOOK_FILE = path.join(GUESTBOOK_DIR, "guestbook.json");
    const SUPABASE_GB_URL = "https://ngjckggjadtoevbnhjhi.supabase.co/rest/v1/comments";
    const SUPABASE_GB_KEY = "sb_publishable_zFd8VxxbMxpu7wFblnC36w_8Np8JVVf";
    const DEFAULT_GUESTBOOK = [
        {
            id: "gb_reb_1",
            name: "Reb",
            role: "Developer",
            rating: 5,
            message: "Try leaving a note!",
            date: "Aug 16, 2026",
            likes: 0,
        },
    ];
    function getGuestbookData() {
        try {
            if (!fs.existsSync(GUESTBOOK_DIR))
                fs.mkdirSync(GUESTBOOK_DIR, {
                    recursive: true,
                });
            if (!fs.existsSync(GUESTBOOK_FILE)) {
                fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(DEFAULT_GUESTBOOK, null, 2), "utf8");
                return DEFAULT_GUESTBOOK;
            }
            const raw = fs.readFileSync(GUESTBOOK_FILE, "utf8");
            return JSON.parse(raw || "[]");
        } catch (err) {
            return DEFAULT_GUESTBOOK;
        }
    }
    function saveGuestbookData(data) {
        try {
            if (!fs.existsSync(GUESTBOOK_DIR))
                fs.mkdirSync(GUESTBOOK_DIR, {
                    recursive: true,
                });
            fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(data, null, 2), "utf8");
        } catch (err) {}
    }
    function sanitizeInput(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    if (req.url === "/api/guestbook" && req.method === "GET") {
        try {
            const reqClient = https.get(
                `${SUPABASE_GB_URL}?select=*&order=id.desc`,
                {
                    headers: {
                        apikey: SUPABASE_GB_KEY,
                        Authorization: `Bearer ${SUPABASE_GB_KEY}`,
                    },
                },
                (sbRes) => {
                    let sbData = "";
                    sbRes.on("data", (chunk) => (sbData += chunk));
                    sbRes.on("end", () => {
                        try {
                            const parsed = JSON.parse(sbData);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                res.writeHead(200, {
                                    "Content-Type": "application/json",
                                });
                                return res.end(
                                    JSON.stringify({
                                        status: "success",
                                        entries: parsed,
                                        source: "supabase",
                                    })
                                );
                            }
                        } catch (e) {}
                        const entries = getGuestbookData();
                        res.writeHead(200, {
                            "Content-Type": "application/json",
                        });
                        return res.end(
                            JSON.stringify({
                                status: "success",
                                entries: entries,
                                source: "local",
                            })
                        );
                    });
                }
            );
            reqClient.on("error", () => {
                const entries = getGuestbookData();
                res.writeHead(200, {
                    "Content-Type": "application/json",
                });
                return res.end(
                    JSON.stringify({
                        status: "success",
                        entries: entries,
                        source: "local",
                    })
                );
            });
        } catch (err) {
            const entries = getGuestbookData();
            res.writeHead(200, {
                "Content-Type": "application/json",
            });
            return res.end(
                JSON.stringify({
                    status: "success",
                    entries: entries,
                    source: "local",
                })
            );
        }
        return;
    }
    if (req.url === "/api/guestbook" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const parsed = JSON.parse(body || "{}");
                const name = sanitizeInput((parsed.name || "").trim().slice(0, 50));
                const role = sanitizeInput((parsed.role || "Visitor").trim().slice(0, 50));
                const message = sanitizeInput((parsed.message || "").trim().slice(0, 300));
                const rating = Math.min(5, Math.max(1, parseInt(parsed.rating) || 5));
                if (!name || !message) {
                    res.writeHead(400, {
                        "Content-Type": "application/json",
                    });
                    return res.end(
                        JSON.stringify({
                            error: "Name and message are required.",
                        })
                    );
                }
                const newEntry = {
                    id: "gb_" + Date.now(),
                    name: name,
                    role: role || "Visitor",
                    rating: rating,
                    message: message,
                    date: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }),
                    likes: 0,
                };
                const entries = getGuestbookData();
                entries.unshift(newEntry);
                saveGuestbookData(entries);
                try {
                    const sbReqData = JSON.stringify(newEntry);
                    const parsedUrl = new URL(SUPABASE_GB_URL);
                    const sbReq = https.request({
                        hostname: parsedUrl.hostname,
                        path: parsedUrl.pathname,
                        method: "POST",
                        headers: {
                            apikey: SUPABASE_GB_KEY,
                            Authorization: `Bearer ${SUPABASE_GB_KEY}`,
                            "Content-Type": "application/json",
                            "Content-Length": Buffer.byteLength(sbReqData),
                        },
                    });
                    sbReq.on("error", () => {});
                    sbReq.write(sbReqData);
                    sbReq.end();
                } catch (e) {}
                res.writeHead(200, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        status: "success",
                        entry: newEntry,
                        entries: entries,
                    })
                );
            } catch (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        error: "Server Error",
                    })
                );
            }
        });
        return;
    }
    if (req.url === "/api/guestbook/like" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const parsed = JSON.parse(body || "{}");
                const id = parsed.id;
                const entries = getGuestbookData();
                const target = entries.find((e) => e.id === id);
                if (target) {
                    target.likes = (target.likes || 0) + 1;
                    saveGuestbookData(entries);
                    try {
                        const sbReqData = JSON.stringify({
                            likes: target.likes,
                        });
                        const parsedUrl = new URL(`${SUPABASE_GB_URL}?id=eq.${id}`);
                        const sbReq = https.request({
                            hostname: parsedUrl.hostname,
                            path: parsedUrl.pathname + parsedUrl.search,
                            method: "PATCH",
                            headers: {
                                apikey: SUPABASE_GB_KEY,
                                Authorization: `Bearer ${SUPABASE_GB_KEY}`,
                                "Content-Type": "application/json",
                                "Content-Length": Buffer.byteLength(sbReqData),
                            },
                        });
                        sbReq.on("error", () => {});
                        sbReq.write(sbReqData);
                        sbReq.end();
                    } catch (e) {}
                }
                res.writeHead(200, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        status: "success",
                        entries: entries,
                    })
                );
            } catch (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        error: "Server Error",
                    })
                );
            }
        });
        return;
    }
    if (req.url === "/api/chat" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const parsed = JSON.parse(body || "{}");
                const userMsg = (parsed.message || "").trim().slice(0, 300);
                const history = Array.isArray(parsed.history) ? parsed.history : [];
                if (!userMsg) {
                    res.writeHead(400, {
                        "Content-Type": "application/json",
                    });
                    return res.end(
                        JSON.stringify({
                            error: "Message is required",
                        })
                    );
                }
                const ragContext = await getRAGContext(userMsg, history);
                const reply = await queryAI(userMsg, ragContext, history);
                res.writeHead(200, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        status: "success",
                        response: reply,
                    })
                );
            } catch (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        error: "Server Error",
                    })
                );
            }
        });
        return;
    }
    if ((req.url === "/api/contact" || req.url === "/api/send") && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                req.body = body;
                res.status = function (code) {
                    return {
                        json: (data) => {
                            res.writeHead(code, {
                                "Content-Type": "application/json",
                            });
                            res.end(JSON.stringify(data));
                        },
                        end: () => {
                            res.writeHead(code);
                            res.end();
                        },
                    };
                };
                const contactHandler = require("./api/contact.js");
                await contactHandler(req, res);
            } catch (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        error: "Server Error",
                    })
                );
            }
        });
        return;
    }
    if (req.url === "/api/cv-download" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                req.body = body;
                res.status = function (code) {
                    return {
                        json: (data) => {
                            res.writeHead(code, {
                                "Content-Type": "application/json",
                            });
                            res.end(JSON.stringify(data));
                        },
                        end: () => {
                            res.writeHead(code);
                            res.end();
                        },
                    };
                };
                const cvHandler = require("./api/cv-download.js");
                await cvHandler(req, res);
            } catch (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                });
                res.end(
                    JSON.stringify({
                        error: "Server Error",
                    })
                );
            }
        });
        return;
    }
    const MIME_TYPES = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
    };
    const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, "");
    let filePath = path.join(__dirname, safePath === "/" ? "index.html" : safePath);
    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("Not Found");
        } else {
            res.writeHead(200, {
                "Content-Type": MIME_TYPES[ext] || "text/plain",
            });
            res.end(content);
        }
    });
}).listen(PORT, () => {
    console.log(`Render Backend Server running on port ${PORT}`);
});
