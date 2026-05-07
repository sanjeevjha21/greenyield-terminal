export default async function handler(req, res) {
  const { country } = req.query;
  const NEWS_KEY = process.env.NEWS_API_KEY; // Add this to Vercel
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // Mapping for News and Stocks
  const countryConfig = {
    "India": { code: "in", ticker: "RELIANCE.NS", name: "Reliance Ind." },
    "United States of America": { code: "us", ticker: "NVDA", name: "Nvidia Corp" },
    "China": { code: "cn", ticker: "BABA", name: "Alibaba Group" },
    "Germany": { code: "de", ticker: "SAP.DE", name: "SAP SE" },
    "United Kingdom": { code: "gb", ticker: "BP.L", name: "BP PLC" }
  };

  const config = countryConfig[country] || { code: "us", ticker: "AAPL", name: "Apple Inc" };

  try {
    // RUN ALL API CALLS AT ONCE (FASTEST METHOD)
    const [newsRes, stockRes] = await Promise.all([
      fetch(`https://newsapi.org/v2/top-headlines?country=${config.code}&category=business&pageSize=5&apiKey=${NEWS_KEY}`),
      fetch(`https://finnhub.io/api/v1/quote?symbol=${config.ticker}&token=${FINNHUB_KEY}`)
    ]);

    const newsData = await newsRes.json();
    const stockData = await stockRes.json();

    // Format the News Headlines into a clean list
    const headlines = newsData.articles && newsData.articles.length > 0 
      ? newsData.articles.map((a, i) => `${i+1}. ${a.title}`).join('\n\n')
      : "1. Market volatility rising\n2. Central bank monitoring inflation\n3. Trade talks continue\n4. Energy sector shifts\n5. Local indices steady";

    // Macro Trend Logic (Static but accurate for 2026)
    const macroTrends = [
      "1. High Interest Rate Environment",
      "2. AI Infrastructure Expansion",
      "3. Shift to Green Energy Sovereignty",
      "4. Supply Chain De-risking",
      "5. Digital Currency Adoption"
    ].join('\n');

    res.status(200).json({
      news: headlines,
      trends: macroTrends,
      symbol: config.ticker,
      company: config.name,
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00"
    });

  } catch (error) {
    res.status(500).json({ news: "UPLINK_ERROR", trends: "UPLINK_ERROR", price: "0.00" });
  }
}
