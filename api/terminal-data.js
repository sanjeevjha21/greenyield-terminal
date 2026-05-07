export default async function handler(req, res) {
  const { country } = req.query;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
  const NEWS_KEY = process.env.NEWS_API_KEY;

  // GLOBAL MARKET MAPPING
  const marketMatrix = {
    "India": { ticker: "RELIANCE.NS", secondary: "HDFCBANK.NS", newsCode: "in", options: "NIFTY Futures / Reliance Calls" },
    "United States of America": { ticker: "NVDA", secondary: "AAPL", newsCode: "us", options: "SPY Puts / NVDA LEAPS" },
    "China": { ticker: "BABA", secondary: "700.HK", newsCode: "cn", options: "HKG33 Futures / BABA OTM Calls" },
    "Germany": { ticker: "SAP.DE", secondary: "VOW3.DE", newsCode: "de", options: "DAX Futures / SAP Protective Puts" },
    "United Kingdom": { ticker: "BP.L", secondary: "HSBA.L", newsCode: "gb", options: "FTSE 100 / BP Crude Swaps" },
    "Japan": { ticker: "7203.T", secondary: "9984.T", newsCode: "jp", options: "Nikkei 225 / Softbank Options" }
  };

  const config = marketMatrix[country] || { ticker: "AAPL", secondary: "MSFT", newsCode: "us", options: "Equity Only" };

  try {
    const [stockRes, newsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${config.ticker}&token=${FINNHUB_KEY}`),
      fetch(`https://newsapi.org/v2/top-headlines?country=${config.newsCode}&category=business&pageSize=5&apiKey=${NEWS_KEY}`)
    ]);

    const stock = await stockRes.json();
    const newsData = await newsRes.json();

    const newsPoints = newsData.articles ? newsData.articles.map(a => a.title).slice(0, 5) : ["No news uplink available"];
    
    // GENERATING DYNAMIC TREND TITLES
    const trends = [
      `1. Energy Sector Volatility in ${country}`,
      `2. ${config.ticker} Institutional Accumulation`,
      "3. Central Bank Interest Rate Pivot",
      "4. Cross-border Trade Flow Shift",
      "5. Domestic Consumer Sentiment Expansion"
    ];

    res.status(200).json({
      ticker: config.ticker,
      price: stock.c || "0.00",
      change: stock.dp || "0.00",
      news: newsPoints,
      trends: trends,
      investment: {
        primary: config.ticker,
        secondary: config.secondary,
        derivatives: config.options,
        risk: parseFloat(stock.dp) > 2 ? "HIGH" : "MODERATE"
      }
    });
  } catch (e) {
    res.status(500).json({ error: "SYSTEM_OFFLINE" });
  }
}
