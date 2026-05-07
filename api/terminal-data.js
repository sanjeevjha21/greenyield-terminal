export default async function handler(req, res) {
  const { country } = req.query;
  const NEWS_KEY = process.env.NEWS_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // ISO Mapping for Flags and News
  const isoMap = { "India": "IN", "Egypt": "EG", "China": "CN", "Germany": "DE", "United States of America": "US", "Japan": "JP", "United Kingdom": "GB" };
  const fCode = isoMap[country] || "US";

  try {
    // 1. DYNAMIC SEARCH & PARALLEL FETCH
    const [searchRes, newsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/search?q=${country}&token=${FINNHUB_KEY}`),
      // NEWS FIX: We search for the country name specifically to ensure unique results
      fetch(`https://newsapi.org/v2/everything?q=${country}+business&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_KEY}`)
    ]);

    const searchData = await searchRes.json();
    const newsData = await newsRes.json();

    const topAssets = searchData.result?.slice(0, 5) || [];
    const primarySymbol = topAssets[0]?.symbol || "AAPL";

    // 2. FETCH PRICE FOR PRIMARY ASSET
    const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${primarySymbol}&token=${FINNHUB_KEY}`);
    const stockData = await stockRes.json();

    // 3. GENERATE THE COMPREHENSIVE PORTFOLIO (Stocks + Options + Futures + Bonds + ESG)
    const portfolio = topAssets.map((asset, i) => {
      const instruments = ["CALL OPTION", "FUTURES", "EQUITY-LONG", "PUT OPTION", "LEAPS"];
      const bonds = [`${country} 2Y`, `${country} 5Y`, `${country} 10Y`, `${country} 30Y`, "Sovereign"];
      const esg = ["Solar Infrastructure", "Wind Farm Project", "EV Supply Chain", "Green Hydrogen", "Hydro Power"];
      
      return {
        stock: asset.symbol,
        instrument: instruments[i % instruments.length],
        bond: bonds[i % bonds.length],
        green: esg[i % esg.length],
        risk: i % 2 === 0 ? "HIGH" : "MODERATE"
      };
    });

    res.status(200).json({
      ticker: primarySymbol,
      label: topAssets[0]?.description || "Global Asset",
      price: stockData.c || "0.00",
      change: stockData.dp || "0.00",
      flag: `https://flagsapi.com/${fCode}/flat/64.png`,
      news: newsData.articles?.map(a => a.title) || ["Searching Backup Feeds..."],
      portfolio: portfolio
    });
  } catch (e) {
    res.status(500).json({ error: true });
  }
}
