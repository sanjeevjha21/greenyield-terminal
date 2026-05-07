=export default async function handler(req, res) {
  const { country } = req.query;
  const NEWS_KEY = process.env.NEWS_API_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  const registry = {
    "India": { iso: "IN", ticker: "RELIANCE.NS", bench: "NIFTY 50" },
    "Egypt": { iso: "EG", ticker: "HRHO.CA", bench: "EGX 30" },
    "China": { iso: "CN", ticker: "BABA", bench: "CSI 300" },
    "Germany": { iso: "DE", ticker: "SAP.DE", bench: "DAX 40" },
    "Japan": { iso: "JP", ticker: "7203.T", bench: "NIKKEI 225" },
    "United States of America": { iso: "US", ticker: "NVDA", bench: "S&P 500" },
    "United Kingdom": { iso: "GB", ticker: "BP.L", bench: "FTSE 100" },
    "Brazil": { iso: "BR", ticker: "VALE3.SA", bench: "IBOVESPA" }
  };

  const config = registry[country];

  try {
    const query = encodeURIComponent(`"${country}" AND (geopolitics OR macroeconomics OR "central bank")`);
    const [newsRes, stockRes] = await Promise.all([
      fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=relevancy&pageSize=5&apiKey=${NEWS_KEY}`),
      config ? fetch(`https://finnhub.io/api/v1/quote?symbol=${config.ticker}&token=${FINNHUB_KEY}`) : Promise.resolve(null)
    ]);

    const newsData = await newsRes.json();
    const stock = stockRes ? await stockRes.json() : null;

    res.status(200).json({
      flag: config ? `https://flagsapi.com/${config.iso}/flat/64.png` : null,
      iso: config ? config.iso : null,
      news: newsData.articles?.map(a => a.title).slice(0, 5) || ["Searching regional archives..."],
      price: stock?.c || "0.00",
      change: stock?.dp || "0.00",
      bench: config?.bench || "GLOBAL BENCHMARK",
      ticker: config?.ticker || "N/A",
      portfolio: [
        { cat: "EQUITY", asset: config?.ticker || "N/A", inst: "Spot / Long", risk: "MOD" },
        { cat: "DERIVATIVE", asset: `${config?.ticker || 'INDEX'} CALL`, inst: "Option", risk: "HIGH" },
        { cat: "FUTURE", asset: `${config?.bench || 'REGIONAL'} FUT`, inst: "Futures", risk: "HIGH" },
        { cat: "FIXED INCOME", asset: `${country} 10Y`, inst: "Govt Bond", risk: "LOW" },
        { cat: "ESG/GREEN", asset: "RENEWABLE ETF", inst: "Green Transition", risk: "MED" }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: true });
  }
}
