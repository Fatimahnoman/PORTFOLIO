const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Add OpenAI support
const { OpenAI } = require("openai");
const fs = require('fs');
const path = require('path');
const portfolioData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/portfolio-data.json'), 'utf8'));

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseURL: "https://openrouter.ai/api/v1",
});

const app = express();

// Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Serve static files from the root directory (so images like portfoliopic.png work)
app.use(express.static(path.join(__dirname, '../')));

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
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

        // Prepare messages for OpenAI format
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
        // Strip potential markdown code blocks
        const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '');
        const responseObj = JSON.parse(cleanedContent);
        res.json({ role: "model", content: responseObj.answer, suggestions: responseObj.suggestions });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

// Serve the work.html file on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Transporter configuration...
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint to handle form submissions
app.post('/send', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('Please fill out all fields.');
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Sending to yourself
        replyTo: email,
        subject: `New Portfolio Message from ${name}`,
        text: `You received a new message from your portfolio!\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>New Message from Portfolio</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
