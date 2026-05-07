export default async function handler(req, res) {
  const { country } = req.query;
  const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // Real-time Mapping
  const tickers = {
    "India": "RELIANCE.NS",
    "United States of America": "NVDA",
    "China": "BABA",
    "Germany": "SAP.DE",
    "United Kingdom": "HSBA.L"
  };
  const symbol = tickers[country] || "AAPL";

  try {
    // 1. FAST AI UPLINK (Optimized to prevent timeout)
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Provide a Bloomberg-style briefing for ${country} in short bullet points:
        - 5 LATEST NEWS HEADLINES
        - 5 MACRO TRENDS
        - 5 INVESTMENT PICKS with Risk Level (Low/Med/High)` }] }]
      })
    });
    const aiData = await aiRes.json();
    const report = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "FEED_RETRY_REQUIRED";

    // 2. MARKET DATA
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    res.status(200).json({
      report: report,
      symbol: symbol,
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00"
    });
  } catch (e) {
    res.status(500).json({ error: "TIMEOUT_OR_CONNECTION_ERROR" });
  }
}
