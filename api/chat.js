const { OpenAI } = require("openai");
const fs = require('fs');
const path = require('path');

// Read portfolio data
const portfolioDataPath = path.join(__dirname, 'data', 'portfolio-data.json');
const portfolioData = JSON.parse(fs.readFileSync(portfolioDataPath, 'utf8'));

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseURL: "https://openrouter.ai/api/v1",
});

module.exports = async (req, res) => {
    // 1. Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Process POST request
    try {
        const { messages } = req.body;
        
        const systemPrompt = {
            role: "system",
            content: `You are Fatimah Noman's professional AI Recruitment Assistant. You are warm, friendly, intelligent, and highly conversational. You speak exactly like a human assistant, not a machine.
                RULES:
                - Use ONLY the provided portfolio data.
                - Return JSON: {"answer": "...", "suggestions": ["...", "..."]}
                - If the user talks in Roman Urdu/Hindi, respond in Roman Urdu/Hindi in a friendly, helpful way.
                PORTFOLIO DATA: ${JSON.stringify(portfolioData)}`
        };

        const formattedMessages = [systemPrompt, ...messages.map(msg => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.content
        }))];

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-20b:free",
            messages: formattedMessages,
            response_format: { type: "json_object" }
        });

        const responseObj = JSON.parse(completion.choices[0].message.content);
        return res.status(200).json({ role: "model", content: responseObj.answer, suggestions: responseObj.suggestions });
    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(500).json({ error: "Failed to generate response" });
    }
};
