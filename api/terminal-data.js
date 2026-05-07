export default async function handler(req, res) {
  const { country } = req.query;
  const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // Market Routing Logic
  const marketMap = {
    "India": "RELIANCE.NS",
    "United States of America": "AAPL",
    "Germany": "SAP.DE",
    "China": "BABA",
    "United Kingdom": "BP.L",
    "Japan": "7203.T"
  };
  const symbol = marketMap[country] || "AAPL"; // Fallback to Apple

  try {
    // 1. AI INTEL FETCH
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Analyze the current macro-economic landscape and energy sector for ${country}. Provide a high-level strategic intelligence brief in exactly 3 sentences.` }] }]
      })
    });
    
    const aiData = await aiRes.json();
    const whisper = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "NO_SIGNAL: ENCRYPTED_FEED_ERROR";

    // 2. MARKET DATA FETCH
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    res.status(200).json({
      whisper: whisper,
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00",
      symbol: symbol
    });

  } catch (error) {
    res.status(500).json({ whisper: "UPLINK_FAILURE: SECURE_CONNECTION_INTERRUPTED", price: "0.00", change: "0.00" });
  }
}
