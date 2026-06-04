const { OpenAI } = require("openai");
const fs = require('fs');
const path = require('path');
const cors = require('cors')({ origin: true }); // Allow all origins

// Read portfolio data
const portfolioDataPath = path.join(__dirname, 'data', 'portfolio-data.json');
const portfolioData = JSON.parse(fs.readFileSync(portfolioDataPath, 'utf8'));

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseURL: "https://openrouter.ai/api/v1",
});

module.exports = async (req, res) => {
    // Manually handle preflight OPTIONS request
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    return new Promise((resolve, reject) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') {
                res.status(405).json({ error: 'Method Not Allowed' });
                return resolve();
            }

            try {
                const { messages } = req.body;
                
                const systemPrompt = {
                    role: "system",
                    content: `
                        You are Fatimah Noman's professional AI Recruitment Assistant. You are warm, friendly, intelligent, and highly conversational. You speak exactly like a human assistant, not a machine.

                        YOUR GOALS:
                        - Engage recruiters in a natural, professional human-like conversation.
                        - NEVER use report headers (like "Short explanation", "Technologies used", etc.).
                        - NEVER use bullet points unless specifically asked.
                        - Keep answers conversational, concise (2-5 sentences), and to the point.
                        - If you need to mention skills or projects, integrate them naturally into your sentences.
                        - Highlight Fatimah's expertise in Agentic AI and Full Stack development naturally in the flow of conversation.

                        RULES:
                        - Never make up information.
                        - Use ONLY the provided portfolio data below.
                        - If data is missing, say: "I'm sorry, I don't have information on that in Fatimah's portfolio. Would you like me to connect you with her directly via email?"
                        - MANDATORY: You must return the response in JSON format ONLY:
                        {
                            "answer": "Your warm, conversational answer here (2-5 sentences, human-like, no headers).",
                            "suggestions": ["Question 1", "Question 2", "Question 3", "Question 4"]
                        }

                        PORTFOLIO DATA:
                        ${JSON.stringify(portfolioData, null, 2)}
                    `
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

                const rawContent = completion.choices[0].message.content;
                const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '');
                const responseObj = JSON.parse(cleanedContent);
                res.status(200).json({ role: "model", content: responseObj.answer, suggestions: responseObj.suggestions });
                resolve();
            } catch (error) {
                console.error('Chat API Error:', error);
                res.status(500).json({ error: "Failed to generate response" });
                resolve();
            }
        });
    });
};
