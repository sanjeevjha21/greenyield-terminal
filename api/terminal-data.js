export default async function handler(req, res) {
  const { country } = req.query;
  const NEWS_KEY = process.env.NEWS_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // VERIFIED REGISTRY: Mapping Globe Names to ISO and Tickers
  const registry = {
    "India": { iso: "IN", ticker: "RELIANCE.NS", bench: "NIFTY 50" },
    "Egypt": { iso: "EG", ticker: "HRHO.CA", bench: "EGX 30" },
    "China": { iso: "CN", ticker: "BABA", bench: "CSI 300" },
    "Germany": { iso: "DE", ticker: "SAP.DE", bench: "DAX" },
    "Japan": { iso: "JP", ticker: "7203.T", bench: "NIKKEI 225" },
    "United States of America": { iso: "US", ticker: "NVDA", bench: "S&P 500" },
    "United Kingdom": { iso: "GB", ticker: "BP.L", bench: "FTSE 100" },
    "Brazil": { iso: "BR", ticker: "VALE3.SA", bench: "IBOVESPA" },
    "France": { iso: "FR", ticker: "MC.PA", bench: "CAC 40" }
  };

  const config = registry[country];

  try {
    // Strategic News Query: Country name + Finance/Economics
    const query = encodeURIComponent(`"${country}" AND (geopolitics OR macroeconomics)`);
    
    const [newsRes, stockRes] = await Promise.all([
      fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=relevancy&pageSize=5&apiKey=${NEWS_KEY}`),
      config ? fetch(`https://finnhub.io/api/v1/quote?symbol=${config.ticker}&token=${FINNHUB_KEY}`) : Promise.resolve(null)
    ]);

    const newsData = await newsRes.json();
    const stock = stockRes ? await stockRes.json() : null;

    res.status(200).json({
      fullName: country,
      iso: config ? config.iso : null,
      flag: config ? `https://flagsapi.com/${config.iso}/flat/64.png` : null,
      news: newsData.articles?.map(a => a.title).slice(0, 5) || ["Searching regional archives..."],
      price: stock?.c || "0.00",
      change: stock?.dp || "0.00",
      bench: config?.bench || "GLOBAL BENCHMARK",
      ticker: config?.ticker || "N/A",
      portfolio: [
        { cat: "EQUITY", asset: config?.ticker || "N/A", type: "Spot" },
        { cat: "FIXED INCOME", asset: `${country} 10Y`, type: "Govt Bond" },
        { cat: "ESG", asset: "GREEN ENERGY", type: "Transition Index" }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: true });
  }
}
