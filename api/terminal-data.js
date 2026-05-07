export default async function handler(req, res) {
  const { country } = req.query;
  const GEMINI_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  try {
    // 1. AI Analysis
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Act as a Bloomberg senior analyst. Provide 2 punchy, professional sentences on the current geopolitical energy trends and market stability for ${country}.` }] }]
      })
    });
    const geminiData = await geminiRes.json();
    const whisper = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Signal lost.";

    // 2. Market Pulse (Apple as proxy)
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    res.status(200).json({
      whisper: whisper,
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00" // Daily Percentage Change
    });
  } catch (error) {
    res.status(500).json({ error: "Intelligence Link Failed" });
  }
}