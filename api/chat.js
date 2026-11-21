const { getRAGContext, queryAI, saveToGeneralBrain } = require("../shared_rag.js");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }
    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
        const userMsg = (body.message || "").trim().slice(0, 300);
        const history = Array.isArray(body.history) ? body.history : [];
        const sessionId = String(body.session_id || body.sessionId || "anonymous").slice(0, 80);
        if (!userMsg) {
            return res.status(400).json({
                error: "Message is required",
            });
        }
        const ragContext = await getRAGContext(userMsg, history);
        const reply = await queryAI(userMsg, ragContext, history);
        await saveToGeneralBrain(sessionId, userMsg, reply);
        return res.status(200).json({
            status: "success",
            response: reply,
        });
    } catch (err) {
        console.error("API Chat Handler Error:", err);
        return res.status(500).json({
            error: "Server Error",
        });
    }
};
