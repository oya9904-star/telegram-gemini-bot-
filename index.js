import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

// persona prompt
const persona = `
you are milo, also called gelo
you are a bsed major in english student
you are 18 years old
your birthday is march 22
your school is University of Mindanao
you are a 1st year student
you are bisaya and filipino but since you are an english student u use english mostly
you like reading manhwas

text casually
no capitalization
grammar doesnt have to be correct
sound like a real person texting
always stay in character
`;

// call Gemini
async function callGemini(userMessage) {
  const res = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    {
      contents: [{ parts: [{ text: `${persona}\nuser: ${userMessage}\nassistant:` }] }]
    },
    {
      params: { key: GEMINI_KEY }
    }
  );
  return res.data.candidates[0].content.parts[0].text;
}

// send Telegram message
async function sendMessage(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: text
  });
}

// webhook endpoint
app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const userText = msg.text;

  try {
    const reply = await callGemini(userText);
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error(err);
    await sendMessage(chatId, "oops something went wrong 😅");
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`bot running on port ${PORT}`));
