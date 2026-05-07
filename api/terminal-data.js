export default async function handler(req, res) {
  const { country } = req.query;
  const GEMINI_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  try {
    // Gemini Call
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a Bloomberg terminal. In 2 sentences, provide a financial and energy whisper for ${country}.` }] }]
      })
    });
    const geminiData = await geminiRes.json();
    const whisper = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Signal interrupted.";

    // Finnhub Call (Apple as Proxy)
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    res.status(200).json({
      whisper: whisper,
      price: stockData.c || "0.00"
    });
  } catch (error) {
    res.status(500).json({ error: "System Error" });
  }
}