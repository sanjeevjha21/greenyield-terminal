export default async function handler(req, res) {
  const { country } = req.query;
  const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // Real-time Global Ticker Mapping
  const marketMap = {
    "India": "RELIANCE.NS",
    "United States of America": "AAPL",
    "Germany": "SAP.DE",
    "China": "BABA",
    "United Kingdom": "BP.L",
    "Japan": "7203.T", // Toyota
    "France": "MC.PA" // LVMH
  };
  const symbol = marketMap[country] || "MSFT"; // Default to Microsoft if country not in list

  try {
    // 1. FETCH REAL-TIME STOCK DATA
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    // 2. FETCH REAL-TIME NEWS & GEOPOLITICS (Using AI as a Filter)
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a Bloomberg Terminal. For the country ${country}, provide:
        - LATEST NEWS: 2 headlines from the last 24 hours.
        - GEOPOLITICS: 1 sentence on current stability.
        - ECONOMICS: 1 sentence on the central bank or inflation.
        - STOCK ANALYSIS: Why is ${symbol} moving today?` }] }]
      })
    });
    
    const aiData = await aiRes.json();
    const intel = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "FEED_OFFLINE";

    // 3. GENERATE BUY/SELL SIGNAL
    let signal = "NEUTRAL / HOLD";
    if (stockData.dp > 1) signal = "STRONG BUY";
    else if (stockData.dp > 0) signal = "ACCUMULATE";
    else if (stockData.dp < -1) signal = "STRONG SELL";

    res.status(200).json({
      intel: intel,
      symbol: symbol,
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00",
      action: signal
    });

  } catch (error) {
    res.status(500).json({ intel: "UPLINK_FAILURE", price: "ERR", change: "0" });
  }
}
