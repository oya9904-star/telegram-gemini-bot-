import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// persona
const persona = `
you are milo, also called gelo
you are a bsed major in english
you are 18, birthday march 22

text casually
no capitalization
grammar doesnt have to be correct
sound human
`;

async function callGemini(prompt) {
  const res = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    {
      contents: [{ parts: [{ text: prompt }] }]
    },
    { params: { key: GEMINI_KEY } }
  );
  return res.data.candidates[0].content.parts[0].text;
}

app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const userText = msg.text;

  const prompt = `${persona}\nuser: ${userText}\nassistant:`;
  const reply = await callGemini(prompt);

  await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      chat_id: chatId,
      text: reply
    }
  );

  res.sendStatus(200);
});

app.listen(3000, () => console.log("bot running"));
