// api/terminal-data.js
export default async function handler(req, res) {
  // 1. Get the country name from the Globe click
  const { country } = req.query;

  // 2. Secretly pull your keys from Vercel's Environment Variables
  const GEMINI_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  try {
    // --- TASK A: FETCH AI WHISPER (Google Gemini) ---
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a Bloomberg terminal. Give a 2-sentence financial whisper about ${country} energy and markets.` }] }]
      })
    });
    const geminiData = await geminiRes.json();
    const whisper = geminiData.candidates[0].content.parts[0].text;

    // --- TASK B: FETCH LIVE STOCK (Finnhub) ---
    // Using Apple (AAPL) as a global market proxy
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    // 3. Send ONLY the data back to Sanjeev's Globe (No keys sent!)
    res.status(200).json({
      whisper: whisper,
      price: stockData.c,
      change: stockData.d
    });

  } catch (error) {
    res.status(500).json({ error: "Intelligence Link Failed" });
  }
}