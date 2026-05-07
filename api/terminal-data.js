export default async function handler(req, res) {
  const { country } = req.query;
  const NEWS_KEY = process.env.NEWS_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  try {
    // 1. DYNAMIC SEARCH FOR TOP 5 REGIONAL ASSETS
    const searchRes = await fetch(`https://finnhub.io/api/v1/search?q=${country}&token=${FINNHUB_KEY}`);
    const searchData = await searchRes.json();
    
    // Extract top 5 results
    const topAssets = searchData.result?.slice(0, 5).map(item => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type || "Equity"
    })) || [];

    // 2. NEWS & MARKET DATA FOR PRIMARY ASSET
    const primarySymbol = topAssets[0]?.symbol || "AAPL";
    const newsCodeMap = { "India": "in", "Egypt": "eg", "China": "cn", "Germany": "de", "United States of America": "us" };
    const newsCode = newsCodeMap[country] || "us";

    const [stockRes, newsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${primarySymbol}&token=${FINNHUB_KEY}`),
      fetch(`https://newsapi.org/v2/top-headlines?country=${newsCode}&category=business&pageSize=5&apiKey=${NEWS_KEY}`)
    ]);

    const stock = await stockRes.json();
    const newsData = await newsRes.json();

    // 3. GENERATE 5 TRADE IDEAS BASED ON SEARCH RESULTS
    const tradeIdeas = topAssets.map((asset, index) => {
      const types = ["CALL OPTION", "FUTURES", "EQUITY-LONG", "PUT OPTION", "LEAPS"];
      const risks = ["LOW", "MEDIUM", "HIGH", "SPECULATIVE", "MODERATE"];
      return {
        id: index + 1,
        asset: `${asset.symbol} (${asset.name})`,
        instrument: types[index % types.length],
        risk: risks[index % risks.length]
      };
    });

    res.status(200).json({
      ticker: primarySymbol,
      label: topAssets[0]?.name || "Regional Benchmark",
      price: stock.c || "0.00",
      change: stock.dp || "0.00",
      news: newsData.articles?.slice(0, 5).map(a => a.title) || [],
      tradeIdeas: tradeIdeas,
      trends: [
        `1. Institutional Flow into ${country}`,
        `2. ${primarySymbol} Liquidity Pivot`,
        "3. Sector Rotation Analysis",
        "4. Regional Macro Tailwinds",
        "5. Technical Breakout Potential"
      ]
    });
  } catch (e) {
    res.status(500).json({ error: true });
  }
}
