export default async function handler(req, res) {
  const { country } = req.query;
  const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // Real-time Sector Routing
  const tickers = {
    "India": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"],
    "United States of America": ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN"],
    "Germany": ["SAP.DE", "SIE.DE", "VOW3.DE", "DBK.DE", "BAS.DE"]
  };
  const countryTickers = tickers[country] || ["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA"];

  try {
    // 1. FETCH PRIMARY MARKET DATA
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${countryTickers[0]}&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    // 2. AI DEEP SCAN (TOP 5s)
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a Bloomberg Intelligence Terminal. For ${country}, provide a detailed report:
        1. TOP 5 HEADLINES: List 5 major geopolitical/economic news items.
        2. TOP 5 TRENDS: List 5 macro trends (e.g., Green Energy shift, Inflation, AI growth).
        3. TOP 5 INVESTMENT PICKS: List 5 specific assets/stocks with a Risk Level (Low/Med/High) and a 1-sentence logic.
        Use a professional, high-density format.` }] }]
      })
    });
    const aiData = await aiRes.json();
    const report = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "FEED_TIMEOUT";

    res.status(200).json({
      report: report,
      primaryTicker: countryTickers[0],
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00",
      tickerList: countryTickers.join(", ")
    });
  } catch (e) {
    res.status(500).json({ error: "UPLINK_FAILURE" });
  }
}
